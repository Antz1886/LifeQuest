
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask, QuestCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { isSameDay, subDays, startOfDay, formatISO } from 'date-fns';


// Helper function to calculate streaks
const calculateStreaks = (completedQuests: Quest[]) => {
    const streaks = { gym: 0, meditation: 0, code: 0 };
    const categoryMap: { [key in QuestCategory]?: keyof typeof streaks } = {
        'Strength': 'gym',
        'Mind': 'meditation',
        'Code': 'code'
    };

    const sortedQuests = completedQuests
        .filter(q => q.completedAt && q.category in categoryMap)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const calculateStreakForCategory = (cat: keyof typeof streaks) => {
        let streak = 0;
        let currentDate = startOfDay(new Date());
        
        const categoryQuests = sortedQuests.filter(q => categoryMap[q.category] === cat);
        const uniqueDays = Array.from(new Set(categoryQuests.map(q => startOfDay(new Date(q.date)).getTime()))).sort((a,b) => b-a);
        
        if (uniqueDays.length === 0) return 0;
        
        // Check if there's a completion today or yesterday
        if (isSameDay(uniqueDays[0], currentDate) || isSameDay(uniqueDays[0], subDays(currentDate, 1))) {
           streak = 1;
           let lastDate = startOfDay(new Date(uniqueDays[0]));

           for (let i = 1; i < uniqueDays.length; i++) {
               const day = startOfDay(new Date(uniqueDays[i]));
               if (isSameDay(day, subDays(lastDate, 1))) {
                   streak++;
                   lastDate = day;
               } else {
                   break;
               }
           }
        }
        return streak;
    }

    streaks.gym = calculateStreakForCategory('gym');
    streaks.meditation = calculateStreakForCategory('meditation');
    streaks.code = calculateStreakForCategory('code');

    return streaks;
};


interface UserContextType {
  profile: UserProfile;
  quests: Quest[];
  projects: Project[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt'>) => void;
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
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const userKey = 'guest';

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(`userProfile_${userKey}`);
      const savedQuests = localStorage.getItem(`userQuests_${userKey}`);
      const savedProjects = localStorage.getItem(`userProjects_${userKey}`);

      const loadedProfile = savedProfile ? JSON.parse(savedProfile) : initialProfile;
      const loadedQuests = savedQuests ? JSON.parse(savedQuests) : initialQuests;
      const loadedProjects = savedProjects ? JSON.parse(savedProjects) : [];
      
      setProfile(loadedProfile);
      setQuests(loadedQuests.map((q: Quest) => ({...q, date: q.date || formatISO(new Date(), { representation: 'date' })})));
      setProjects(loadedProjects);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Set to defaults if loading fails
      setProfile(initialProfile);
      setQuests(initialQuests);
      setProjects([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((key: string, data: any) => {
      if (isLoaded) {
          try {
              localStorage.setItem(`${key}_${userKey}`, JSON.stringify(data));
          } catch (error) {
              console.error("Failed to save data to localStorage", error);
          }
      }
  }, [isLoaded]);

  useEffect(() => {
    saveData('userProfile', profile);
  }, [profile, saveData]);

  useEffect(() => {
    saveData('userQuests', quests);
  }, [quests, saveData]);

  useEffect(() => {
    saveData('userProjects', projects);
  }, [projects, saveData]);


  // Recalculate streaks and update profile state when quests change
  useEffect(() => {
    if (isLoaded) {
      const completedQuests = quests.filter(q => q.isCompleted);
      const updatedStreaks = calculateStreaks(completedQuests);
      setProfile(prevProfile => {
        if(JSON.stringify(prevProfile.streaks) !== JSON.stringify(updatedStreaks)) {
          return {...prevProfile, streaks: updatedStreaks}
        }
        return prevProfile;
      });
    }
  }, [quests, isLoaded]);


  const addQuest = (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt'>) => {
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
    if (!quest) return;

    // Toggle completion status
    const isNowCompleted = !quest.isCompleted;

    setQuests(prevQuests => prevQuests.map(q => 
        q.id === questId ? { ...q, isCompleted: isNowCompleted, completedAt: isNowCompleted ? Date.now() : undefined } : q
    ));

    const xpChange = isNowCompleted ? quest.xp : -quest.xp;
    
    setProfile(p => {
        const newXp = p.xp + xpChange;
        if (isNowCompleted) {
            if (newXp >= p.xpToNextLevel) {
              const newLevel = p.level + 1;
              toast({
                title: "Level Up!",
                description: `Congratulations! You've reached Level ${newLevel}.`,
              });
              return {
                ...p,
                level: newLevel,
                xp: newXp - p.xpToNextLevel,
                xpToNextLevel: Math.floor(p.xpToNextLevel * 1.5),
              };
            } else {
              toast({
                  title: "Quest Complete!",
                  description: `You earned ${quest.xp} XP!`,
              })
              return { ...p, xp: newXp };
            }
        } else {
             toast({
                title: "Quest Undone",
                description: `Re-added "${quest.title}" to your board.`,
                variant: "default"
            });
            return { ...p, xp: newXp };
        }
    });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'tasks'>) => {
    const newProject: Project = {
      ...projectData,
      id: `p-${Date.now()}-${Math.random()}`,
      tasks: [],
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

  if (!isLoaded) {
    return <div className="flex w-full h-screen items-center justify-center bg-background">Loading User Data...</div>;
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
