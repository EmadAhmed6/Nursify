export interface Question {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Lecture {
  _id?: string;
  title: string;
  description?: string;
  videoUrl?: string;
  fileUrl?: string;
  order?: number;
  createdAt?: string;
}

export interface Summary {
  _id?: string;
  title: string;
  description?: string;
  fileUrl: string;
  createdAt?: string;
}

export interface AudioRecord {
  _id?: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: string | number;
  createdAt?: string;
}

export interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  durationInMinutes: number;
  questions: Question[];
  createdAt?: string;
}

export interface SubjectAuthor {
  _id: string;
  fullName?: string;
  username: string;
  profilePicture?: {
    url?: string;
    publicId?: string | null;
  };
  role?: "student" | "admin" | "superadmin";
}

export interface Subject {
  _id: string;
  title: string;
  description: string;
  code?: string;
  department?: string;
  thumbnail?: {
    url: string;
    publicId: string | null;
  };
  createdBy: SubjectAuthor;
  lectures: Lecture[];
  summaries: Summary[];
  records: AudioRecord[];
  quizzes: Quiz[];
  lecturesCount?: number;
  summariesCount?: number;
  recordsCount?: number;
  quizzesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsResponse {
  subjects: Subject[];
  page: number;
  pages: number;
  limit: number;
  totalSubjects: number;
}

export interface SubjectProgress {
  _id?: string;
  user: string;
  subject: string;
  completedLectures: string[];
  completedSummaries: string[];
  completedRecords: string[];
  completedQuizzes: string[];
  percentage: number;
  updatedAt: string;
  createdAt: string;
}
