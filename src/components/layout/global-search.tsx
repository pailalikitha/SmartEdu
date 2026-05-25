"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { requireFirestore } from "@/lib/firebase/firestore/query";
import { COLLECTIONS } from "@/lib/firebase/firestore/constants";
import { ROUTES } from "@/constants/routes";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { getStudentFullName, type Student } from "@/types/student";
import type { ClassRoom } from "@/types/class";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "student" | "teacher" | "class";
  href: string;
  initials: string;
};

type GlobalSearchProps = {
  role?: "teacher" | "admin" | "student" | "parent";
  onCloseMobile?: () => void;
  autoFocus?: boolean;
};

export function GlobalSearch({ role, onCloseMobile, autoFocus }: GlobalSearchProps) {
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedTerm = useDebounce(term, 300);
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";

  const { classes } = useTeacherClassesSnapshot(isTeacher ? "current" : undefined);
  const teacherClassIds = classes.map((c) => c.id);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
        if (onCloseMobile) onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseMobile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedTerm.length < 2 || (!isTeacher && !isAdmin)) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    const db = requireFirestore();
    const searchStr = debouncedTerm.trim();
    // Capitalize first letter for first name search
    const capSearch = searchStr.charAt(0).toUpperCase() + searchStr.slice(1);
    const endStr = capSearch + "\uf8ff";

    const unsubs: (() => void)[] = [];
    let students: SearchResult[] = [];
    let teachers: SearchResult[] = [];
    let classResults: SearchResult[] = [];

    const updateResults = () => {
      let combined = [...students, ...teachers, ...classResults];
      if (isTeacher) {
        combined = students;
      }
      setResults(combined.slice(0, 6));
      setLoading(false);
    };

    // 1. Search Students
    const studentQ = query(
      collection(db, COLLECTIONS.students),
      where("firstName", ">=", capSearch),
      where("firstName", "<=", endStr),
      limit(20)
    );

    unsubs.push(
      onSnapshot(studentQ, (snap) => {
        let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
        if (isTeacher) {
          docs = docs.filter((s) => s.classId && teacherClassIds.includes(s.classId));
        }
        students = docs.map((s) => ({
          id: s.id,
          title: getStudentFullName(s),
          subtitle: `Class: ${s.grade}-${s.section} | Roll: ${s.rollNumber}`,
          type: "student",
          href: isTeacher ? ROUTES.teacher.studentDetail(s.id) : ROUTES.admin.studentDetail(s.id),
          initials: s.firstName.charAt(0).toUpperCase(),
        }));
        updateResults();
      })
    );

    // 2. Search Teachers (Admin only)
    if (isAdmin) {
      const lowerSearch = searchStr.toLowerCase();
      const endLowerStr = lowerSearch + "\uf8ff";

      // Since teacher names might not be perfectly capitalized, and we want to do prefix search:
      const teacherQ = query(
        collection(db, COLLECTIONS.teachers),
        where("name", ">=", capSearch),
        where("name", "<=", endStr),
        limit(6)
      );
      unsubs.push(
        onSnapshot(teacherQ, (snap) => {
          teachers = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: data.name,
              subtitle: `Subjects: ${Array.isArray(data.subjects) ? data.subjects.join(", ") : (data.subject || "—")}`,
              type: "teacher",
              href: ROUTES.admin.teachers,
              initials: data.name?.charAt(0).toUpperCase() || "T",
            };
          });
          updateResults();
        })
      );

      // 3. Search Classes (Admin only)
      const classQ = query(
        collection(db, COLLECTIONS.classes),
        where("name", ">=", searchStr),
        where("name", "<=", searchStr + "\uf8ff"),
        limit(6)
      );
      unsubs.push(
        onSnapshot(classQ, (snap) => {
          classResults = snap.docs.map((d) => {
            const data = d.data() as ClassRoom;
            return {
              id: d.id,
              title: data.name,
              subtitle: `Section: ${data.section} | Subject: ${data.subject}`,
              type: "class",
              href: ROUTES.admin.classes,
              initials: data.name?.charAt(0).toUpperCase() || "C",
            };
          });
          updateResults();
        })
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [debouncedTerm, isTeacher, isAdmin, teacherClassIds]);

  if (!isTeacher && !isAdmin) return null;

  return (
    <div className="relative w-full max-w-md flex-1" ref={containerRef}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search students, classes, subjects... (Ctrl+K)"
        className="h-9 w-full bg-muted/60 pl-9 pr-12 lg:h-10"
        aria-label="Global search"
      />
      <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground hidden lg:flex items-center gap-1">
        <kbd className="rounded border border-border bg-muted px-1.5 font-sans">⌘K</kbd>
      </div>

      {isOpen && debouncedTerm.length >= 2 && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Results</div>
              <ul className="space-y-1">
                {results.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <Link
                      href={result.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {result.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{term}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
