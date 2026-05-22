import type { Quest, UserProfile } from "@/lib/types";
import { subDays, formatISO } from 'date-fns';

export const userProfile: UserProfile = {
  name: "Ansline",
  level: 12,
  xp: 1250,
  xpToNextLevel: 2000,
  streaks: {
    personal: 0, // Will be calculated dynamically
    work: 0,
    freelancing: 0,
    mindBody: 0,
  },
};

const today = new Date();
export const quests: Quest[] = [
  { id: 'q1', title: 'Morning Gym Session', category: 'Mind & Body', xp: 50, isCompleted: true, time: '6 AM', completedAt: subDays(today, 1).getTime(), date: formatISO(subDays(today, 1), { representation: 'date' }), energyLevel: 'High', createdAt: today.getTime(), priority: 2 },
  { id: 'q2', title: 'Review Cybersecurity Notes', category: 'Work', xp: 75, isCompleted: false, time: '7 AM', date: formatISO(today, { representation: 'date' }), energyLevel: 'Medium', createdAt: today.getTime(), priority: 2 },
  { id: 'q3', title: 'NOC Manager Duties', category: 'Work', xp: 100, isCompleted: false, time: '9 AM - 4 PM', date: formatISO(today, { representation: 'date' }), energyLevel: 'High', createdAt: today.getTime(), priority: 1 },
  { id: 'q4', title: 'Work on Women\'s Health Biz', category: 'Freelancing', xp: 80, isCompleted: false, time: '5 PM', date: formatISO(today, { representation: 'date' }), energyLevel: 'High', createdAt: today.getTime(), priority: 2 },
  { id: 'q5', title: '1-hour Front-end dev study', category: 'Work', xp: 60, isCompleted: true, time: '8 PM', completedAt: today.getTime(), date: formatISO(today, { representation: 'date' }), energyLevel: 'Medium', createdAt: today.getTime(), priority: 2 },
  { id: 'q6', title: '15-min Guided Meditation', category: 'Mind & Body', xp: 40, isCompleted: true, time: '9:30 PM', completedAt: subDays(today, 2).getTime(), date: formatISO(subDays(today, 2), { representation: 'date' }), energyLevel: 'Low', createdAt: today.getTime(), priority: 2 },
  { id: 'q7', title: 'Family Time', category: 'Personal', xp: 50, isCompleted: true, time: '6 PM', completedAt: today.getTime(), date: formatISO(today, { representation: 'date' }), energyLevel: 'Low', createdAt: today.getTime(), priority: 2 },
  { id: 'q8', title: 'Push-ups Challenge', category: 'Mind & Body', xp: 30, isCompleted: true, time: '12 PM', completedAt: today.getTime(), date: formatISO(today, { representation: 'date' }), energyLevel: 'Medium', createdAt: today.getTime(), priority: 3 },
];
