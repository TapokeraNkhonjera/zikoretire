# Zikoretire – Pension Projection System

Zikoretire is a full-stack pension projection and scenario analysis system built with **Next.js, Prisma, and MySQL**.
It allows users to simulate retirement outcomes, save projections, and explore alternative financial scenarios.

---

# 🚀 Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, TailwindCSS
* **Backend:** Next.js API Routes
* **Database:** MySQL (XAMPP / WAMP)
* **ORM:** Prisma
* **Auth:** NextAuth.js
* **Charts:** Recharts

---

# 📦 Project Structure (High Level)

```
app/
  (dashboard)/dashboard/
    projection/        → Main projection page
    history/           → Saved simulations
    simulation/[id]/   → Scenario workspace

app/api/
  simulation/          → Run + Save + History
  scenarios/           → Scenario calculations

components/
  sections/
    projection/        → Form + Results
    scenarios/         → Scenario workspace UI

prisma/
  schema.prisma        → Database schema
  seed.ts              → Default users
```

---

# ⚙️ Prerequisites

Before running the project, ensure you have:

* Node.js (v18+ recommended)
* npm / pnpm / yarn
* XAMPP or WAMP (MySQL running)
* Git

---

# 🛠️ Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/TapokeraNkhonjera/zikoretire.git
cd zikoretire/frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create a `.env` file in the `frontend` root:

```env
DATABASE_URL="mysql://root:@localhost:3306/zikoretire"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

👉 Make sure:

* Your MySQL server is running
* The database `zikoretire` exists (create it in phpMyAdmin if not)

---

## 4. Prisma Setup (IMPORTANT)

### Generate Prisma Client

```bash
npx prisma generate
```

---

### Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:

* Create all tables
* Sync your schema with MySQL

---

### Seed the Database (REQUIRED)

```bash
npx prisma db seed
```

This creates default users for testing.

---

## 👤 Default Users

After seeding, you can log in using:

```
Admin:
email: admin@zikoretire.com
password: password123

User:
email: user@zikoretire.com
password: password123
```

*(Update these in `prisma/seed.ts` if needed)*

---

# ▶️ Running the App

```bash
npm run dev
```

Open:

👉 http://localhost:3000

---

# 🧠 Core Concepts

## Projection System

* **Simulation** → Base financial model
* **Scenario** → Overrides on top of simulation
* **Projection** → Computed result

---

## Scenario System

Users can:

* Create multiple scenarios per simulation
* Modify only selected fields (delta-based)
* Compare results dynamically

---

## State Persistence

* Uses **sessionStorage (per user)**
* Prevents cross-user data leakage
* Maintains form + results during navigation

---

# ⚠️ Common Issues & Fixes

### ❌ Prisma not connecting

* Ensure MySQL is running
* Check `DATABASE_URL`
* Verify database exists

---

### ❌ Tables not created

Run:

```bash
npx prisma migrate dev
```

---

### ❌ No users available

Run seed:

```bash
npx prisma db seed
```

---

### ❌ Session issues / auth not working

* Check `NEXTAUTH_SECRET`
* Restart dev server

---

### ❌ State not persisting

* Make sure session is loaded
* Storage is user-scoped (`projection_state_<userId>`)

---

# 🧪 Development Workflow

### Create new feature branch

```bash
git checkout -b feature-name
```

---

### Push changes

```bash
git add .
git commit -m "your message"
git push origin feature-name
```

---

### Merge into main

```bash
git checkout main
git merge feature-name
git push origin main
```

---

# 📌 Next Improvements (Planned)

* Scenario comparison charts
* Backend persistence for scenarios
* Multi-device state sync
* Advanced financial modeling

---

# 📄 License

This project is for educational and internal use.

---

# 👤 Maintainer

**Tapokera Nkhonjera**

---

# 🔥 Final Note

If the system doesn’t run, it’s almost always:

* Prisma not migrated
* Database not created
* Seed not executed

Start there before debugging anything else.
