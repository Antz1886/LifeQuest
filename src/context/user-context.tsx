
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask, QuestCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { isSameDay, subDays, startOfDay } from 'date-fns';


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
        .sort((a, b) => b.completedAt! - a.completedAt!);

    const calculateStreakForCategory = (cat: keyof typeof streaks) => {
        let streak = 0;
        let currentDate = startOfDay(new Date());
        
        const categoryQuests = sortedQuests.filter(q => categoryMap[q.category] === cat);
        const uniqueDays = Array.from(new Set(categoryQuests.map(q => startOfDay(new Date(q.completedAt!)).getTime()))).sort((a,b) => b-a);
        
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const userKey = user ? user.uid : 'guest';

  // Load data from localStorage
  useEffect(() => {
    if (!user) {
        setIsLoaded(false);
        return;
    };

    try {
      const savedProfile = localStorage.getItem(`userProfile_${userKey}`);
      const savedQuests = localStorage.getItem(`userQuests_${userKey}`);
      const savedProjects = localStorage.getItem(`userProjects_${userKey}`);

      const loadedQuests = savedQuests ? JSON.parse(savedQuests) : initialQuests;
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const displayName = user.displayName || "Adventurer";
        setProfile({ ...initialProfile, ...parsedProfile, name: displayName });
      } else {
        const displayName = user.displayName || "Adventurer";
        setProfile({ ...initialProfile, name: displayName });
      }

      setQuests(loadedQuests);
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
  const saveData = useCallback(() => {
    if (isLoaded && user) {
      try {
        localStorage.setItem(`userProfile_${userKey}`, JSON.stringify(profile));
        localStorage.setItem(`userQuests_${userKey}`, JSON.stringify(quests));
        localStorage.setItem(`userProjects_${userKey}`, JSON.stringify(projects));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [isLoaded, user, userKey, profile, quests, projects]);

  useEffect(() => {
      saveData();
  }, [saveData]);


  // Recalculate streaks and update profile state when quests change
  useEffect(() => {
    if (isLoaded) {
      const completedQuests = quests.filter(q => q.isCompleted);
      const updatedStreaks = calculateStreaks(completedQuests);
      setProfile(prevProfile => ({...prevProfile, streaks: updatedStreaks}));
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
    const newXp = profile.xp + xpChange;

    if (isNowCompleted) {
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
    } else {
        // Handle de-leveling if necessary (optional, but good for consistency)
        if (newXp < 0) {
            // This logic can be complex, for now, just set xp to 0 or handle de-leveling
            // For simplicity, we'll just adjust XP.
             setProfile({ ...profile, xp: newXp });
        } else {
             setProfile({ ...profile, xp: newXp });
        }
        toast({
            title: "Quest Undone",
            description: `Re-added "${quest.title}" to your board.`,
            variant: "default"
        });
    }
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

  if (!isLoaded && user) {
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
