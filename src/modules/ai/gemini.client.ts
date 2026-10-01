import { GoogleGenAI } from "@google/genai";
import config from "../../config";
import { IChatMessage } from "./ai.interface";

class GeminiClient {
  private ai: GoogleGenAI | null = null;
  private apiKey: string = "";

  constructor() {
    this.apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY || "";
    if (this.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error("[GeminiClient] Initialization error:", err);
        this.ai = null;
      }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.ai);
  }

  /**
   * Generates a 768-dim vector embedding using text-embedding-004
   */
  public async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.ai) return null;

    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: [text.slice(0, 2048)], // truncate safely for embedding token limits
      });

      const values = response.embeddings?.[0]?.values;
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
      return null;
    } catch (error) {
      console.warn("[GeminiClient] Embedding generation failed:", error instanceof Error ? error.message : error);
      return null;
    }
  }

  /**
   * Generates a conversational RAG answer using gemini-3.8-flash
   */
  public async generateAnswer(
    systemInstruction: string,
    userPrompt: string,
    history: IChatMessage[] = []
  ): Promise<string | null> {
    if (!this.ai) return null;

    try {
      // Build contents array supporting conversational history
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }

      contents.push({
        role: "user",
        parts: [{ text: userPrompt }],
      });

      const response = await this.ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1200,
        },
      });

      return response.text || null;
    } catch (error) {
      console.warn("[GeminiClient] Answer generation failed:", error instanceof Error ? error.message : error);
      return null;
    }
  }
}

export const geminiClient = new GeminiClient();
