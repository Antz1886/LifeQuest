import type { Quest, UserProfile } from "@/lib/types";

export const userProfile: UserProfile = {
  name: "Alex",
  level: 12,
  xp: 1250,
  xpToNextLevel: 2000,
  streaks: {
    gym: 3,
    meditation: 7,
    code: 2,
  },
};

export const quests: Quest[] = [
  { id: 'q1', title: 'Morning Gym Session', category: 'Strength', xp: 50, isCompleted: true, time: '6 AM' },
  { id: 'q2', title: 'Review Cybersecurity Notes', category: 'Wisdom', xp: 75, isCompleted: false, time: '7 AM' },
  { id: 'q3', title: 'NOC Manager Duties', category: 'Legacy', xp: 100, isCompleted: false, time: '9 AM - 4 PM' },
  { id: 'q4', title: 'Work on Women\'s Health Biz', category: 'Legacy', xp: 80, isCompleted: false, time: '5 PM' },
  { id: 'q5', title: '1-hour Front-end dev study', category: 'Code', xp: 60, isCompleted: false, time: '8 PM' },
  { id: 'q6', title: '15-min Guided Meditation', category: 'Mind', xp: 40, isCompleted: false, time: '9:30 PM' },
  { id: 'q7', title: 'Family Time', category: 'Mind', xp: 50, isCompleted: false, time: '6 PM' },
];
