
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';

interface UserContextType {
  profile: UserProfile;
  quests: Quest[];
  projects: Project[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'isCompleted'>) => void;
  editQuest: (updatedQuest: Quest) => void;
  deleteQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'tasks'>) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectTask: (projectId: string, taskText: string) => void;
  updateProfileCustomization: (title: string, avatarUrl: string) => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const userKey = user ? user.uid : 'guest';

  // Load data from localStorage
  useEffect(() => {
    if (!user) return; // Don't load if no user

    try {
      const savedProfile = localStorage.getItem(`userProfile_${userKey}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const displayName = user.displayName || "Adventurer";
        // Ensure name is updated from Google profile, but keep rest of saved data
        setProfile({ ...initialProfile, ...parsedProfile, name: displayName });
      } else {
        const displayName = user.displayName || "Adventurer";
        setProfile({ ...initialProfile, name: displayName });
      }

      const savedQuests = localStorage.getItem(`userQuests_${userKey}`);
      setQuests(savedQuests ? JSON.parse(savedQuests) : initialQuests);

      const savedProjects = localStorage.getItem(`userProjects_${userKey}`);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      const displayName = user.displayName || "Adventurer";
      setProfile({ ...initialProfile, name: displayName });
      setQuests(initialQuests);
      setProjects([]);
    } finally {
      setIsLoaded(true);
    }
  }, [user, userKey]);

  // Save data to localStorage
  useEffect(() => {
    if (isLoaded && user) {
      try {
        localStorage.setItem(`userProfile_${userKey}`, JSON.stringify(profile));
        localStorage.setItem(`userQuests_${userKey}`, JSON.stringify(quests));
        localStorage.setItem(`userProjects_${userKey}`, JSON.stringify(projects));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [profile, quests, projects, isLoaded, user, userKey]);


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
      const newLevel = profile.level + 1;
      setProfile({
        ...profile,
        level: newLevel,
        xp: newXp - profile.xpToNextLevel,
        xpToNextLevel: Math.floor(profile.xpToNextLevel * 1.5),
      });
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached Level ${newLevel}.`,
      });
    } else {
      setProfile({ ...profile, xp: newXp });
    }
    
    toast({
      title: "Quest Completed!",
      description: `You earned ${quest.xp} XP for completing "${quest.title}".`,
    });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: `p-${Date.now()}-${Math.random()}`,
      tasks: [], // Start with an empty task list
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  };
  
  const toggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
              ),
            }
          : p
      )
    );
  };

   const addProjectTask = (projectId: string, taskText: string) => {
    if (!taskText.trim()) return;

    const newTask: ProjectTask = {
      id: `t-${Date.now()}-${Math.random()}`,
      text: taskText,
      isCompleted: false,
    };

    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: [...p.tasks, newTask],
            }
          : p
      )
    );
  };

  const updateProfileCustomization = (title: string, avatarUrl: string) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      title,
      avatarUrl,
    }));
  };

  if (!isLoaded && user) {
    return <div className="flex w-full h-screen items-center justify-center">Loading User Data...</div>;
  }

  return (
    <UserContext.Provider value={{ profile, quests, projects, setQuests, addQuest, editQuest, deleteQuest, completeQuest, addProject, toggleProjectTask, addProjectTask, updateProfileCustomization, isLoaded }}>
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
