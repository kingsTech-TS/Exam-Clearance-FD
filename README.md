# EKSU Digital Clearance & Course Form Signing System — Frontend

A secure, institutional web portal for **Ekiti State University (EKSU)** designed to digitize, streamline, and automate student clearance processing and course form signing.

---

## Key Features & Roles

### 1. Student Portal (`/student`)
- **Self-Registration Wizard**: Multi-step registration with 9-digit Matric Number or 14-character Registration Number validation.
- **Mandatory Profile Setup**: Profile completeness gate ensuring student passport photograph and digital signature (with transparent background removal) are active before submission.
- **Clearance Submission**: Upload clearance forms with pre-submission checklist and automatic institutional submission window checks.
- **Course Form Submission**: Direct departmental routing to assigned Head of Department (HOD).
- **Interactive Review & History**: Embedded PDF inspection viewer, multi-stage approval tracker, and audit event timeline.
- **Digital Download**: Instant retrieval of completed, digitally signed and sealed PDFs.

### 2. Staff Reviewer Portal (`/staff`)
- **Adaptive Sub-Role Workflows**:
  - **Faculty Bursar**: Review assigned faculty clearance submissions, sign with date, signature, and official seal.
  - **University Auditor**: Review Bursar-approved clearance forms to append final seal & signature and complete clearance.
  - **Head of Department (HOD)**: Review and endorse departmental course registration forms.
- **Workspace Inspector**: Split-screen PDF preview with zoom controls, fullscreen mode, one-click signing dialog, and rejection with mandatory remarks.
- **Signing Assets**: Upload official passport, transparent signature, and institutional seal.

### 3. System Administration Portal (`/admin`)
- **Executive Dashboard**: System KPIs, document throughput velocities, and real-time service health monitors (FastAPI, MongoDB, S3, Cloudinary).
- **Staff Approval Queue**: Review pending staff self-registrations with one-click approval or rejection.
- **Role Escalation**: Promote verified staff members to System Administrators.
- **Student & Staff Directories**: Search, filter by faculty/department/level, paginate, and toggle account suspensions.
- **Global Document Registry**: Institutional registry with multi-faceted filtering and embedded PDF inspection.
- **Clearance Period Manager**: Configure institutional start/end dates to open or close clearance submissions.
- **Immutable Audit Logs**: Comprehensive audit trail capturing all signature, approval, and administrative events.
- **Institutional Analytics**: Throughput performance, processing velocities, and staff activity metrics.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with custom institutional CSS variables
- **State Management**: Zustand (with localStorage persistence)
- **Data Fetching & Caching**: TanStack Query v5 (React Query)
- **Forms & Validation**: React Hook Form + Zod v4
- **HTTP Client**: Axios with Bearer token injection and automatic 401 token refresh interceptor
- **Icons**: Lucide React
- **Typography**: Google Font Inter

---

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx             # Split login with Student/Staff/Admin tabs
│   │   ├── student-register/page.tsx  # 3-step registration wizard
│   │   └── staff-register/page.tsx    # Dynamic staff registration
│   ├── student/
│   │   ├── layout.tsx                 # Protected STUDENT layout + profile gate
│   │   ├── dashboard/page.tsx         # Clearance & Course Form status cards
│   │   ├── documents/page.tsx         # Document filter table & upload modal
│   │   ├── documents/[id]/page.tsx    # PDF preview, workflow tracker, timeline
│   │   ├── profile/page.tsx           # Passport & transparent signature dropzones
│   │   └── settings/page.tsx
│   ├── staff/
│   │   ├── layout.tsx                 # Protected STAFF layout (approved check)
│   │   ├── dashboard/page.tsx         # Adaptive Bursar / Auditor / HOD queue
│   │   ├── documents/page.tsx         # Assigned review registry
│   │   ├── documents/[id]/page.tsx    # Split review workspace + Sign / Reject
│   │   ├── profile/page.tsx           # Passport, signature, and seal upload
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                 # Protected ADMIN layout
│   │   ├── dashboard/page.tsx         # High-level institutional KPIs & monitors
│   │   ├── students/page.tsx          # Student directory & suspension controls
│   │   ├── students/[id]/page.tsx     # Student profile & submitted documents
│   │   ├── staff/page.tsx             # Staff directory & approval queue
│   │   ├── staff/[id]/page.tsx        # Staff profile & promote to admin
│   │   ├── documents/page.tsx         # Global institutional documents list
│   │   ├── audit-logs/page.tsx        # Immutable audit records
│   │   ├── analytics/page.tsx         # Processing velocities & department metrics
│   │   ├── clearance-period/page.tsx  # Submission window date controls
│   │   ├── system-health/page.tsx     # Service status monitors
│   │   └── settings/page.tsx
│   ├── globals.css                    # Institutional design tokens & components
│   ├── layout.tsx                     # Root layout with QueryProvider & Inter font
│   ├── page.tsx                       # Session & role-based router
│   └── unauthorized/page.tsx          # 403 Forbidden page
├── src/
│   ├── components/
│   │   ├── admin/                     # StaffApprovalQueue, PromoteStaffDialog, etc.
│   │   ├── documents/                 # PdfViewer, WorkflowTracker, Timeline, UploadModal, Sign/Reject Dialogs
│   │   ├── layout/                    # AppShell, Sidebar, MobileSidebar, Header
│   │   ├── profile/                   # FileUploadDropzone
│   │   └── shared/                    # StatusBadge, StatCard, EmptyState, LoadingSkeleton, NotificationCenter
│   ├── lib/
│   │   ├── api/                       # Axios client & typed API endpoints
│   │   ├── auth/                      # Zustand authStore
│   │   ├── constants/                 # EKSU faculties, departments & status mappings
│   │   └── validations/               # Zod validation schemas
│   ├── providers/                     # React Query provider
│   └── types/                         # TypeScript interfaces (User, Document, Admin, API)
└── .env                               # Environment configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.0+)
- Running FastAPI backend (default: `http://localhost:8000/api/v1`)

### Environment Setup

Create or verify `.env` in the root directory:

```env
# FastAPI Backend Base API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Installation

```bash
# Using Bun
bun install

# Or using npm
npm install
```

### Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Using Bun
bun run build
bun run start

# Or using npm
npm run build
npm run start
```

---

## Design System Guidelines

- **Palette**: Deep Navy (`#1e3a8a`), crisp white surfaces (`#ffffff`), neutral background (`#f8fafc`), subtle borders (`#e2e8f0`).
- **Semantic Badges**:
  - `Pending Bursar / Auditor / HOD` $\rightarrow$ Amber
  - `Completed / Approved` $\rightarrow$ Emerald
  - `Rejected / Suspended` $\rightarrow$ Rose / Red
- **Mobile Responsive**: Responsive side drawer navigation, stacked data tables, and touch-friendly controls.

---

## License

This project is proprietary institutional software developed for **Ekiti State University (EKSU)**. All rights reserved.
#   E x a m - C l e a r a n c e - F D  
 