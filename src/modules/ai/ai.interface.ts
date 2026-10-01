export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IAskQueryPayload {
  query: string;
  history?: IChatMessage[];
  categoryId?: string;
}

export interface ISimilarIdeasPayload {
  title?: string;
  problemStatement: string;
  proposedSolution?: string;
  limit?: number;
}

export interface IRetrievedSource {
  id: string;
  title: string;
  category: string;
  similarity: number;
  problemStatement: string;
  proposedSolution: string;
  isPaid: boolean;
  price: number | null;
  authorName?: string;
}

export interface IAskResponse {
  answer: string;
  sources: IRetrievedSource[];
  usedAiModel: string;
}

export interface IIdeaDocument {
  id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  description: string;
  categoryName: string;
  categoryId: string;
  isPaid: boolean;
  price: number | null;
  authorName: string;
  embedding?: number[];
  text: string;
}
