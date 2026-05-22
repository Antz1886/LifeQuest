export type QuestCategory = "Personal" | "Work" | "Freelancing" | "Mind & Body";
export type EnergyLevel = "Low" | "Medium" | "High";

export type Priority = 1 | 2 | 3 | 4; // 1: Urgent/Important, 2: Important, 3: Urgent, 4: Backlog

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  xp: number;
  isCompleted: boolean;
  time: string;
  completedAt?: number;
  date: string; // ISO date string
  energyLevel: EnergyLevel;
  projectId?: string;
  createdAt: number;
  priority: Priority;
  notes?: string;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streaks: {
    personal: number;
    work: number;
    freelancing: number;
    mindBody: number;
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

export interface SavedMeditation {
  id: string;
  prompt: string;
  script: string;
  audioDataUri: string;
  createdAt: number;
}
