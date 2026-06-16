# 🛡️ LifeQuest: The OS for the Self

**LifeQuest** is a premium, gamified productivity engine designed to transform your daily tasks into an immersive RPG journey. Built for high-performers who want to balance intense focus with holistic well-being, LifeQuest integrates advanced AI, real-time cloud synchronization, and strategic productivity frameworks into a stunning glassmorphic interface.

![LifeQuest Dashboard Mockup](https://raw.githubusercontent.com/Antz1886/LifeQuest/master/public/og-image.png)

## 🚀 Key Features

### 🧠 AI-Powered Strategy
- **Context-Aware Quest Forging**: Uses **Firebase Genkit** and **Gemini 2.5 Flash** to generate daily "Quests" based on your high-level goals, active projects, and even local weather conditions.
- **Quest Board Memory Retention**: AI-generated quests are merged and appended to your active quest list using Firestore batch writes, ensuring you never lose your manually created or existing quests.
- **Personalized Meditations & Speech Synthesis**: Generates AI-driven meditation scripts on the fly. Playback is powered by an interactive client-side **Web Speech Synthesis Player** featuring speed adjustments (0.6x - 1.2x) and full playback controls (Play/Pause/Stop). Includes quick selection prompts (e.g., *Calm Anxiety, Deep Focus, Deep Sleep, Morning Gratitude*).
- **Strategic Calendar Sync**: Automatically imports events from Google Calendar and Outlook, intelligently converting appointments into actionable quests. For Google Calendar, authentication forces consent parameters to ensure refresh tokens and readonly scopes are successfully authorized.

### 🎮 Gamified Growth & Visual Customization
- **Experience & Leveling**: Earn XP for completing quests. Features an **Adaptive XP** system that grants a 50% bonus for overcoming procrastination on tasks older than 3 days.
- **Counter Reset Security**: A secure progress reset routine that immediately clears active profiles and deletes residual local storage guest keys, preventing Firestore snapshots from accidentally restoring guest data.
- **RPG Disciplines**: Track progress across five core disciplines: *Mind, Strength, Code, Wisdom,* and *Legacy*.
- **Platform Themes**: Select from six RPG-inspired visual themes (*Cyberpunk, Forest, Ocean, Cosmic, Sunset, Minimal*) implemented with high-specificity CSS overrides to guarantee reliable loading and rendering regardless of next-css loading order.

### 📈 Professional Productivity
- **Eisenhower Matrix**: A strategic view that automatically categorizes your workload by Importance and Urgency.
- **Energy Level Profiling**: Tasks are tagged with energy requirements (Low/Medium/High), allowing you to match quests to your current mental state.
- **Project Vault**: Deep-link quests to long-term projects for structured goal tracking.

### 📱 Modern Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: Tailwind CSS with custom theme variables.
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
   Create a `.env` file and add your Firebase and Genkit credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Initialize Genkit (Optional)**:
   ```bash
   npm run genkit:dev
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
