export interface ListeningQuestion {
  id: string;
  audioFile?: File | null;
  audioUrl?: string;
  answerText: string;
}
