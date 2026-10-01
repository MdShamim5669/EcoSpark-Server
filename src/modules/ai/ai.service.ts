import { IdeaStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import {
  IAskQueryPayload,
  IAskResponse,
  IIdeaDocument,
  IRetrievedSource,
  ISimilarIdeasPayload,
} from "./ai.interface";
import { geminiClient } from "./gemini.client";

export class AiService {
  private static documents: IIdeaDocument[] = [];
  private static lastIndexedAt: number = 0;
  private static isIndexing: boolean = false;
  private static readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Calculate cosine similarity between two numerical vectors
   */
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Token-based Jaccard / lexical relevance score (Fallback when embeddings are unavailable)
   */
  private static lexicalSimilarity(query: string, documentText: string): number {
    const tokenize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);

    const queryTokens = new Set(tokenize(query));
    const docTokens = new Set(tokenize(documentText));

    if (queryTokens.size === 0 || docTokens.size === 0) return 0;

    let intersection = 0;
    for (const token of queryTokens) {
      if (docTokens.has(token)) {
        intersection++;
      }
    }

    const union = new Set([...queryTokens, ...docTokens]).size;
    return union > 0 ? (intersection / union) * 2.5 : 0; // scaled for comparable weight
  }

  /**
   * Loads approved ideas from Postgres into in-memory document index
   */
  public static async getIndexedDocuments(forceRefresh: boolean = false): Promise<IIdeaDocument[]> {
    const now = Date.now();
    if (!forceRefresh && this.documents.length > 0 && now - this.lastIndexedAt < this.CACHE_TTL_MS) {
      return this.documents;
    }

    if (this.isIndexing) {
      return this.documents;
    }

    this.isIndexing = true;
    try {
      const approvedIdeas = await prisma.idea.findMany({
        where: { status: IdeaStatus.APPROVED },
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Index top 100 recent approved ideas
      });

      const docs: IIdeaDocument[] = approvedIdeas.map((idea) => {
        const text = `Title: ${idea.title}\nCategory: ${idea.category.name}\nProblem Statement: ${idea.problemStatement}\nProposed Solution: ${idea.proposedSolution}\nDescription: ${idea.description}`;
        return {
          id: idea.id,
          title: idea.title,
          problemStatement: idea.problemStatement,
          proposedSolution: idea.proposedSolution,
          description: idea.description,
          categoryName: idea.category.name,
          categoryId: idea.category.id,
          isPaid: idea.isPaid,
          price: idea.price ? Number(idea.price) : null,
          authorName: idea.author.name || "Community Member",
          text,
        };
      });

      // Optionally pre-compute embeddings if Gemini is configured
      if (geminiClient.isConfigured()) {
        for (const doc of docs) {
          try {
            const summaryForEmbedding = `${doc.title}. ${doc.categoryName}. ${doc.problemStatement.slice(0, 300)}. ${doc.proposedSolution.slice(0, 300)}`;
            doc.embedding = (await geminiClient.generateEmbedding(summaryForEmbedding)) || undefined;
          } catch {
            // Soft failure, will fallback to lexical search
          }
        }
      }

      this.documents = docs;
      this.lastIndexedAt = now;
      return this.documents;
    } catch (err) {
      console.error("[AiService] Error indexing ideas:", err);
      return this.documents;
    } finally {
      this.isIndexing = false;
    }
  }

  /**
   * Retrieves relevant community initiatives using Vector / Hybrid Semantic Search
   */
  public static async retrieveRelevantIdeas(
    query: string,
    limit: number = 4
  ): Promise<Array<{ document: IIdeaDocument; similarity: number }>> {
    const docs = await this.getIndexedDocuments();
    if (docs.length === 0) return [];

    let queryEmbedding: number[] | null = null;
    if (geminiClient.isConfigured()) {
      queryEmbedding = await geminiClient.generateEmbedding(query);
    }

    const scoredDocs = docs.map((doc) => {
      let score = 0;
      if (queryEmbedding && doc.embedding) {
        score = this.cosineSimilarity(queryEmbedding, doc.embedding);
      } else {
        score = this.lexicalSimilarity(query, doc.text);
      }
      return { document: doc, similarity: Math.round(score * 100) / 100 };
    });

    // Sort descending by similarity
    scoredDocs.sort((a, b) => b.similarity - a.similarity);

    return scoredDocs.slice(0, limit);
  }

  /**
   * Main RAG Query: Takes user query, retrieves top context, generates grounded answer
   */
  public static async askAdvisor(payload: IAskQueryPayload): Promise<IAskResponse> {
    const { query, history = [] } = payload;
    const scoredDocs = await this.retrieveRelevantIdeas(query, 4);

    const relevantDocs = scoredDocs.filter((item) => item.similarity > 0.1 || scoredDocs.indexOf(item) < 2);

    const sources: IRetrievedSource[] = relevantDocs.map(({ document, similarity }) => ({
      id: document.id,
      title: document.title,
      category: document.categoryName,
      similarity,
      problemStatement: document.problemStatement,
      proposedSolution: document.proposedSolution,
      isPaid: document.isPaid,
      price: document.price,
      authorName: document.authorName,
    }));

    // Formulate Context for the LLM
    let contextText = "No community initiatives match your exact query.";
    if (sources.length > 0) {
      contextText = sources
        .map(
          (s, idx) =>
            `[Initiative ${idx + 1}] ID: ${s.id} | Title: "${s.title}" | Category: ${s.category} | Author: ${s.authorName}
Problem: ${s.problemStatement}
Solution: ${s.proposedSolution}
Link: /ideas/${s.id}`
        )
        .join("\n\n");
    }

    const systemInstruction = `You are "SparkAI", the expert Eco-Advisor for EcoSpark Hub (a collaborative sustainability, clean-tech, and green innovation platform).
Your mission is to provide clear, inspiring, and scientifically grounded solutions to environmental and sustainability challenges.

Formatting & Structure Guidelines:
1. Ground your recommendations in the community-created blueprints provided in the context whenever applicable.
2. Structure your response with clean Markdown:
   - 🌿 **Overview:** A concise direct synthesis answering the user's inquiry (1-2 sentences).
   - 🛠️ **Key Action Steps:** 3 practical, concrete implementation milestones or considerations.
   - 💡 **Featured Blueprints:** When referencing any initiative from the context, integrate it smoothly with a markdown link in the format [Title](/ideas/{id}) and 1 sentence explaining its practical relevance. (DO NOT copy-paste raw "Problem: ... Solution: ..." blocks).
   - 🎯 **Community Pro-Tip:** A motivating next action (e.g. collaborating with authors or adapting the open blueprints).
3. If no blueprints match the inquiry, provide practical sustainable best practices and encourage submitting a new blueprint to EcoSpark Hub.
4. Keep the tone warm, actionable, and elegant.`;

    const userPrompt = `Context from EcoSpark Hub Database:
${contextText}

User Question:
"${query}"

Please answer the user's question, integrating relevant community blueprints from the context above where applicable.`;

    // Try Gemini LLM generation
    let answer: string | null = null;
    let usedAiModel = "gemini-3.8-flash";

    if (geminiClient.isConfigured()) {
      answer = await geminiClient.generateAnswer(systemInstruction, userPrompt, history);
    }

    // Heuristic fallback if Gemini is not configured or fails
    if (!answer) {
      usedAiModel = "ecospark-heuristic-advisor";
      if (sources.length > 0) {
        const topSource = sources[0];
        answer =
          `### 🌿 Executive Overview\n` +
          `Based on your focus on **"${query}"**, our community has published proven blueprints addressing this challenge:\n\n` +
          `### 🛠️ Strategic Action Steps\n` +
          `1. **Feasibility & Resource Assessment:** Evaluate site readiness, baseline energy/waste flows, and localized community demand.\n` +
          `2. **Decentralized Deployment:** Implement modular, scalable infrastructure using open-hardware blueprints to keep lifecycle costs low.\n` +
          `3. **Community Ownership & Monitoring:** Engage local stakeholders with transparent tracking and shared benefits.\n\n` +
          `### 💡 Recommended Community Blueprints\n` +
          sources
            .slice(0, 3)
            .map(
              (s) =>
                `- **[${s.title}](/ideas/${s.id})** (${s.category}): Addresses ${s.problemStatement.toLowerCase().slice(0, 90)}... by implementing ${s.proposedSolution.toLowerCase().slice(0, 100)}.`
            )
            .join("\n") +
          `\n\n> 💡 **Community Pro-Tip:** You can connect directly with innovators like **${topSource.authorName}** or view their complete engineering blueprints on EcoSpark Hub!`;
      } else {
        answer =
          `### 🌿 Sustainable Best Practices\n\n` +
          `Thank you for asking about **"${query}"**! While our community doesn't yet have an exact blueprint for this scenario, here is how to take action:\n\n` +
          `1. **Baseline Audit:** Quantify current resource usage, waste generation, or energy draw before making modifications.\n` +
          `2. **Circular Lifecycle:** Prioritize reduction, material reuse, and closed-loop systems over single-use alternatives.\n` +
          `3. **Pioneer a Blueprint:** You can be the first to introduce this idea! Click **Submit Idea** in the navigation bar to share your project and receive votes and collaboration from fellow innovators.`;
      }
    }

    return {
      answer,
      sources,
      usedAiModel,
    };
  }

  /**
   * Find similar initiatives during idea creation to avoid duplication
   */
  public static async findSimilarIdeas(payload: ISimilarIdeasPayload): Promise<IRetrievedSource[]> {
    const query = `${payload.title || ""} ${payload.problemStatement} ${payload.proposedSolution || ""}`.trim();
    const scoredDocs = await this.retrieveRelevantIdeas(query, payload.limit || 5);

    return scoredDocs
      .filter((item) => item.similarity > 0.04)
      .map(({ document, similarity }) => ({
        id: document.id,
        title: document.title,
        category: document.categoryName,
        similarity,
        problemStatement: document.problemStatement,
        proposedSolution: document.proposedSolution,
        isPaid: document.isPaid,
        price: document.price,
        authorName: document.authorName,
      }));
  }

  /**
   * Status check of the AI system
   */
  public static async getSystemStatus() {
    const docs = await this.getIndexedDocuments();
    return {
      isGeminiConfigured: geminiClient.isConfigured(),
      indexedApprovedIdeas: docs.length,
      lastIndexedAt: new Date(this.lastIndexedAt).toISOString(),
      activeModel: geminiClient.isConfigured() ? "gemini-3.8-flash" : "ecospark-heuristic-advisor",
    };
  }

  /**
   * Force sync embeddings and document index
   */
  public static async syncEmbeddings() {
    const docs = await this.getIndexedDocuments(true);
    return {
      message: "Embeddings and documents synchronized successfully",
      indexedCount: docs.length,
      timestamp: new Date().toISOString(),
    };
  }
}
