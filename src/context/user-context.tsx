
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask, QuestCategory, SavedMeditation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { isSameDay, subDays, startOfDay, formatISO } from 'date-fns';
import { Loader2 } from 'lucide-react';


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
  savedMeditations: SavedMeditation[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt'>) => void;
  editQuest: (updatedQuest: Quest) => void;
  deleteQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'tasks'>) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectTask: (projectId: string, taskText: string) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  updateProfileCustomization: (title: string, avatarUrl: string) => void;
  addSavedMeditation: (meditationData: { prompt: string; script: string; audioDataUri: string }) => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedMeditations, setSavedMeditations] = useState<SavedMeditation[]>([]);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const userKey = authUser ? authUser.uid : 'guest';

  // Load data from localStorage
  useEffect(() => {
    if (authLoading) return; // Wait for auth to settle

    try {
      const savedProfile = localStorage.getItem(`userProfile_${userKey}`);
      const savedQuests = localStorage.getItem(`userQuests_${userKey}`);
      const savedProjects = localStorage.getItem(`userProjects_${userKey}`);
      const savedMeditations = localStorage.getItem(`userMeditations_${userKey}`);

      let loadedProfile = savedProfile ? JSON.parse(savedProfile) : initialProfile;
      if (authUser && !savedProfile) {
          loadedProfile.name = authUser.displayName || loadedProfile.name;
          loadedProfile.avatarUrl = authUser.photoURL || loadedProfile.avatarUrl;
      }
      
      const loadedQuests = savedQuests ? JSON.parse(savedQuests) : (userKey !== 'guest' ? [] : initialQuests);
      const loadedProjects = savedProjects ? JSON.parse(savedProjects) : [];
      const loadedMeditations = savedMeditations ? JSON.parse(savedMeditations) : [];
      
      setProfile(loadedProfile);
      setQuests(loadedQuests.map((q: Quest) => ({
          ...q, 
          date: q.date || formatISO(new Date(), { representation: 'date' }),
          energyLevel: q.energyLevel || "Medium",
          createdAt: q.createdAt || Date.now(),
          priority: q.priority || 2,
          notes: q.notes || ""
      })));
      setProjects(loadedProjects);
      setSavedMeditations(loadedMeditations);

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Set to defaults if loading fails
      setProfile(initialProfile);
      setQuests(initialQuests);
      setProjects([]);
      setSavedMeditations([]);
    } finally {
      setIsLoaded(true);
    }
  }, [userKey, authLoading, authUser]);

  // Save data to localStorage
  const saveData = useCallback((key: string, data: any) => {
      if (isLoaded) {
          try {
              localStorage.setItem(`${key}_${userKey}`, JSON.stringify(data));
          } catch (error) {
              if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                  console.warn("Storage quota exceeded. Clearing older meditations to make room.");
                  if (key === 'userMeditations') {
                      // If it's meditations failing, we try to save only the most recent one
                      const truncated = data.slice(0, 1);
                      localStorage.setItem(`${key}_${userKey}`, JSON.stringify(truncated));
                  }
              } else {
                console.error("Failed to save data to localStorage", error);
              }
          }
      }
  }, [isLoaded, userKey]);

  useEffect(() => {
    saveData('userProfile', profile);
  }, [profile, saveData]);

  useEffect(() => {
    saveData('userQuests', quests);
  }, [quests, saveData]);

  useEffect(() => {
    saveData('userProjects', projects);
  }, [projects, saveData]);

  useEffect(() => {
    saveData('userMeditations', savedMeditations);
  }, [savedMeditations, saveData]);


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
      createdAt: Date.now(),
    };
    setQuests(prevQuests => [...prevQuests, newQuest]);
    toast({ title: "Quest Added!", description: "A new quest has been added to your board." });
  };

  const editQuest = (updatedQuest: Quest) => {
    setQuests(prevQuests => prevQuests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
    toast({ title: "Quest Updated!", description: "Your quest has been successfully updated." });
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

    setQuests(prevQuests => 
        prevQuests.map(q => 
            q.id === questId ? { ...q, isCompleted: isNowCompleted, completedAt: isNowCompleted ? Date.now() : undefined } : q
        )
    );

    // Adaptive XP Calculation
    const daysOld = Math.floor((Date.now() - quest.createdAt) / (1000 * 60 * 60 * 24));
    const finalXP = (isNowCompleted && daysOld >= 3) ? Math.floor(quest.xp * 1.5) : quest.xp;
    const xpChange = isNowCompleted ? finalXP : -quest.xp;
    
    let leveledUp = false;
    let newLevelCache = profile.level;

    setProfile(p => {
        let newXp = p.xp + xpChange;
        if (newXp < 0) newXp = 0;

        if (isNowCompleted && newXp >= p.xpToNextLevel) {
            newLevelCache = p.level + 1;
            leveledUp = true;
            return {
                ...p,
                level: newLevelCache,
                xp: newXp - p.xpToNextLevel,
                xpToNextLevel: Math.floor(p.xpToNextLevel * 1.5),
            };
        }
        return { ...p, xp: newXp };
    });
    
    // Call toasts after state updates
    if (isNowCompleted) {
        if (leveledUp) {
            toast({
                title: `Level Up!`,
                description: `Congratulations! You've reached Level ${newLevelCache}.`,
            });
        } else {
            const bonusMsg = daysOld >= 3 ? " (includes 50% Anti-Procrastination bonus!)" : "";
            toast({
                title: "Quest Complete!",
                description: `You earned ${finalXP} XP!${bonusMsg}`,
            });
        }
    } else {
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

  const deleteProjectTask = (projectId: string, taskId: string) => {
      setProjects(prevProjects =>
        prevProjects.map(p =>
            p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.filter(t => t.id !== taskId),
                }
            : p
        )
    );
    toast({ title: "Task Deleted", description: "The task has been removed from the project." });
  }

  const updateProfileCustomization = (title: string, avatarUrl: string) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      title,
      avatarUrl,
    }));
  };

  const addSavedMeditation = (meditationData: { prompt: string; script: string; audioDataUri: string }) => {
    const newMeditation: SavedMeditation = {
      ...meditationData,
      id: `m-${Date.now()}`,
      createdAt: Date.now(),
    };
    setSavedMeditations(prev => {
        const updated = [newMeditation, ...prev];
        // Keep library small to avoid localStorage quota issues with large audio base64 strings
        return updated.slice(0, 3);
    });
  };

  if (!isLoaded || authLoading) {
    return (
        <div className="flex w-full h-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <UserContext.Provider value={{ profile, quests, projects, savedMeditations, setQuests, addQuest, editQuest, deleteQuest, completeQuest, addProject, toggleProjectTask, addProjectTask, deleteProjectTask, updateProfileCustomization, addSavedMeditation, isLoaded }}>
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
