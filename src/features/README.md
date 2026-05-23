# Features

Domain modules live here. Each folder owns pages logic, hooks, and services for one portal.

```
features/
├── auth/       # Login, register, session (next phase)
├── student/    # Student portal data & hooks
├── teacher/    # Teacher portal data & hooks
└── admin/      # Principal / admin portal data & hooks
```

Pages in `app/` stay thin; import from `features/{module}`.
