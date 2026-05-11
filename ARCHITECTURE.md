# 📐 Technical Architecture: LifeQuest

LifeQuest is architected as a high-performance, real-time "OS for the Self." This document outlines the technical decisions and data flows that power the application.

## 1. System Overview

LifeQuest is a **Next.js** application that leverages **Firebase** for its backend-as-a-service (BaaS) and **Genkit** for its AI orchestration. The application is designed to be fully reactive, with a real-time data bridge between the client-side React state and the cloud-hosted Firestore database.

## 2. Core Technical Pillars

### 🧠 AI Orchestration (Firebase Genkit)
The AI capabilities are built using **Firebase Genkit**, which provides a structured way to define "Flows" and "Prompts."
- **Quests Flow**: Orchestrates the conversion of user goals, active projects, and weather data into structured JSON quest objects.
- **Meditation Flow**: Uses a multi-step flow that first generates a script via Gemini and then synthesizes audio using Gemini's built-in TTS capabilities.
- **Models**: Primarily utilizes `gemini-2.0-flash` for high-speed, low-latency reasoning and generation.

### 🔄 Real-time Data Sync (Firestore)
The application implements a "Cloud-First, Local-Second" state management strategy:
- **`onSnapshot` Listeners**: The `UserContext` establishes persistent listeners to Firestore. Any change made on one device (e.g., completing a quest on a phone) is reflected globally within milliseconds.
- **Guest Fallback**: For unauthenticated users, the system gracefully degrades to `localStorage` while maintaining an identical API, allowing for a frictionless "Try Before You Buy" experience.

### 🎮 Gamification Engine
The logic for XP, levels, and streaks is centralized in the `UserContext`:
- **Adaptive XP**: Implements a time-decay algorithm where quests older than 3 days receive a `1.5x` XP multiplier to incentivize clearing "backlog" tasks and combat procrastination.
- **Streak Calculation**: A custom utility periodically parses completed quest history to calculate daily streaks for specific categories (Mind, Strength, Code).

## 3. Data Schema (Firestore)

### Users Collection
- `users/{uid}`: Document containing `UserProfile` (Level, XP, Streaks, Customization).
- `users/{uid}/quests`: Collection of `Quest` objects.
- `users/{uid}/projects`: Collection of `Project` objects (including sub-tasks).
- `users/{uid}/meditations`: Collection of `SavedMeditation` artifacts (including base64 audio).

## 📱 Mobile & PWA Optimization

LifeQuest is a **Progressive Web App (PWA)**:
- **Responsive Design**: Uses a custom "Glassmorphic" design system built with Tailwind CSS, optimized for variable screen sizes from mobile to ultra-wide monitors.
- **Manifest**: Includes a comprehensive `manifest.json` for native home-screen installation.
- **Service Workers**: Prepared for offline caching of core UI assets.

## 🛡️ Security & Privacy
- **Firebase Auth**: Secure Google OAuth integration.
- **Firestore Security Rules**: (Recommended) Data is siloed per user using `request.auth.uid`.

---

*This architecture is designed for scalability and high user engagement, blending modern web technologies with advanced behavioral psychology principles.*
