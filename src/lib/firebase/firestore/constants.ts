/** Top-level Firestore collection names */
export const COLLECTIONS = {
  users: "users",
  students: "students",
  attendance: "attendance",
  studyTasks: "studyTasks",
} as const;

/** Default page size for list queries (stay under 1 MiB per response) */
export const DEFAULT_QUERY_LIMIT = 200;

/** Firestore batch write limit is 500 operations */
export const BATCH_WRITE_CHUNK = 450;
