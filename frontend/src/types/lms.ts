export type CourseStatus = "ACTIVO" | "CERRADO";
export type LessonType = "video" | "text" | "image" | "pdf" | "file" | "interactive";
export type InteractionType = "multiple_choice" | "true_false" | "ordering" | "matching";
export interface InteractionDraft {
  type: InteractionType;
  prompt: string;
  options: string[];
  correctAnswers: number[];
  pairs: Array<{ left: string; right: string }>;
  explanation: string;
}
export interface LessonDraft {
  id?: string;
  title: string;
  type: LessonType;
  content: string;
  mediaUrl: string;
  durationMinutes: number;
  isPreview: boolean;
  interaction?: InteractionDraft;
}
export interface ModuleDraft {
  id?: string;
  title: string;
  description: string;
  lessons: LessonDraft[];
}
export interface ExamQuestionDraft {
  id?: string;
  prompt: string;
  type: "single_choice";
  options: string[];
  correctAnswers: number[];
  points: number;
}
export interface FinalExamDraft {
  title: string;
  instructions: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScore: number;
  questions: ExamQuestionDraft[];
}
export interface LmsCourse {
  id: string;
  slug: string;
  name: string;
  trainingArea: TrainingArea;
  shortDescription: string;
  fullDescription: string;
  coverUrl?: string;
  modality: string;
  duration: string;
  certification: string;
  endorsement: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  status: CourseStatus;
  modulesCount: number;
  lessonsCount: number;
  hasFinalExam: boolean;
  modules?: ModuleDraft[];
  finalExam?: FinalExamDraft;
}
export interface TrainingArea {
  id: string;
  name: string;
  coursesCount?: number;
}
