# PlanWise-AI 🧠💸

**PlanWise-AI** is a smart financial planning tool I built using **Next.js**, **Firebase**, and **AI integration**. The goal is to help users manage budgets, track expenses, and get AI-powered financial suggestions — all through a modern and responsive UI.

---

## 🔍 About This Project

I built this project to explore how AI can help everyday users take control of their financial planning. It combines Firebase for backend/auth, OpenAI for AI-driven insights, and Next.js (App Router) for a smooth frontend experience.

---

## 🔑 Key Features

- AI-generated personalized budget plans
- User sign-up/login with Firebase Auth
- Real-time data storage via Firestore
- Dashboard for tracking spending and saving goals
- Clean, responsive UI built with Tailwind CSS

---

## 🧱 Folder Structure Overview

src/
┣ app/ → Main routing and pages (Next.js App Router)
┣ components/ → UI components (Header, Sidebar, etc.)
┣ firebase/ → Firebase configs and hooks
┣ styles/ → Global and module-level styles
┗ utils/ → Helper functions (formatting, validation, etc.)

---

## 🚀 Getting Started

To run this locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/SadamAnjaneyulu/PlanWise-AI.git
   cd PlanWise-AI
Install dependencies
npm install
Set up environment variables

Create a .env.local file in the root folder:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
OPENAI_API_KEY=your_openai_key (optional)
Run the app
npm run dev
🌍 Deployment
This app is ready for deployment. I personally use Vercel for hosting:
vercel
You can also deploy it to Firebase Hosting or Netlify if you prefer.

📷 Screenshots (Coming soon!)
I'm working on adding demo images of the dashboard and user flow.

🤝 Contributions
If you’re interested in contributing or collaborating, feel free to open a PR or reach out. I'm always open to feedback and new ideas.

📜 License
This project is open-source and available under the MIT License.

🙏 Thanks To
https://nextjs.org/
https://firebase.google.com/
https://tailwindcss.com/
https://openai.com/
