<div align="center">

# 🎓 EKSU Digital Clearance & Course Form Signing System
### Frontend Application (Next.js 16 • TypeScript • Tailwind CSS)

An institutional digital portal engineered for **Ekiti State University (EKSU)** to streamline, digitize, and automate student clearance validation and course registration form signing with multi-role cryptographic endorsement.

---

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/TanStack%20Query-v5-ff4154?style=flat-square&logo=reactquery)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-brown?style=flat-square)](https://zustand.docs.pmnd.rs/)
[![Bun](https://img.shields.io/badge/Bun-v1.0+-fbf0df?style=flat-square&logo=bun)](https://bun.sh/)

</div>

---

## 📌 Overview

The **EKSU Digital Clearance & Course Form Signing System** replaces manual, paper-based academic clearance with an end-to-end automated digital workflow. It enforces institutional rules, validates PDF authenticity, and coordinates sequential reviews between Students, Faculty Bursars, University Auditors, Heads of Department (HOD), and System Administrators.

---

## 🚀 Key Modules & Portals

### 1. 🎓 Student Portal (`/student`)
* **Self-Registration Wizard**: Multi-step registration validating 9-digit Matriculation Numbers or 14-character UTME Registration Numbers.
* **Mandatory Profile Verification**: Guard gate requiring validated passport photographs and digital signatures before submitting forms.
* **Clearance Submission Engine**: Upload clearance forms with automated checks against the active academic clearance window.
* **Course Form Routing**: Automated routing of semester course registration forms directly to the student's designated Head of Department (HOD).
* **Document Inspector**: Interactive in-browser PDF preview with multi-tier progress trackers and audit event timelines.
* **Instant Retrieval**: Download tamper-evident, digitally signed and stamped PDF documents.

### 2. ✍️ Staff Reviewer Portal (`/staff`)
* **Role-Adaptive Dashboards**:
  * **Faculty Bursar**: Inspect faculty clearance submissions and sign with digital signature, timestamp, and Bursar seal.
  * **University Auditor**: Perform final review on Bursar-approved forms to append official Auditor endorsement.
  * **Head of Department (HOD)**: Review and endorse departmental course registration forms.
* **Review Workspace**: Split-screen PDF viewer with zoom controls, fullscreen mode, one-click digital signing, and structured rejection reason handling.
* **Credential Management**: Upload official passport photographs, transparent digital signatures, and institutional seals.

### 3. 🛡️ System Administration Portal (`/admin`)
* **Executive Overview**: High-level institutional metrics, document velocity gauges, and real-time backend service health monitors.
* **Staff Verification Queue**: Multi-attribute review and approval of staff self-registrations.
* **Access Control & Escalation**: Promote verified staff members to System Administrators and manage role permissions.
* **Student & Staff Directories**: Search, filter by faculty/department/level, paginate, and toggle account suspensions.
* **Master Document Registry**: Institutional repository with multi-filter search and embedded inspection.
* **Clearance Period Management**: Configure session and semester submission windows to activate or deactivate intake.
* **Immutable Audit Trails**: Traceable logs capturing all signature placements, approvals, rejections, and administrative actions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Design System |
| **State Management** | [Zustand](https://zustand.docs.pmnd.rs/) with LocalStorage Persistence |
| **Data Fetching & Cache** | [TanStack React Query v5](https://tanstack.com/query) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) with JWT Auto-Refresh Interceptors |
| **Icons & UI** | [Lucide React](https://lucide.dev/) |
| **Typography** | Inter (Google Fonts) |

---

## 📂 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx             # Role-based unified login (Student / Staff / Admin)
│   │   ├── student-register/page.tsx  # 3-step student onboarding wizard
│   │   └── staff-register/page.tsx    # Staff registration portal
│   ├── student/
│   │   ├── layout.tsx                 # Protected STUDENT layout + profile gate
│   │   ├── dashboard/page.tsx         # Clearance & Course Form overview
│   │   ├── documents/page.tsx         # Document registry & upload modal
│   │   ├── documents/[id]/page.tsx    # PDF viewer, workflow tracker & timeline
│   │   ├── profile/page.tsx           # Passport & transparent signature dropzones
│   │   └── settings/page.tsx          # Account preferences
│   ├── staff/
│   │   ├── layout.tsx                 # Protected STAFF layout (approval check)
│   │   ├── dashboard/page.tsx         # Adaptive Bursar / Auditor / HOD review queue
│   │   ├── documents/page.tsx         # Assigned document registry
│   │   ├── documents/[id]/page.tsx    # Split review workspace + Sign / Reject actions
│   │   ├── profile/page.tsx           # Passport, signature & seal upload
│   │   └── settings/page.tsx          # Staff account settings
│   ├── admin/
│   │   ├── layout.tsx                 # Protected ADMIN layout
│   │   ├── dashboard/page.tsx         # High-level institutional KPIs & monitors
│   │   ├── students/page.tsx          # Student directory & suspension controls
│   │   ├── students/[id]/page.tsx     # Student profile & submitted documents
│   │   ├── staff/page.tsx             # Staff directory & approval queue
│   │   ├── staff/[id]/page.tsx        # Staff profile & role escalation
│   │   ├── documents/page.tsx         # Global institutional documents registry
│   │   ├── audit-logs/page.tsx        # Immutable audit records & search
│   │   ├── analytics/page.tsx         # Processing velocities & department metrics
│   │   ├── clearance-period/page.tsx  # Clearance submission window configuration
│   │   ├── system-health/page.tsx     # Live service status monitors
│   │   └── settings/page.tsx          # Admin configuration
│   ├── globals.css                    # Design tokens, variables & base components
│   ├── layout.tsx                     # Root layout with QueryProvider & Inter font
│   ├── page.tsx                       # Session & role-based landing router
│   └── unauthorized/page.tsx          # 403 Forbidden page
├── src/
│   ├── components/
│   │   ├── admin/                     # ClearancePeriodCard, StaffApprovalQueue, etc.
│   │   ├── documents/                 # PdfViewer, WorkflowTracker, Timeline, SignDialog, RejectDialog
│   │   ├── layout/                    # AppShell, Sidebar, Header, MobileDrawer
│   │   ├── profile/                   # FileUploadDropzone, ProfileCard
│   │   └── shared/                    # StatusBadge, StatCard, EmptyState, LoadingSkeleton
│   ├── lib/
│   │   ├── api/                       # Axios client & typed API endpoints
│   │   ├── auth/                      # Zustand authStore & session persistence
│   │   ├── constants/                 # EKSU faculties, departments & status definitions
│   │   └── validations/               # Zod validation schemas
│   ├── providers/                     # React Query & application providers
│   └── types/                         # TypeScript interfaces (User, Document, Admin, API)
└── .env                               # Environment configuration
```

---

## ⚡ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.0+) or [Bun](https://bun.sh/) (v1.0+)
* Running backend instance (FastAPI default: `http://localhost:8000/api/v1`)

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Installation

```bash
# Using Bun (Recommended)
bun install

# Or using npm
npm install
```

### 3. Development Server

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build

```bash
# Using Bun
bun run build
bun run start

# Or using npm
npm run build
npm run start
```

---

## 🎨 Design System & Accessibility

* **Color Palette**: Deep Institutional Navy (`#1e3a8a`), Slate Neutral Surfaces (`#f8fafc`), Clean Whites (`#ffffff`), and Slate Borders (`#e2e8f0`).
* **Semantic Status Indicators**:
  * `PENDING_*` $\rightarrow$ Amber (`badge-warning`)
  * `COMPLETED` / `APPROVED` $\rightarrow$ Emerald (`badge-success`)
  * `REJECTED` / `SUSPENDED` $\rightarrow$ Rose (`badge-error`)
* **Responsive Layout**: Fluid breakpoints, mobile slide-out navigation drawers, accessible modals, and touch-optimized data tables.

---

## 📄 License

This repository and its codebase are proprietary intellectual property developed for **Ekiti State University (EKSU)**. All rights reserved.