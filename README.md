# 🛡️ LifeQuest: The OS for the Self

**LifeQuest** is a premium, gamified productivity engine designed to transform your daily tasks into an immersive RPG journey. Built for high-performers who want to balance intense focus with holistic well-being, LifeQuest integrates advanced AI, real-time cloud synchronization, and strategic productivity frameworks into a stunning glassmorphic interface.

![LifeQuest Dashboard Mockup](https://raw.githubusercontent.com/Antz1886/LifeQuest/master/public/og-image.png)

## 🚀 Key Features

### 🧠 AI-Powered Strategy
- **Context-Aware Quest Forging**: Uses **Firebase Genkit** and **Gemini 2.0 Flash** to generate daily "Quests" based on your high-level goals, active projects, and even local weather conditions.
- **Personalized Meditations**: Generates AI-driven meditation scripts and converts them to soothing audio using high-fidelity TTS models.
- **Strategic Calendar Sync**: Automatically imports events from Google Calendar and Outlook, intelligently converting appointments into actionable quests.

### 🎮 Gamified Growth
- **Experience & Leveling**: Earn XP for completing quests. Features an **Adaptive XP** system that grants a 50% bonus for overcoming procrastination on tasks older than 3 days.
- **RPG Disciplines**: Track progress across five core disciplines: *Mind, Strength, Code, Wisdom,* and *Legacy*.
- **Visual Streaks**: Maintain daily rituals to visualize your momentum and consistency.

### 📈 Professional Productivity
- **Eisenhower Matrix**: A strategic view that automatically categorizes your workload by Importance and Urgency.
- **Energy Level Profiling**: Tasks are tagged with energy requirements (Low/Medium/High), allowing you to match quests to your current mental state.
- **Project Vault**: Deep-link quests to long-term projects for structured goal tracking.

### 📱 Modern Tech Stack
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: Tailwind CSS with a custom **Glassmorphism** design system.
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Authentication, Real-time Firestore Sync).
- **AI Engine**: [Firebase Genkit](https://firebase.google.com/docs/genkit) + Google Gemini.
- **PWA**: Fully installable as a Progressive Web App for a native mobile/tablet experience.

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Antz1886/LifeQuest.git
   cd LifeQuest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file and add your Firebase and Genkit credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Initialize Genkit (Optional)**:
   ```bash
   npx genkit start
   ```

## 📐 Architecture

LifeQuest follows a modern, decoupled architecture:
- **Client Side**: React Context API for global state management, synced in real-time with Firestore.
- **Server Side**: Next.js Server Actions handle secure AI flows and external API integrations (Google Calendar, Weather).
- **Persistence**: Hybrid approach using Firestore for authenticated users and localStorage for guests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Crafted with 💜 by [Antz1886](https://github.com/Antz1886)*
