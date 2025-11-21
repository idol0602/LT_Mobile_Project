// ============ SHARED TYPES FOR BEAR ENGLISH APP ============

// --- Common Types ---
export interface ApiResponse<T = any> {
  data: T;
  success?: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Lesson Types ---
export interface Lesson {
  _id: string;
  name: string;
  level?: string;
  topic?: string;
  type?: string;
  questions?: Question[];
  readingContent?: string;
  vocabularies?: Vocabulary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  _id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  type?: 'multiple-choice' | 'true-false' | 'fill-blank';
}

// --- Reading Question Type ---
export interface ReadingQuestion {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number | null;
  answerText?: string;
  audioFileId?: string;
}

// --- Reading Lesson Type ---
export interface ReadingLesson extends Omit<Lesson, 'questions'> {
  questions?: ReadingQuestion[];
  readingContent: string;
}

// --- Grammar Question Type ---
export interface GrammarQuestion {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number | null;
  answerText?: string;
}

// --- Grammar Lesson Type ---
export interface GrammarLesson extends Omit<Lesson, 'questions'> {
  questions?: GrammarQuestion[];
  readingContent?: string; // Grammar explanation content
}

// --- Vocabulary Types ---
export interface Vocabulary {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  audioUrl?: string;
  imageFileId?: string;
  audioFileId?: string;
}

// Word is an alias for Vocabulary for backward compatibility
export type Word = Vocabulary;

// --- AI & Utils Types ---
export interface ChatResponse {
  reply: string;
  success?: boolean;
}

export interface TranslateResponse {
  translated: string;
  sourceIpa?: string;
  ipa?: string;
  originalAudio?: string;
  translatedAudio?: string;
  success?: boolean;
}

export interface PronounResponse {
  success: boolean;
  transcription?: string;
  duration_seconds?: number;
  aai_id?: string;
  accuracy_percentage?: number;
}

// --- Vocabulary Study Types ---
export interface StageStats {
  correct: number;
  incorrect: number;
}

export interface VocabularyStudyState {
  stage: number;
  allWords: Word[];
  currentWords: Word[];
  completedWords: Set<string>;
  currentIndex: number;
  roundCount: number;
  stageStats: Record<number, StageStats>;
}

// --- Matching Game Types ---
export interface MatchingItem {
  id: string;
  text: string;
}

// --- Audio Types ---
export interface AudioFile {
  uri: string;
  name: string;
  type: string;
}

// --- Component Props Types ---
export interface VocabularyCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer?: (remembered: boolean) => void;
  showActions?: boolean;
  cardIndex?: number;
  totalCards?: number;
}

// --- Navigation Types ---
export interface VocabularyStudyParams {
  lessonId: string;
  lessonTitle?: string;
}

// --- Theme Types ---
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  error: string;
  warning: string;
}

// --- Animation Types ---
export interface AnimationConfig {
  duration: number;
  damping?: number;
  stiffness?: number;
}

export type FeedbackType = 'correct' | 'incorrect' | null;

// --- Error Types ---
export interface AppError extends Error {
  code?: string;
  status?: number;
}

// --- API Request Types ---
export interface UploadAudioRequest {
  audio: AudioFile;
  primaryText: string;
}

export interface ChatRequest {
  text: string;
  userId: string;
  conversationId?: string;
}

export interface TranslateRequest {
  text: string;
  targetLanguage?: string;
  sourceLanguage?: string;
}

// --- Chat/AI Modal Types ---
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}