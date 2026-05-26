# Financial Wellness & Tax Assistant

Payroll and tax wellness app for employees. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- Employee login with session JWT (`emp_101`, `emp_102`)
- Payslip upload (PDF/image) with structured extraction
- Payroll dashboard — earnings, deductions, YTD, month-over-month comparison
- AI chat — answers from payroll records only
- Tax saving simulator (simplified 80C/80D)
- Proof & declaration checklist
- Per-employee data isolation on every API route

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and sign in as **Priya Sharma** (`emp_101`) or **Rahul Mehta** (`emp_102`).

### LLM API (optional)

```env
LLM_WRAPPER_API_TOKEN=your_token
LLM_WRAPPER_URL=https://llm-wrapper-741152993481.asia-south1.run.app
SESSION_SECRET=your-random-secret
```

Verify: `./scripts/test-llm-wrapper.sh`

Without a token, chat uses built-in rules over your payroll JSON.

## Walkthrough

1. Login and open the dashboard
2. Upload `sample-payslip.pdf` (or run `npm run generate-payslip`)
3. Ask the assistant: “How much HRA did I receive?” or “Why is my salary lower this month?”
4. Run a tax simulation with additional 80C investment
5. Sign in as the other employee to confirm data isolation

## Architecture

```
app/           pages and API routes
components/    UI
lib/           auth, storage, authorization
services/      business logic and LLM client
prompts/       system prompts and context builder
data/          seed JSON; runtime/ for uploads
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/payroll` | Payroll summary |
| GET | `/api/payslips` | Payslip list or detail |
| POST | `/api/upload-payslip` | Upload payslip |
| POST | `/api/ask-ai` | Payroll Q&A |
| POST | `/api/tax-simulation` | Tax estimate |
| GET | `/api/checklist` | Proof checklist |

## AI behavior

1. System prompt restricts answers to provided payroll JSON
2. Full payslip and declaration data is sent with each question
3. Missing fields return a standard “not found in records” message
4. Chat UI shows source references where applicable

## Authorization

- JWT session cookie (`fw_session`)
- Middleware protects authenticated routes
- APIs filter by `session.userId` and return 403 on cross-user access

## Assumptions

- Payslip extraction uses per-employee templates (file content not parsed)
- Data stored in JSON under `data/` and `data/runtime/`
- Tax math uses simplified rates; not for compliance

## Testing

```bash
npm test
```

50 unit tests covering auth, OCR validation, payroll comparison, tax logic, checklist, and LLM client.

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · jose · Vitest
