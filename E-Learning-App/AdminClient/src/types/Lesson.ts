export interface Lesson {
  _id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "";
  topic: string;
  type: "vocab" | "listen" | "grammar" | "reading" | "";
  vocabularies?: string[];
  readingContent?: string;
  questions?: any[];
}