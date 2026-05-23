import type { Quest, UserProfile } from "@/lib/types";
import { subDays, formatISO } from 'date-fns';

export const userProfile: UserProfile = {
  name: "Adventurer",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streaks: {
    personal: 0,
    work: 0,
    freelancing: 0,
    mindBody: 0,
  },
  title: "Novice",
  avatarUrl: "",
  theme: "default",
};

export const quests: Quest[] = [];
