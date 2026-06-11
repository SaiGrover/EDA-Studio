# EDA Studio — Intelligent Dataset Explorer

A beautiful, full-stack EDA dashboard rebuilt with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Plotly.js**, and **TanStack Table** — with a **FastAPI-ready** backend and **PostgreSQL** via Prisma.

---

## ✨ What's new vs the original

| Feature | Original | This version |
|---|---|---|
| Framework | Vanilla HTML/JS | **Next.js 15 App Router** |
| Animations | CSS keyframes only | **Framer Motion** throughout |
| Charts | Chart.js | **Plotly.js** (richer, interactive) |
| Data table | Custom HTML table | **TanStack Table** (sort, filter, paginate) |
| Tab switching | Instant | **Animated tab indicator** (spring layout) |
| Loading | Static spinner | **Animated step sequence** with progress bar |
| Overview cards | Static numbers | **Count-up animation** on enter |
| Background | Plain cream | **Animated ambient gradient blobs** |
| Logo hover | None | **Wiggle animation** |
| Insights | Static scroll | **Staggered entrance** + hover lift |
| Top bar | Static | **Frosted glass**, animated entrance |
| DB persistence | None | **Prisma + PostgreSQL** for session history |
| API | None | **Next.js Route Handlers** for upload + sessions |

---

## 🗂 Project structure

```
eda-studio/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # SPA entry + state machine
│   ├── globals.css         # Global styles + CSS vars
│   └── api/
│       ├── analyse/route.ts  # Save/retrieve analysis sessions
│       └── upload/route.ts   # Server-side file parsing
│
├── components/
│   ├── landing/
│   │   └── LandingPage.tsx   # Upload zone, feature pills, ambient bg
│   └── dashboard/
│       ├── DashboardLayout.tsx  # Shell + animated tabs
│       ├── TopBar.tsx           # Frosted glass nav bar
│       ├── LoadingScreen.tsx    # Animated step loader
│       ├── OverviewGrid.tsx     # Count-up stat cards
│       ├── InsightsBar.tsx      # Scrollable pattern cards
│       ├── DistributionsTab.tsx # Plotly histograms + scatter
│       ├── CorrelationsTab.tsx  # Heatmap + top-pairs list
│       ├── StatisticsTab.tsx    # Descriptive stats table
│       ├── RawDataTab.tsx       # TanStack Table with pagination
│       └── NotebookTab.tsx      # Syntax-highlighted notebook
│
├── lib/
│   ├── analysis.ts    # Core stats engine (pure TS)
│   ├── notebook.ts    # Jupyter notebook code generation
│   ├── utils.ts       # cn(), chart palettes, color maps
│   └── prisma.ts      # Prisma client singleton
│
├── types/
│   └── analysis.ts    # All TypeScript interfaces
│
├── prisma/
│   └── schema.prisma  # PostgreSQL schema
│
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure your database

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### 3. Push the Prisma schema

```bash
npx prisma db push
# or for migrations:
npx prisma migrate dev --name init
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🎨 Design system

The color theme from the original is preserved exactly and extended:

| Token | Hex | Usage |
|---|---|---|
| `--rose-dark` | `#c44d6a` | Primary accent, CTAs |
| `--rose-mid` | `#e8778f` | Charts, spinner, highlights |
| `--sage-mid` | `#6fa896` | Success, hover states |
| `--lavender-mid` | `#9b89d4` | Correlation, second accent |
| `--sand-mid` | `#c9a87a` | Badges, imbalance |
| `--sky-mid` | `#6a9fc4` | Scatter, sky elements |
| `--cream` | `#faf7f2` | Page background |
| `--ink` | `#2d2820` | Primary text |

Fonts: **DM Serif Display** (headings) · **DM Sans** (body) · **DM Mono** (code/data)

---

## 📊 Supported file formats

- **CSV** — comma-separated values
- **TSV** — tab-separated values  
- **JSON** — array of objects, or `{ data: [...] }`

Max file size: **50 MB** via the server-side upload API.

---

## 🔌 API routes

### `POST /api/upload`
Parse a file server-side and return rows + fileName.

**Body**: `multipart/form-data` with `file` field.

### `POST /api/analyse`
Save an analysis session to PostgreSQL.

### `GET /api/analyse`
List recent sessions (no query) or fetch one (`?id=xxx`).

---

## 🏗 Adding to your stack

The analysis engine (`lib/analysis.ts`) is pure TypeScript with no browser dependencies — it can be imported in any Next.js Route Handler or server action to run analysis server-side.

```ts
import { analyseData } from '@/lib/analysis';

const result = analyseData(rows, Object.keys(rows[0]));
```
