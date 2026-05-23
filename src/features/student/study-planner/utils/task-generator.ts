import { getWeekDates, toDateString } from "@/lib/utils/date";
import type { ExamGoal, StudyTaskInput, TaskPriority } from "@/types/study-planner";

export type GeneratePlanInput = {
  studentId: string;
  weekStart: Date;
  subjects: string[];
  weakTopics: string[];
  hoursPerDay: number;
  examGoal: ExamGoal;
};

const TIME_SLOTS = [
  "06:30",
  "08:00",
  "10:00",
  "14:00",
  "16:00",
  "18:30",
  "20:00",
];

const TOPIC_BANK: Record<string, string[]> = {
  Mathematics: [
    "Calculus — Integration",
    "Algebra — Quadratic equations",
    "Trigonometry — Identities",
    "Coordinate geometry",
    "Probability & statistics",
  ],
  Physics: [
    "Mechanics — Newton's laws",
    "Electromagnetism",
    "Optics — Ray diagrams",
    "Thermodynamics",
    "Modern physics",
  ],
  Chemistry: [
    "Organic chemistry — Reactions",
    "Physical chemistry — Mole concept",
    "Inorganic — Periodic table",
    "Electrochemistry",
    "Chemical bonding",
  ],
  Biology: [
    "Cell biology",
    "Genetics — Mendelian inheritance",
    "Human physiology",
    "Ecology",
    "Plant morphology",
  ],
  English: [
    "Reading comprehension",
    "Grammar — Tenses",
    "Essay writing",
    "Vocabulary building",
    "Literature analysis",
  ],
};

const EXAM_FOCUS: Record<ExamGoal, string[]> = {
  Board: ["Mathematics", "Physics", "Chemistry", "English"],
  JEE: ["Mathematics", "Physics", "Chemistry"],
  NEET: ["Biology", "Chemistry", "Physics"],
  General: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
};

function pickTopic(subject: string, weakTopics: string[]): string {
  const weak = weakTopics.find(
    (t) => t.toLowerCase().includes(subject.toLowerCase().slice(0, 4)),
  );
  if (weak) return weak;

  const bank = TOPIC_BANK[subject] ?? ["Revision & practice"];
  return bank[Math.floor(Math.random() * bank.length)]!;
}

function pickPriority(subject: string, weakTopics: string[], examGoal: ExamGoal): TaskPriority {
  const focus = EXAM_FOCUS[examGoal];
  const isFocus = focus.includes(subject);
  const isWeak = weakTopics.some((t) =>
    t.toLowerCase().includes(subject.toLowerCase().slice(0, 4)),
  );
  if (isWeak || (isFocus && examGoal !== "General")) return "high";
  if (isFocus) return "medium";
  return "low";
}

export function generateWeeklyStudyTasks(
  input: GeneratePlanInput,
): Omit<StudyTaskInput, "studentId">[] {
  const { subjects, weakTopics, hoursPerDay, examGoal, weekStart } = input;
  const weekDates = getWeekDates(weekStart);
  const tasksPerDay = Math.max(1, Math.min(4, Math.round(hoursPerDay / 0.75)));
  const tasks: Omit<StudyTaskInput, "studentId">[] = [];
  let slotIndex = 0;

  for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
    const date = weekDates[dayIdx]!;
    const dateStr = toDateString(date);
    const daySubjects = [...subjects].sort(() => Math.random() - 0.5);

    for (let i = 0; i < tasksPerDay && i < daySubjects.length; i++) {
      const subject = daySubjects[i % daySubjects.length]!;
      const durationMinutes = hoursPerDay >= 3 ? 60 : 45;
      const topic = pickTopic(subject, weakTopics);
      const priority = pickPriority(subject, weakTopics, examGoal);

      tasks.push({
        title: `${subject}: ${topic.split("—")[0]?.trim() ?? topic}`,
        subject,
        topic,
        scheduledDate: dateStr,
        startTime: TIME_SLOTS[slotIndex % TIME_SLOTS.length],
        durationMinutes,
        status: "pending",
        priority,
        source: "ai",
        notes:
          examGoal !== "General"
            ? `AI plan · ${examGoal} focus`
            : "AI-generated study block",
      });
      slotIndex += 1;
    }
  }

  if (subjects.length > 0) {
    const sunday = weekDates[6]!;
    tasks.push({
      title: "Weekly revision & mock questions",
      subject: subjects[0]!,
      topic: "Mixed revision",
      scheduledDate: toDateString(sunday),
      startTime: "10:00",
      durationMinutes: 90,
      status: "pending",
      priority: "medium",
      source: "ai",
      notes: "Consolidate the week's learning",
    });
  }

  return tasks;
}
