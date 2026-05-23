export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  student: {
    root: "/student",
    dashboard: "/student",
    marks: "/student/marks",
    weakTopics: "/student/weak-topics",
    readiness: "/student/readiness",
    studyPlanner: "/student/study-planner",
  },
  teacher: {
    root: "/teacher",
    dashboard: "/teacher",
    attendance: "/teacher/attendance",
    classes: "/teacher/classes",
    analytics: "/teacher/analytics",
    assistant: "/teacher/assistant",
    uploadData: "/teacher/upload-data",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin",
    students: "/admin/students",
    attendance: "/admin/attendance",
    classes: "/admin/classes",
    teachers: "/admin/teachers",
    interventions: "/admin/interventions",
  },
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
