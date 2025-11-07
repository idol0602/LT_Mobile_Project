export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number | null;
  answerText?: string;
}
