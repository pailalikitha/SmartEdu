export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
    daysInMonth: end.getDate(),
    label: new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
    }).format(start),
  };
}

export function parseMonthValue(value: string): { year: number; month: number } {
  const [y, m] = value.split("-").map(Number);
  return { year: y, month: m };
}

export function toMonthValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getCurrentMonthValue(): string {
  const now = new Date();
  return toMonthValue(now.getFullYear(), now.getMonth() + 1);
}

/** Monday of the week containing `date` */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${weekStart.toLocaleDateString("en-IN", opts)} – ${weekEnd.toLocaleDateString("en-IN", { ...opts, year: "numeric" })}`;
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}
