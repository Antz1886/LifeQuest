export type QuestCategory = "Mind" | "Strength" | "Code" | "Wisdom" | "Legacy";

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  xp: number;
  isCompleted: boolean;
  time: string;
  completedAt?: number; // Added to track completion date
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streaks: {
    gym: number;
    meditation: number;
    code: number;
  }
  title?: string;
  avatarUrl?: string;
}

export interface ProjectTask {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tasks: ProjectTask[];
}
