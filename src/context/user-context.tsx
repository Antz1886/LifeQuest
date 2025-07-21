
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on initial client-side render
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedQuests = localStorage.getItem('userQuests');
      if (savedQuests) {
        setQuests(JSON.parse(savedQuests));
      }
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } catch (error) {
        console.error("Failed to save profile to localStorage", error);
      }
    }
  }, [profile, isLoaded]);

  // Save quests to localStorage whenever they change
  useEffect(() => {
     if (isLoaded) {
      try {
        localStorage.setItem('userQuests', JSON.stringify(quests));
      } catch (error) {
        console.error("Failed to save quests to localStorage", error);
      }
    }
  }, [quests, isLoaded]);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
     try {
       localStorage.setItem('userProjects', JSON.stringify(projects));
     } catch (error) {
       console.error("Failed to save projects to localStorage", error);
     }
   }
 }, [projects, isLoaded]);

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

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <UserContext.Provider value={{ profile, quests, projects, setQuests, addQuest, editQuest, deleteQuest, completeQuest, addProject, toggleProjectTask, addProjectTask }}>
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
