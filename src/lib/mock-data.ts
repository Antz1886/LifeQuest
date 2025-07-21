import type { Quest, UserProfile } from "@/lib/types";
import { subDays } from 'date-fns';

export const userProfile: UserProfile = {
  name: "Ansline",
  level: 12,
  xp: 1250,
  xpToNextLevel: 2000,
  streaks: {
    gym: 0, // Will be calculated dynamically
    meditation: 0,
    code: 0,
  },
};

// Mock quests with some recent completion dates for demo purposes
export const quests: Quest[] = [
  { id: 'q1', title: 'Morning Gym Session', category: 'Strength', xp: 50, isCompleted: true, time: '6 AM', completedAt: subDays(new Date(), 1).getTime() },
  { id: 'q2', title: 'Review Cybersecurity Notes', category: 'Wisdom', xp: 75, isCompleted: false, time: '7 AM' },
  { id: 'q3', title: 'NOC Manager Duties', category: 'Legacy', xp: 100, isCompleted: false, time: '9 AM - 4 PM' },
  { id: 'q4', title: 'Work on Women\'s Health Biz', category: 'Legacy', xp: 80, isCompleted: false, time: '5 PM' },
  { id: 'q5', title: '1-hour Front-end dev study', category: 'Code', xp: 60, isCompleted: true, time: '8 PM', completedAt: new Date().getTime() },
  { id: 'q6', title: '15-min Guided Meditation', category: 'Mind', xp: 40, isCompleted: true, time: '9:30 PM', completedAt: subDays(new Date(), 2).getTime() },
  { id: 'q7', title: 'Family Time', category: 'Mind', xp: 50, isCompleted: true, time: '6 PM', completedAt: new Date().getTime() },
  { id: 'q8', title: 'Push-ups Challenge', category: 'Strength', xp: 30, isCompleted: true, time: '12 PM', completedAt: new Date().getTime() },
];
