import { Language } from "@/lib/translations";

export interface SubjectTranslations {
  subjects: string;
  subjectsDesc: string;
  createSubject: string;
  editSubject: string;
  deleteSubject: string;
  subjectTitle: string;
  subjectTitlePlaceholder: string;
  subjectDescription: string;
  subjectDescriptionPlaceholder: string;
  subjectCode: string;
  subjectCodePlaceholder: string;
  department: string;
  departmentPlaceholder: string;
  thumbnail: string;
  lectures: string;
  summaries: string;
  records: string;
  quizzes: string;
  addLecture: string;
  addSummary: string;
  addRecord: string;
  addQuiz: string;
  removeLecture: string;
  removeSummary: string;
  removeRecord: string;
  removeQuiz: string;
  lectureTitle: string;
  videoUrl: string;
  fileUrl: string;
  audioUrl: string;
  duration: string;
  durationInMinutes: string;
  questions: string;
  addQuestion: string;
  questionText: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  startQuiz: string;
  noLectures: string;
  noSummaries: string;
  noRecords: string;
  noQuizzes: string;
  totalMaterials: string;
  viewSubject: string;
  createdBy: string;
  allDepartments: string;
  searchSubjects: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
}

export const subjectTranslations: Record<Language, SubjectTranslations> = {
  en: {
    subjects: "Nursing Subjects",
    subjectsDesc: "Access nursing lectures, study summaries, audio records, and interactive quizzes",
    createSubject: "Create New Subject",
    editSubject: "Edit Subject",
    deleteSubject: "Delete Subject",
    subjectTitle: "Subject Title",
    subjectTitlePlaceholder: "e.g. Adult Health Nursing",
    subjectDescription: "Description",
    subjectDescriptionPlaceholder: "Comprehensive overview of the subject curriculum...",
    subjectCode: "Course Code",
    subjectCodePlaceholder: "e.g. NUR-201",
    department: "Department",
    departmentPlaceholder: "e.g. Medical-Surgical Nursing",
    thumbnail: "Cover Thumbnail",
    lectures: "Lectures",
    summaries: "Summaries",
    records: "Audio Records",
    quizzes: "Interactive Quizzes",
    addLecture: "Add Lecture",
    addSummary: "Add Summary",
    addRecord: "Add Audio Record",
    addQuiz: "Add Quiz",
    removeLecture: "Remove Lecture",
    removeSummary: "Remove Summary",
    removeRecord: "Remove Audio Record",
    removeQuiz: "Remove Quiz",
    lectureTitle: "Lecture Title",
    videoUrl: "Video / Stream URL",
    fileUrl: "Document / PDF File URL",
    audioUrl: "Audio File URL",
    duration: "Duration",
    durationInMinutes: "Duration (minutes)",
    questions: "Questions",
    addQuestion: "Add Question",
    questionText: "Question Text",
    options: "Options (comma-separated or one per line)",
    correctAnswer: "Correct Answer (must match one option)",
    explanation: "Explanation (optional)",
    startQuiz: "Start Quiz",
    noLectures: "No lectures have been added to this subject yet.",
    noSummaries: "No study summaries uploaded yet.",
    noRecords: "No audio recordings available yet.",
    noQuizzes: "No quizzes available for this subject yet.",
    totalMaterials: "Materials",
    viewSubject: "Explore Subject",
    createdBy: "Instructor / Admin",
    allDepartments: "All Departments",
    searchSubjects: "Search subjects, code, or department...",
    deleteConfirmTitle: "Delete Subject",
    deleteConfirmDesc: "Are you sure you want to delete this subject? All associated lectures, summaries, records, and quizzes will be removed permanently.",
  },
  ar: {
    subjects: "المواد التمريضية",
    subjectsDesc: "محاضرات تمريضية، ملخصات دراسية، تسجيلات صوتية، واختبارات تفاعلية",
    createSubject: "إضافة مادة دراسية جديدة",
    editSubject: "تعديل المادة الدراسية",
    deleteSubject: "حذف المادة الدراسية",
    subjectTitle: "اسم المادة الدراسية",
    subjectTitlePlaceholder: "مثال: تمريض صحة البالغين",
    subjectDescription: "وصف المادة الدراسية",
    subjectDescriptionPlaceholder: "نظرة عامة وشاملة عن محتوى ومنهج المادة...",
    subjectCode: "كود المادة",
    subjectCodePlaceholder: "مثال: NUR-201",
    department: "القسم / التخصص",
    departmentPlaceholder: "مثال: تمريض باطني وجراحي",
    thumbnail: "صورة الغلاف",
    lectures: "المحاضرات",
    summaries: "الملخصات",
    records: "التسجيلات الصوتية",
    quizzes: "الاختبارات التفاعلية",
    addLecture: "إضافة محاضرة",
    addSummary: "إضافة ملخص",
    addRecord: "إضافة تسجيل صوتي",
    addQuiz: "إضافة اختبار",
    removeLecture: "حذف المحاضرة",
    removeSummary: "حذف الملخص",
    removeRecord: "حذف التسجيل",
    removeQuiz: "حذف الاختبار",
    lectureTitle: "عنوان المحاضرة",
    videoUrl: "رابط الفيديو",
    fileUrl: "رابط الملف / الـ PDF",
    audioUrl: "رابط الملف الصوتي",
    duration: "المدة",
    durationInMinutes: "المدة بالدقائق",
    questions: "الأسئلة",
    addQuestion: "إضافة سؤال",
    questionText: "نص السؤال",
    options: "الاختيارات (مفصولة بفاصلة أو سطر جديد)",
    correctAnswer: "الإجابة الصحيحة",
    explanation: "التفسير أو التوضيح (اختياري)",
    startQuiz: "بدء الاختبار",
    noLectures: "لم يتم إضافة أي محاضرات في هذه المادة بعد.",
    noSummaries: "لا توجد ملخصات دراسية مرفوعة حتى الآن.",
    noRecords: "لا توجد تسجيلات صوتية متاحة حالياً.",
    noQuizzes: "لا توجد اختبارات تفاعلية لهذه المادة حالياً.",
    totalMaterials: "المحتويات",
    viewSubject: "استكشاف المادة",
    createdBy: "المشرف / المحاضر",
    allDepartments: "جميع الأقسام",
    searchSubjects: "ابحث بالاسم، الكود، أو القسم...",
    deleteConfirmTitle: "حذف المادة الدراسية",
    deleteConfirmDesc: "هل أنت متأكد من رغبتك في حذف هذه المادة؟ سيتم مسح جميع المحاضرات، الملخصات، التسجيلات، والاختبارات التابعة لها نهائياً.",
  },
};
