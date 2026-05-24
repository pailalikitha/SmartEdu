/** Top-level Firestore collection names */
export const COLLECTIONS = {
  users: "users",
  teachers: "teachers",
  parents: "parents",
  students: "students",
  classes: "classes",
  attendance: "attendance",
  studyTasks: "studyTasks",
  marks: "marks",
  weakTopics: "weakTopics",
  activityLog: "activityLog",
  uploadHistory: "uploadHistory",
  notifications: "notifications",
  assignments: "assignments",
  settings: "settings",
  schoolActivity: "schoolActivity",
  notes: "notes",
} as const;

export const ASSIGNMENT_SUBCOLLECTIONS = {
  tasks: "tasks",
  submissions: "submissions",
} as const;

export const PARENT_SUBCOLLECTIONS = {
  alertSettings: "alertSettings",
} as const;

export const SETTINGS_DOCS = {
  school: "school",
} as const;

export const NOTIFICATION_SUBCOLLECTIONS = {
  items: "items",
} as const;

/** Nested under `attendance/{date}/classes/{classId}/students/{studentId}` */
export const ATTENDANCE_SUBCOLLECTIONS = {
  classes: "classes",
  students: "students",
} as const;

export const UPLOAD_HISTORY_SUBCOLLECTION = "logs";

export const UPLOAD_HISTORY_LIMIT = 10;

/** Firestore `in` query supports at most 10 values per clause */
export const FIRESTORE_IN_QUERY_LIMIT = 10;

export const STUDENT_SUBCOLLECTIONS = {
  markEntries: "entries",
  weakTopics: "topics",
  activityLogs: "logs",
} as const;

export const DASHBOARD_ACTIVITY_LIMIT = 5;

export const SCHOOL_ACTIVITY_LIMIT = 10;

/** Default page size for list queries (stay under 1 MiB per response) */
export const DEFAULT_QUERY_LIMIT = 200;

/** Firestore batch write limit is 500 operations */
export const BATCH_WRITE_CHUNK = 450;
