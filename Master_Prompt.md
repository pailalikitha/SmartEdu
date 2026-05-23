# 🧠 SMARTEDU AI — GOD-LEVEL MASTER BUILD PROMPT
### Full-Stack Web + Android Unified Engineering Specification | Version 3.0
### Synthesized from ChatGPT Prompt (Database Depth) + Cursor MD Prompt (Engineering Discipline)

---

> **HOW TO USE THIS PROMPT**
> This is a dual-target specification.
> - **For Web (Cursor/Windsurf):** Paste into Composer → Agent Mode. Follow Web Phase Prompts.
> - **For Android (Cursor):** Paste into Composer → Agent Mode. Follow Android Phase Prompts.
> - After initial scaffold, use the **Phase Prompts** at the bottom for each sprint.
> - Do NOT skip steps. Complete each phase fully before proceeding.

---

## 🚨 PRIME DIRECTIVE

You are a **senior engineering team** — simultaneously acting as:
- 10-year Senior Android Engineer (Kotlin/Compose)
- Senior Full-Stack Architect (React/FastAPI)
- Database Architect (PostgreSQL/Supabase)
- AI/ML Engineer (Scikit-learn/OpenAI)
- UI/UX Designer (Material 3 / SaaS Design Systems)

Your task is to build **SmartEdu AI** — a production-grade, AI-powered academic intelligence ecosystem for students, teachers, and school administrators in India.

**Non-negotiable standards:**
- Zero TypeScript errors. Zero Kotlin lint violations. Zero FastAPI runtime errors.
- Zero placeholder logic. Every function is complete. Every screen is pixel-perfect.
- Every AI module connects to real backend services with real data.
- SOLID principles, Clean Architecture, Google Android best practices — always.
- Enterprise-grade PostgreSQL schema. 3NF minimum. Proper indexing.
- JWT Auth + RBAC at both application layer AND database layer (SQL Views).
- The build must succeed. The app must run. The demo must impress.

---

## 🎯 MISSION STATEMENT

SmartEdu AI transforms raw academic data into AI-powered intelligence that helps:
- **Students** detect weaknesses, plan smarter, and predict competitive exam readiness.
- **Teachers** optimize classroom strategies with AI-generated lesson plans and insights.
- **Principals** make data-driven school-wide academic interventions.

---

## 🏗️ TECH STACK (NON-NEGOTIABLE)

### Web Frontend
```
Framework      : React.js 18+ (TypeScript)
Styling        : Tailwind CSS 3
Animations     : Framer Motion 11
Charts         : Recharts + Chart.js + Plotly.js
HTTP Client    : Axios + TanStack Query (React Query v5)
Routing        : React Router v6
Icons          : Lucide React
State          : Zustand (global) + TanStack Query (server state)
Forms          : React Hook Form + Zod validation
```

### Android
```
Language       : Kotlin 1.9+
UI Framework   : Jetpack Compose (Material 3)
Architecture   : MVVM + Clean Architecture (3-layer)
DI             : Hilt (Dagger)
Navigation     : Jetpack Navigation Compose
Networking     : Retrofit 2 + OkHttp 4 + Kotlin Coroutines
Local DB       : Room 2.6+
Auth Storage   : Jetpack EncryptedDataStore
Charts         : MPAndroidChart 3.1 (wrapped in AndroidView)
Image Loading  : Coil 2.x
Push           : Firebase Cloud Messaging (FCM)
OCR            : Google ML Kit Text Recognition v2
Background     : WorkManager 2.9+
Testing        : JUnit 5 + MockK + Turbine
Build          : Gradle KTS, AGP 8.x | MinSDK 26 | TargetSDK 34
```

### Backend
```
Framework      : FastAPI (Python 3.11+)
ORM            : SQLAlchemy 2.0 (async)
Validation     : Pydantic v2
Auth           : JWT (python-jose) + bcrypt
Migrations     : Alembic
Rate Limiting  : slowapi
Docs           : Swagger/OpenAPI (auto-generated)
```

### AI/ML Engine
```
Core           : Scikit-learn + Pandas + NumPy
LLM Integration: OpenAI API (GPT-4o) with streaming support
Transformers   : Hugging Face (optional, for offline inference)
AI Features    : Weakness detection, performance prediction,
                 readiness scoring, recommendation generation,
                 lesson plan generation (streamed)
```

### Database & Infrastructure
```
Primary DB     : Supabase PostgreSQL (production)
Local Dev      : PostgreSQL 15 (Docker)
Caching        : Redis (for AI response caching)
File Storage   : Supabase Storage
Frontend Host  : Vercel
Backend Host   : Render / Railway / AWS ECS
Android CI/CD  : GitHub Actions → Firebase App Distribution
```

---

## 📂 PROJECT STRUCTURE

### Web Monorepo
```
smartedu-ai/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI component library
│   │   │   ├── ui/              # Base: Button, Card, Badge, Input, Dropdown
│   │   │   ├── charts/          # GaugeChart, RadarChart, HeatmapChart, SparkLine
│   │   │   └── layout/          # Sidebar, TopBar, PageWrapper
│   │   ├── features/
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── student/         # All student portal pages + hooks
│   │   │   ├── teacher/         # All teacher portal pages + hooks
│   │   │   └── admin/           # All admin portal pages + hooks
│   │   ├── services/            # API service layer (Axios instances, endpoints)
│   │   ├── store/               # Zustand global state slices
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript interfaces and DTOs
│   │   ├── utils/               # Helpers, formatters, constants
│   │   └── router/              # Route definitions + protected route wrappers
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/
│   ├── app/
│   │   ├── api/v1/              # Route handlers by domain
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── teachers.py
│   │   │   └── admin.py
│   │   ├── core/                # Config, security, database session
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic layer
│   │   ├── ai/                  # AI/ML modules
│   │   │   ├── weakness_detector.py
│   │   │   ├── performance_predictor.py
│   │   │   ├── readiness_scorer.py
│   │   │   ├── recommendation_engine.py
│   │   │   └── teacher_assistant.py
│   │   └── main.py
│   ├── alembic/                 # Database migrations
│   ├── tests/                   # pytest test suites
│   ├── requirements.txt
│   └── Dockerfile
├── database/
│   ├── schema.sql               # Full DDL
│   ├── views.sql                # RBAC SQL views
│   ├── indexes.sql              # Full indexing strategy
│   ├── seed.sql                 # Sample data
│   └── queries/                 # Advanced analytical SQL queries
├── ai-engine/                   # Standalone AI module (importable by backend)
├── docs/                        # Full project documentation
│   ├── er-diagram.md
│   ├── api-docs.md
│   └── deployment-guide.md
├── docker-compose.yml
├── .env.example
└── README.md
```

### Android Module Structure
```
smartedu-ai-android/
├── app/
├── core/
│   ├── core-ui/
│   ├── core-network/
│   ├── core-database/
│   ├── core-datastore/
│   └── core-common/
├── feature/
│   ├── feature-auth/
│   ├── feature-student/
│   ├── feature-teacher/
│   └── feature-admin/
└── data/
    ├── data-remote/
    └── data-repository/
```

---

## 🗄️ DATABASE ENGINEERING (PRIORITY SECTION)

> Database engineering must be built FIRST before any application code.

### A. NORMALIZED SCHEMA (3NF)

Implement these entities with full normalization:

```sql
-- CORE IDENTITY
users (id, email, password_hash, role_id, is_active, created_at, updated_at)
roles (id, name) -- 'student', 'teacher', 'principal'
permissions (id, role_id, resource, action)

-- INSTITUTIONAL STRUCTURE
schools (id, name, board_type, city, state, created_at)
classes (id, school_id, grade, section, academic_year)
subjects (id, name, code, category) -- category: core/elective/language
teacher_assignments (id, teacher_id, class_id, subject_id, academic_year)

-- PEOPLE
students (id, user_id, school_id, class_id, roll_number, guardian_name, guardian_contact)
teachers (id, user_id, school_id, employee_id, specialization, joining_date)

-- ACADEMIC DATA
exams (id, school_id, name, exam_type, subject_id, class_id, exam_date, total_marks, passing_marks)
marks (id, student_id, exam_id, marks_obtained, grade, remarks, submitted_at)
attendance (id, student_id, class_id, date, status, marked_by)

-- AI-GENERATED INTELLIGENCE
weak_topics (id, student_id, subject_id, topic_name, chapter_name, detection_date, severity_level, resolved_at)
performance_predictions (id, student_id, predicted_percentage, confidence_score, prediction_date, model_version)
competitive_readiness (id, student_id, exam_type, readiness_score, strengths, improvement_areas, evaluated_at)
study_plans (id, student_id, generated_at, valid_from, valid_to, plan_json, ai_model_version)
recommendations (id, student_id, recommendation_type, content, priority, created_at, is_read)
academic_interventions (id, student_id, teacher_id, intervention_type, description, status, created_at)
ai_reports (id, generated_for_id, report_type, role, report_json, generated_at)
lesson_plans (id, teacher_id, subject_id, topic, grade, content_json, generated_at)
```

### B. ER DIAGRAM SPECIFICATION

Document the following relationships:
```
students         1──────<  marks                (one student → many marks)
exams            1──────<  marks                (one exam → many marks)
subjects         1──────<  exams                (one subject → many exams)
classes          1──────<  students             (one class → many students)
classes          >──────<  teachers             (many-to-many via teacher_assignments)
students         1──────<  weak_topics          (one student → many detected topics)
students         1──────<  competitive_readiness(one student → many readiness evaluations)
teachers         1──────<  academic_interventions(teacher creates interventions)
```

### C. ADVANCED SQL QUERIES (ALL MANDATORY)

```sql
-- Query 1: Subject-wise class average across all exams
SELECT
    c.grade, c.section, s.name AS subject,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100), 2) AS avg_percentage,
    COUNT(DISTINCT m.student_id) AS student_count
FROM marks m
JOIN exams e ON m.exam_id = e.id
JOIN subjects s ON e.subject_id = s.id
JOIN students st ON m.student_id = st.id
JOIN classes c ON st.class_id = c.id
WHERE e.academic_year = '2024-25'
GROUP BY c.grade, c.section, s.name
ORDER BY c.grade, avg_percentage DESC;

-- Query 2: Competitive readiness rankings per exam type
SELECT
    s.id, u.email,
    cr.exam_type,
    cr.readiness_score,
    RANK() OVER (PARTITION BY cr.exam_type ORDER BY cr.readiness_score DESC) AS rank,
    c.grade, c.section
FROM competitive_readiness cr
JOIN students s ON cr.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
WHERE cr.evaluated_at = (SELECT MAX(evaluated_at) FROM competitive_readiness cr2 WHERE cr2.student_id = cr.student_id);

-- Query 3: At-risk students (below 40% across 3+ subjects)
WITH subject_averages AS (
    SELECT
        m.student_id,
        e.subject_id,
        AVG(m.marks_obtained::numeric / e.total_marks * 100) AS avg_pct
    FROM marks m
    JOIN exams e ON m.exam_id = e.id
    GROUP BY m.student_id, e.subject_id
)
SELECT
    s.id, u.email, c.grade, c.section,
    COUNT(*) AS weak_subject_count,
    ARRAY_AGG(sub.name) AS weak_subjects
FROM subject_averages sa
JOIN students s ON sa.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
JOIN subjects sub ON sa.subject_id = sub.id
WHERE sa.avg_pct < 40
GROUP BY s.id, u.email, c.grade, c.section
HAVING COUNT(*) >= 3
ORDER BY weak_subject_count DESC;

-- Query 4: Teacher effectiveness — avg class improvement over time
WITH exam_periods AS (
    SELECT
        ta.teacher_id,
        e.subject_id,
        DATE_TRUNC('month', e.exam_date) AS month,
        AVG(m.marks_obtained::numeric / e.total_marks * 100) AS avg_score
    FROM teacher_assignments ta
    JOIN exams e ON e.class_id = ta.class_id AND e.subject_id = ta.subject_id
    JOIN marks m ON m.exam_id = e.id
    GROUP BY ta.teacher_id, e.subject_id, month
)
SELECT
    t.id, u.email,
    ROUND(AVG(avg_score), 2) AS overall_avg,
    ROUND(AVG(avg_score) FILTER (WHERE month >= NOW() - INTERVAL '3 months'), 2) AS recent_avg,
    ROUND(
        AVG(avg_score) FILTER (WHERE month >= NOW() - INTERVAL '3 months') -
        AVG(avg_score) FILTER (WHERE month < NOW() - INTERVAL '3 months'), 2
    ) AS improvement_delta
FROM exam_periods ep
JOIN teachers t ON ep.teacher_id = t.id
JOIN users u ON t.user_id = u.id
GROUP BY t.id, u.email
ORDER BY improvement_delta DESC;

-- Query 5: Attendance-performance correlation
SELECT
    s.id,
    ROUND(
        COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric /
        NULLIF(COUNT(a.id), 0) * 100, 2
    ) AS attendance_pct,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100), 2) AS avg_marks_pct,
    CORR(
        CASE WHEN a.status = 'present' THEN 1 ELSE 0 END,
        m.marks_obtained::numeric / e.total_marks
    ) AS correlation_coefficient
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
LEFT JOIN marks m ON s.id = m.student_id
LEFT JOIN exams e ON m.exam_id = e.id
GROUP BY s.id;

-- Query 6: Weak topic frequency — school-wide hotspots
SELECT
    sub.name AS subject, wt.topic_name, wt.chapter_name,
    COUNT(*) AS affected_students,
    AVG(CASE wt.severity_level WHEN 'critical' THEN 3 WHEN 'moderate' THEN 2 ELSE 1 END) AS avg_severity
FROM weak_topics wt
JOIN subjects sub ON wt.subject_id = sub.id
WHERE wt.resolved_at IS NULL
GROUP BY sub.name, wt.topic_name, wt.chapter_name
ORDER BY affected_students DESC, avg_severity DESC
LIMIT 20;

-- Query 7: Student performance trend (last 6 exams per subject)
SELECT
    m.student_id, s.name AS subject, e.name AS exam,
    e.exam_date,
    ROUND(m.marks_obtained::numeric / e.total_marks * 100, 2) AS score_pct,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100)
        OVER (PARTITION BY m.student_id, e.subject_id ORDER BY e.exam_date
              ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_avg
FROM marks m
JOIN exams e ON m.exam_id = e.id
JOIN subjects s ON e.subject_id = s.id
WHERE m.student_id = :student_id
ORDER BY s.name, e.exam_date;

-- Query 8: Top-performing classes by overall academic index
SELECT
    c.grade, c.section,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100), 2) AS academic_index,
    COUNT(DISTINCT m.student_id) AS total_students,
    COUNT(DISTINCT m.student_id) FILTER (
        WHERE (m.marks_obtained::numeric / e.total_marks * 100) >= 75
    ) AS distinction_count
FROM classes c
JOIN students s ON s.class_id = c.id
JOIN marks m ON m.student_id = s.id
JOIN exams e ON m.exam_id = e.id
GROUP BY c.grade, c.section
ORDER BY academic_index DESC;
```

### D. INDEXING STRATEGY (MANDATORY — IMPLEMENT ALL)

```sql
-- Core lookup indexes (most-queried foreign keys)
CREATE INDEX idx_marks_student_id ON marks(student_id);
CREATE INDEX idx_marks_exam_id ON marks(exam_id);
CREATE INDEX idx_exams_subject_class ON exams(subject_id, class_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date DESC);

-- Analytics performance indexes (used in dashboard aggregations)
CREATE INDEX idx_marks_student_exam_covering
    ON marks(student_id, exam_id) INCLUDE (marks_obtained);
CREATE INDEX idx_competitive_readiness_score
    ON competitive_readiness(student_id, exam_type, readiness_score DESC);
CREATE INDEX idx_weak_topics_active
    ON weak_topics(student_id, subject_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_teacher_assignments_lookup
    ON teacher_assignments(teacher_id, class_id, subject_id);

-- Full-text and partial indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_exams_date_type ON exams(exam_date DESC, exam_type);
CREATE INDEX idx_attendance_pct_partial
    ON attendance(student_id) WHERE status = 'present';

-- GIN index for JSON columns
CREATE INDEX idx_study_plans_json ON study_plans USING GIN(plan_json);
CREATE INDEX idx_ai_reports_json ON ai_reports USING GIN(report_json);
```

**Why these indexes matter:**
- `idx_marks_student_id`: Every student dashboard query filters by student_id → eliminates full-table scans on the largest table.
- `idx_marks_student_exam_covering`: The INCLUDE clause makes marks analytics queries index-only scans.
- `idx_competitive_readiness_score`: Readiness leaderboards scan this index directly without heap access.
- `idx_weak_topics_active`: Partial index (WHERE resolved_at IS NULL) keeps the active-topics index small and fast.
- `idx_attendance_pct_partial`: Correlation analytics only count 'present' rows; partial index reduces I/O by ~50%.

### E. DATABASE-LEVEL RBAC (SQL VIEWS)

```sql
-- Students can only see their OWN data
CREATE VIEW student_dashboard_view AS
SELECT
    s.id AS student_id,
    u.email,
    m.marks_obtained,
    e.total_marks,
    ROUND(m.marks_obtained::numeric / e.total_marks * 100, 2) AS score_pct,
    sub.name AS subject,
    e.exam_type, e.exam_date,
    wt.topic_name AS weak_topic,
    cr.readiness_score, cr.exam_type AS readiness_exam
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN marks m ON m.student_id = s.id
LEFT JOIN exams e ON m.exam_id = e.id
LEFT JOIN subjects sub ON e.subject_id = sub.id
LEFT JOIN weak_topics wt ON wt.student_id = s.id AND wt.resolved_at IS NULL
LEFT JOIN competitive_readiness cr ON cr.student_id = s.id
WHERE s.user_id = current_setting('app.current_user_id')::uuid;

-- Teachers see only their assigned classes
CREATE VIEW teacher_analytics_view AS
SELECT
    t.id AS teacher_id,
    c.grade, c.section,
    sub.name AS subject,
    s.id AS student_id,
    u.email AS student_email,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100), 2) AS avg_score,
    COUNT(wt.id) AS weak_topic_count
FROM teachers t
JOIN teacher_assignments ta ON ta.teacher_id = t.id
JOIN classes c ON ta.class_id = c.id
JOIN subjects sub ON ta.subject_id = sub.id
JOIN students s ON s.class_id = c.id
JOIN users u ON s.user_id = u.id
LEFT JOIN marks m ON m.student_id = s.id
LEFT JOIN exams e ON m.exam_id = e.id AND e.subject_id = sub.id
LEFT JOIN weak_topics wt ON wt.student_id = s.id AND wt.subject_id = sub.id AND wt.resolved_at IS NULL
WHERE t.user_id = current_setting('app.current_user_id')::uuid
GROUP BY t.id, c.grade, c.section, sub.name, s.id, u.email;

-- Principals see school-wide aggregates only
CREATE VIEW principal_analytics_view AS
SELECT
    c.grade, c.section,
    ROUND(AVG(m.marks_obtained::numeric / e.total_marks * 100), 2) AS class_avg,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT s.id) FILTER (
        WHERE (m.marks_obtained::numeric / e.total_marks * 100) < 40
    ) AS at_risk_count,
    ROUND(
        COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric /
        NULLIF(COUNT(a.id), 0) * 100, 2
    ) AS avg_attendance_pct
FROM classes c
JOIN students s ON s.class_id = c.id
LEFT JOIN marks m ON m.student_id = s.id
LEFT JOIN exams e ON m.exam_id = e.id
LEFT JOIN attendance a ON a.student_id = s.id
GROUP BY c.grade, c.section;

-- Grant permissions
GRANT SELECT ON student_dashboard_view TO app_student_role;
GRANT SELECT ON teacher_analytics_view TO app_teacher_role;
GRANT SELECT ON principal_analytics_view TO app_principal_role;
```

---

## 🔐 AUTHENTICATION & SECURITY

```python
# backend/app/core/security.py — implement fully

# 1. JWT: access token (15min) + refresh token (7 days)
# 2. Password hashing: bcrypt with 12 rounds
# 3. OkHttp Authenticator (Android): auto-refresh on 401
# 4. Axios interceptor (Web): attach Bearer token, retry on 401
# 5. FastAPI dependency: get_current_user → decoded JWT → DB lookup → role check
# 6. RBAC middleware: role-required decorator for each route group
# 7. Rate limiting: slowapi — 100 req/min general, 10 req/min AI endpoints
# 8. Input sanitization: Pydantic v2 validators on all request bodies
# 9. SQL injection: SQLAlchemy ORM only — NO raw string queries
# 10. Environment: all secrets via .env — NEVER hardcoded
```

### API Auth Contracts
```
POST /api/v1/auth/login
  Body: { "identifier": "string", "password": "string" }
  Response: { "access_token": "jwt", "refresh_token": "jwt", "user": UserDTO }

POST /api/v1/auth/refresh
  Body: { "refresh_token": "string" }
  Response: { "access_token": "jwt" }

POST /api/v1/auth/logout
  Header: Authorization: Bearer <token>
  Response: { "message": "logged out" }
```

---

## 📊 CORE SYSTEM MODULES

### MODULE 1 — STUDENT PORTAL

**Screens (Web + Android):**

1. **Home Dashboard**
   - Greeting header with date
   - PerformanceSummaryCard: overall %, trend arrow, last exam
   - 3 StatCards: Attendance %, Weak Subject Count, Exam Countdown
   - WeakTopicAlert banner (orange, tapable → WeakTopicsScreen)
   - RecentExamCard with mini bar chart
   - StudyStreakBadge (gamification)

2. **Marks Analysis**
   - Overall GaugeChart (animated on entry)
   - Exam type filter chips: Unit Test / Mid-Term / Final / All
   - Subject performance cards: marks, PerformanceBadge, sparkline trend
   - Expandable exam history list

3. **Weak Topics**
   - HeatmapGrid: 8-col grid, color interpolated red→green per score
   - Chapter-level drill-down
   - Topic detail card with AI-suggested resources
   - Mark-as-resolved action

4. **Competitive Readiness**
   - ReadinessMeter (animated arc) per exam: JEE / NEET / Olympiad / Board
   - RadarChart: Strength domains overlay
   - Improvement roadmap cards
   - Historical readiness trend line

5. **Study Planner**
   - Weekly calendar grid (custom Compose/React component)
   - Time slot cards with subject + topic
   - AI generation button → streaming plan output
   - Revision reminders (push notifications on Android)

**Visualizations:** Pie, Radar, Trend line, Bar, Gauge, Heatmap, Sparkline

---

### MODULE 2 — TEACHER PORTAL

**Screens:**

1. **Home** — Class selector, performance summary, critical alerts
2. **Class Analytics** — Student table with sortable columns, heatmap overlay
3. **Student Detail** — Individual deep-dive with all marks + AI weak topic analysis
4. **AI Teacher Assistant**
   - Input: SubjectDropdown, TopicField, ClassLevelDropdown, AssistanceTypeChips
   - Output: Streamed response in BottomSheet/Drawer with typewriter animation
   - Actions: Save lesson plan, Share as PDF
5. **Workload Optimizer** — ML Kit OCR scan of paper marks + auto-import
6. **Competitive Readiness** — Class-level readiness rankings by exam type

---

### MODULE 3 — PRINCIPAL / ADMIN PORTAL

**Screens:**

1. **Home** — School KPI cards, annual performance chart, critical alerts
2. **Class Comparison** — Side-by-side performance across all classes
3. **Teacher Analytics** — Effectiveness scores, class improvement delta, radar chart
4. **Intervention Recommendations** — AI-generated intervention cards ranked by urgency
5. **School Competitive Dashboard** — Readiness distribution heatmap across grades

---

## 🧠 AI/ML MODULES (Full Implementation)

### 1. Weakness Detection Model
```python
# ai-engine/weakness_detector.py
# Input: student marks history DataFrame
# Algorithm: Z-score normalization per subject → topics below -1.5σ flagged
# Output: List[WeakTopic] with severity scoring (critical/moderate/minor)
# Runs: After every exam data sync (WorkManager job on Android)
```

### 2. Performance Prediction Model
```python
# ai-engine/performance_predictor.py
# Algorithm: Linear regression + seasonal decomposition on marks time series
# Features: attendance_pct, avg_last_3_exams, weak_topic_count, study_streak
# Output: predicted_percentage (float), confidence_score (0–1), at_risk (bool)
# Model: trained on seed data, persisted as joblib file, versioned
```

### 3. Competitive Readiness Scorer
```python
# ai-engine/readiness_scorer.py
# Exam types: JEE, NEET, Olympiad, Board
# Per exam: weighted subject importance matrix × student avg scores
# Output: readiness_score (0–100), strengths[], improvement_areas[], milestone_timeline
# Weights: JEE → Physics 35%, Chemistry 35%, Math 30%
#          NEET → Biology 50%, Chemistry 25%, Physics 25%
```

### 4. Recommendation Engine
```python
# ai-engine/recommendation_engine.py
# Rule-based + LLM hybrid:
#   Step 1: Rule engine identifies weak areas from weak_topics table
#   Step 2: GPT-4o generates personalized study plan as structured JSON
#   Step 3: Cached in Redis for 24h per student
# Output: StudyPlan JSON { daily_schedule, resources, revision_tips, motivation_message }
```

### 5. Teacher Assistant AI (Streaming)
```python
# ai-engine/teacher_assistant.py
# Input: subject, topic, grade, assistance_type (lesson_plan/activity/homework/revision)
# Model: GPT-4o with streaming via SSE endpoint
# FastAPI: StreamingResponse with Server-Sent Events
# Android: OkHttp SSE client → StateFlow<String> → typewriter UI
# Web: fetch with ReadableStream → character-by-character render
```

---

## 🎨 DESIGN SYSTEM

### Web Color Palette (Tailwind CSS variables)
```css
:root {
  --brand-primary: #1A56A8;
  --brand-secondary: #4A90D9;
  --surface: #F5F7FA;
  --surface-variant: #EEF2F7;
  --background: #F8FAFC;
  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --at-risk: #DC2626;
  --needs-attention: #D97706;
  --improving: #16A34A;
  --high-performer: #1A56A8;
}
```

### Android Color Palette (Material 3 Theme.kt)
```kotlin
Primary           = Color(0xFF1A56A8)
PrimaryContainer  = Color(0xFFD6E4F7)
Secondary         = Color(0xFF4A90D9)
Surface           = Color(0xFFF5F7FA)
Background        = Color(0xFFF8FAFC)
Success           = Color(0xFF16A34A)
Warning           = Color(0xFFD97706)
Danger            = Color(0xFFDC2626)
```

### Typography
- Web: `Plus Jakarta Sans` (headings) + `Inter` (body) via Google Fonts
- Android: Same via `ui-text-google-fonts` dependency

### Web Component Library (build ALL)
```
SmartEduCard      — elevated card with optional left-accent bar
PerformanceBadge  — colored chip: At Risk / Needs Attention / Improving / High Performer
GaugeChart        — circular progress with animated fill
ReadinessMeter    — arc meter for exam readiness
StatCard          — KPI card with icon, value, label, trend arrow
SectionHeader     — title + subtitle + optional action
EmptyStateView    — illustration + message + CTA
LoadingShimmer    — skeleton for all list states
ErrorView         — error card with retry button
DataTable         — sortable, filterable table with pagination
HeatmapGrid       — color-interpolated grid (red→green)
SparkLine         — inline mini trend chart
```

### Android Component Library (core-ui)
Same component set, implemented as Composables with Canvas-based charts.

---

## 📡 COMPLETE API SPECIFICATION

All endpoints prefixed: `/api/v1/`
All responses: `{ "success": bool, "data": T, "error": string | null }`

```
# AUTH
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password

# STUDENTS
GET    /students/{id}/dashboard         → StudentDashboardDTO
GET    /students/{id}/marks             → List[MarkDTO] (paginated)
GET    /students/{id}/weak-topics       → List[WeakTopicDTO]
GET    /students/{id}/study-plan        → StudyPlanDTO (cached)
POST   /students/{id}/study-plan/generate → StreamingResponse (SSE)
GET    /students/{id}/readiness         → List[ReadinessDTO]
GET    /students/{id}/recommendations   → List[RecommendationDTO]

# TEACHERS
GET    /teachers/{id}/dashboard         → TeacherDashboardDTO
GET    /teachers/{id}/classes           → List[ClassDTO]
GET    /teachers/classes/{classId}/analytics → ClassAnalyticsDTO
GET    /teachers/classes/{classId}/students  → List[StudentSummaryDTO]
POST   /teachers/ai/lesson-plan         → StreamingResponse (SSE)
POST   /teachers/ai/activity            → StreamingResponse (SSE)
GET    /teachers/{id}/workload          → WorkloadDTO

# ADMIN
GET    /admin/school/dashboard          → SchoolDashboardDTO
GET    /admin/school/class-comparison   → List[ClassComparisonDTO]
GET    /admin/teachers/analytics        → List[TeacherEffectivenessDTO]
GET    /admin/interventions             → List[InterventionDTO]
POST   /admin/interventions             → InterventionDTO
GET    /admin/competitive-readiness     → SchoolReadinessDTO

# AI ENGINE
POST   /ai/detect-weaknesses            → List[WeakTopicDTO]
POST   /ai/predict-performance          → PredictionDTO
POST   /ai/score-readiness              → ReadinessDTO
```

---

## 🚦 BUILD ORDER (STRICTLY FOLLOW)

```
PHASE 0 — Database First
  [ ] Write schema.sql — all 20+ tables with constraints
  [ ] Write views.sql — 3 RBAC views
  [ ] Write indexes.sql — all 12+ indexes
  [ ] Write seed.sql — realistic sample data (50 students, 10 teachers, 5 classes)
  [ ] Run Alembic initial migration

PHASE 1 — Backend Foundation
  [ ] FastAPI app skeleton, CORS, lifespan events
  [ ] SQLAlchemy async engine + session factory
  [ ] Pydantic v2 schemas for all models
  [ ] JWT auth: login, refresh, get_current_user dependency
  [ ] RBAC decorators: require_role(["student"]) etc.

PHASE 2 — AI Engine
  [ ] weakness_detector.py — fully working
  [ ] performance_predictor.py — train on seed data
  [ ] readiness_scorer.py — weighted formula implementation
  [ ] recommendation_engine.py — rule engine + GPT-4o integration
  [ ] teacher_assistant.py — streaming SSE endpoint

PHASE 3 — Backend APIs
  [ ] Auth routes with full validation
  [ ] Student routes — all 7 endpoints
  [ ] Teacher routes — all 6 endpoints
  [ ] Admin routes — all 5 endpoints
  [ ] pytest tests for all critical paths

PHASE 4 — Web Frontend Foundation
  [ ] Tailwind config with design tokens
  [ ] All core UI components
  [ ] Axios instance + TanStack Query setup
  [ ] Zustand auth store
  [ ] React Router with protected routes by role

PHASE 5 — Web Student Portal
  [ ] StudentHome, MarksAnalysis, WeakTopics
  [ ] StudyPlanner, CompetitiveReadiness
  [ ] All charts rendering with real API data

PHASE 6 — Web Teacher + Admin Portals
  [ ] All teacher screens
  [ ] AI Teacher Assistant with streaming UI
  [ ] All admin screens with school-wide analytics

PHASE 7 — Android Foundation
  [ ] Multi-module Gradle KTS project
  [ ] SmartEduTheme, typography, all core-ui components
  [ ] AppNavGraph, RoleRouter
  [ ] EncryptedDataStore, JWT interceptor

PHASE 8 — Android Feature Modules
  [ ] feature-auth: Login, Biometric, Onboarding
  [ ] feature-student: all screens with MPAndroidChart
  [ ] feature-teacher: including ML Kit OCR + streaming AI
  [ ] feature-admin: all screens with pull-to-refresh

PHASE 9 — Polish
  [ ] Loading/empty/error states on ALL screens
  [ ] Dark mode (web + Android)
  [ ] Push notifications (FCM)
  [ ] WorkManager offline sync
  [ ] ProGuard rules
  [ ] Lighthouse score > 90 (web)
  [ ] Accessibility audit

PHASE 10 — Deploy
  [ ] Docker Compose for local full-stack
  [ ] Vercel deployment (frontend)
  [ ] Render/Railway deployment (backend)
  [ ] Supabase production DB migration
  [ ] GitHub Actions CI/CD for Android APK
```

---

## 🧪 TESTING REQUIREMENTS

### Backend (pytest)
```python
# Mandatory test files:
tests/test_auth.py          — login, refresh, invalid credentials, role routing
tests/test_students.py      — marks retrieval, weak topic detection, readiness scoring
tests/test_teachers.py      — class analytics, lesson plan generation
tests/test_admin.py         — school dashboard, class comparison
tests/test_ai_engine.py     — weakness detector, performance predictor
# Coverage target: 80%+ for all service layer functions
```

### Android (JUnit 5 + MockK)
```kotlin
// Mandatory:
// All ViewModel unit tests (all UI states)
// Repository tests with MockK (verify correct data mapping)
// Flow tests with Turbine
// Coverage: 80%+ ViewModels
```

### Web (Vitest + Testing Library)
```typescript
// Mandatory:
// Auth hook tests
// Protected route tests
// Chart component render tests
// API service mock tests
```

---

## ✅ DEFINITION OF DONE

A feature is **only** complete when ALL of these pass:

**Backend:**
- [ ] All Pydantic schemas validate correctly
- [ ] All routes return correct HTTP status codes
- [ ] Auth middleware blocks unauthorized access
- [ ] pytest tests pass with 80%+ coverage
- [ ] No SQLAlchemy warnings in logs

**Web Frontend:**
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] All screens handle Loading / Success / Error / Empty states
- [ ] Charts render with real data (not hardcoded)
- [ ] Responsive on mobile (375px) and desktop (1440px)
- [ ] No infinite re-render loops (React DevTools verified)

**Android:**
- [ ] Zero lint warnings (`./gradlew lint`)
- [ ] All screens render correctly in light + dark mode
- [ ] All states handled: Loading, Success, Error, Empty
- [ ] All user-facing strings in `strings.xml`
- [ ] `@Preview` functions on every Composable
- [ ] No StrictMode violations
- [ ] ViewModel unit tests pass with 80%+ coverage
- [ ] Accessibility: all interactive elements have `contentDescription`

**Database:**
- [ ] All 3 RBAC views return correct scoped data
- [ ] All 8 analytical queries execute under 200ms on seed data
- [ ] All indexes are created and EXPLAIN ANALYZE confirms their use
- [ ] Alembic migration runs cleanly from scratch

---

## 📑 REQUIRED DOCUMENTATION (generate all)

```
docs/
├── 01-executive-summary.md
├── 02-er-diagram.md               ← Full ER diagram with cardinality notation
├── 03-database-schema.md          ← DDL + normalization explanation
├── 04-sql-queries.md              ← All 8 queries with explanations
├── 05-indexing-strategy.md        ← All indexes + performance rationale
├── 06-rbac-security.md            ← SQL views + JWT + role architecture
├── 07-system-architecture.md      ← Full system diagram
├── 08-frontend-architecture.md    ← Component hierarchy + state flow
├── 09-backend-architecture.md     ← Route → Service → Repository → DB
├── 10-android-architecture.md     ← MVVM + Clean Arch layer diagram
├── 11-ai-ml-architecture.md       ← Model pipeline + API integration
├── 12-api-documentation.md        ← All endpoints with request/response
├── 13-deployment-guide.md         ← Vercel + Render + Supabase + Play Store
├── 14-testing-strategy.md
└── 15-future-enhancements.md
```

> **Document order is MANDATORY:** Database → Security → Architecture → AI/ML
> Push all AI/ML explanations to Section 11+. Database engineering must dominate the first half.

---

## 🚀 DEPLOYMENT CONFIGS (generate all)

```yaml
# docker-compose.yml — local full-stack
services:
  postgres:
    image: postgres:15
    environment: { POSTGRES_DB: smartedu, POSTGRES_USER: admin, POSTGRES_PASSWORD: secret }
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql+asyncpg://admin:secret@postgres/smartedu
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports: ["8000:8000"]

  frontend:
    build: ./frontend
    depends_on: [backend]
    environment:
      VITE_API_URL: http://backend:8000
    ports: ["3000:3000"]
```

```
# vercel.json (frontend)
{ "framework": "vite", "buildCommand": "npm run build", "outputDirectory": "dist" }

# render.yaml (backend)
services:
  - type: web
    name: smartedu-backend
    runtime: python
    buildCommand: pip install -r requirements.txt && alembic upgrade head
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 📋 CURSOR-SPECIFIC IMPLEMENTATION RULES

1. **Android: Always `@Preview`** — both light and dark on every Composable.
2. **Android: `collectAsStateWithLifecycle()`** — never `collectAsState()`.
3. **Android: `savedStateHandle`** — in every ViewModel for nav args.
4. **Android: EncryptedDataStore only** — never SharedPreferences for tokens.
5. **Android: Timber** — all logging. No `Log.d` in codebase.
6. **Web: Zod schemas** — validate ALL API responses at the boundary.
7. **Web: TanStack Query keys** — factory pattern, e.g. `studentKeys.marks(id)`.
8. **Web: No prop drilling** — context or Zustand for shared state > 2 levels.
9. **Sealed UI State on Android:**
   ```kotlin
   sealed interface ScreenUiState {
       object Loading : ScreenUiState
       data class Success(val data: DataModel) : ScreenUiState
       data class Error(val message: String) : ScreenUiState
       object Empty : ScreenUiState
   }
   ```
10. **When creating any new screen (Android):** create `Screen.kt` + `ViewModel.kt` + `UiState.kt` + add route to NavGraph + add `@Preview`.
11. **When creating any new page (Web):** create `Page.tsx` + `use{Page}Data.ts` hook + add route to router + add Storybook story.
12. **No placeholder comments.** Every function body is complete.
13. **FastAPI: all endpoints use async def** and async SQLAlchemy sessions.
14. **Repository pattern is mandatory everywhere** — ViewModels/pages never call Retrofit/Axios/Room directly.

---

## 🎯 PHASE PROMPTS (use after initial scaffold)

**Phase A — Marks Analysis (Web):**
> "Build `MarksAnalysisPage.tsx` with full TanStack Query data fetching from `/api/v1/students/{id}/marks`. Include an animated GaugeChart (Recharts RadialBarChart), a Chart.js BarChart for subject comparison, a Plotly LineChart for performance trend, and subject performance cards with sparklines. All data must come from `useMarksData(studentId)` hook. Handle loading/error/empty states with the shared components."

**Phase B — AI Teacher Assistant with Streaming (Web + Android):**
> "Build the AI Teacher Assistant screen. Input form: SubjectDropdown, TopicTextField, ClassLevelDropdown, AssistanceTypeChips (Lesson Plan / Activity / Homework / Revision). On submit, call `POST /api/v1/teachers/ai/lesson-plan` as an SSE stream. Web: use `fetch` with `ReadableStream` and render each token as it arrives with a cursor blink animation. Android: use OkHttp SSE with `StateFlow<String>` and a typewriter Composable. Include Save (Room/localStorage) and Share as PDF actions."

**Phase C — Heatmap Component:**
> "Build a `HeatmapGrid` component. Web: React + Recharts custom cell renderer, 8 columns, color interpolated red(#DC2626)→yellow(#D97706)→green(#16A34A) based on score percentage, click-to-expand tooltip. Android: Compose Canvas implementation, pinch-to-zoom via `transformable()`, tap-to-tooltip. Both accept `List<HeatmapCell>` where each cell has `studentName`, `chapterName`, `scorePercentage`."

**Phase D — Admin School Dashboard:**
> "Build `AdminHomePage.tsx` and `AdminHomeScreen.kt`. Include: 4 school KPI StatCards (overall avg, at-risk count, attendance %, readiness distribution), an annual Plotly/MPAndroidChart LineChart with class-level traces, a critical interventions list with priority-colored cards, and a top classes ranked table. Data from `useAdminDashboard()` / `AdminHomeViewModel`. Include pull-to-refresh (Android) and auto-refresh every 5min (Web via TanStack Query `refetchInterval`)."

**Phase E — Competitive Readiness Screen:**
> "Build the Competitive Readiness screen for students. Show 4 ReadinessMeter arcs (JEE, NEET, Olympiad, Board) animated on entry. Below each: a Recharts/MPAndroidChart RadarChart showing strength domains, improvement roadmap cards sorted by priority, and a historical readiness trend line. Data from `GET /api/v1/students/{id}/readiness`. Include exam selection tabs at the top."

---

*SmartEdu AI — Built with engineering discipline. Powered by AI. Designed for every learner.*
*God-Level Master Prompt v3.0 | Synthesized from ChatGPT Depth + Cursor Engineering Precision*
