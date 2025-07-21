
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  profile: UserProfile;
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'isCompleted'>) => void;
  editQuest: (updatedQuest: Quest) => void;
  deleteQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const { toast } = useToast();

  const addQuest = (questData: Omit<Quest, 'id' | 'isCompleted'>) => {
    const newQuest: Quest = {
      ...questData,
      id: `q-${Date.now()}-${Math.random()}`,
      isCompleted: false,
    };
    setQuests(prevQuests => [...prevQuests, newQuest]);
  };

  const editQuest = (updatedQuest: Quest) => {
    setQuests(prevQuests => prevQuests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
  };
  
  const deleteQuest = (questId: string) => {
    setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
    toast({ title: "Quest Deleted", description: "The quest has been removed from your board."});
  };

  const completeQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    setQuests(quests.map(q => q.id === questId ? { ...q, isCompleted: true } : q));

    const newXp = profile.xp + quest.xp;
    if (newXp >= profile.xpToNextLevel) {
      setProfile({
        ...profile,
        level: profile.level + 1,
        xp: newXp - profile.xpToNextLevel,
        xpToNextLevel: Math.floor(profile.xpToNextLevel * 1.5),
      });
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached Level ${profile.level + 1}.`,
      });
    } else {
      setProfile({ ...profile, xp: newXp });
    }
    
    toast({
      title: "Quest Completed!",
      description: `You earned ${quest.xp} XP for completing "${quest.title}".`,
    });
  };

  return (
    <UserContext.Provider value={{ profile, quests, setQuests, addQuest, editQuest, deleteQuest, completeQuest }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
