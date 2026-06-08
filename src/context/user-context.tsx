
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { userProfile as initialProfile, quests as initialQuests } from '@/lib/mock-data';
import type { UserProfile, Quest, Project, ProjectTask, QuestCategory, SavedMeditation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { isSameDay, subDays, startOfDay, formatISO, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';


// Helper function to calculate streaks
const calculateStreaks = (completedQuests: Quest[]) => {
    const streaks = { personal: 0, work: 0, freelancing: 0, mindBody: 0 };
    const categoryMap: { [key in QuestCategory]?: keyof typeof streaks } = {
        'Personal': 'personal',
        'Work': 'work',
        'Freelancing': 'freelancing',
        'Mind & Body': 'mindBody'
    };

    const sortedQuests = completedQuests
        .filter(q => q.completedAt && q.category in categoryMap)
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    const calculateStreakForCategory = (cat: keyof typeof streaks) => {
        let streak = 0;
        let currentDate = startOfDay(new Date());
        
        const categoryQuests = sortedQuests.filter(q => categoryMap[q.category] === cat);
        const uniqueDays = Array.from(new Set(categoryQuests.map(q => startOfDay(parseISO(q.date)).getTime()))).sort((a,b) => b-a);
        
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

    streaks.personal = calculateStreakForCategory('personal');
    streaks.work = calculateStreakForCategory('work');
    streaks.freelancing = calculateStreakForCategory('freelancing');
    streaks.mindBody = calculateStreakForCategory('mindBody');

    return streaks;
};


interface UserContextType {
  profile: UserProfile;
  quests: Quest[];
  projects: Project[];
  savedMeditations: SavedMeditation[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt' | 'createdAt'>) => void;
  editQuest: (updatedQuest: Quest) => void;
  deleteQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'tasks'>) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  addProjectTask: (projectId: string, taskText: string) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  updateProfileCustomization: (title: string, avatarUrl: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProgress: () => void;
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

  // Real-time Firestore Sync
  useEffect(() => {
    if (authLoading) return;

    setIsLoaded(false);

    if (authUser) {
      // Authenticated User: Use Firestore
      const userDocRef = doc(db, 'users', authUser.uid);
      
      let profileLoaded = false;
      let questsLoaded = false;
      let projectsLoaded = false;
      let meditationsLoaded = false;

      const checkLoaded = () => {
        if (profileLoaded && questsLoaded && projectsLoaded && meditationsLoaded) {
          setIsLoaded(true);
        }
      };

      // 1. Sync Profile
      const unsubProfile = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          const init = { ...initialProfile, name: authUser.displayName || initialProfile.name, avatarUrl: authUser.photoURL || initialProfile.avatarUrl };
          setDoc(userDocRef, init);
        }
        profileLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Profile sync error", err);
        profileLoaded = true;
        checkLoaded();
      });

      // 2. Sync Quests & Handle Migration
      const questsRef = collection(db, 'users', authUser.uid, 'quests');
      const qQuests = query(questsRef, orderBy('createdAt', 'desc'));
      const unsubQuests = onSnapshot(qQuests, (snapshot) => {
        const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
        setQuests(qList);

        // MIGRATION LOGIC: If Firestore is empty but localStorage has guest data, offer to migrate
        if (qList.length === 0) {
            const guestQuests = localStorage.getItem('userQuests_guest');
            if (guestQuests) {
                const parsed = JSON.parse(guestQuests);
                if (parsed.length > 0) {
                    const batch = writeBatch(db);
                    parsed.forEach((q: Quest) => {
                        const newRef = doc(db, 'users', authUser.uid, 'quests', q.id);
                        batch.set(newRef, q);
                    });
                    batch.commit().then(() => {
                        toast({ title: "Data Synced!", description: "Your local history has been moved to the cloud." });
                        localStorage.removeItem('userQuests_guest');
                    });
                }
            }
        }
        questsLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Quests sync error", err);
        questsLoaded = true;
        checkLoaded();
      });

      // 3. Sync Projects
      const projectsRef = collection(db, 'users', authUser.uid, 'projects');
      const unsubProjects = onSnapshot(projectsRef, (snapshot) => {
        const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(pList);
        projectsLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Projects sync error", err);
        projectsLoaded = true;
        checkLoaded();
      });

      // 4. Sync Meditations
      const medsRef = collection(db, 'users', authUser.uid, 'meditations');
      const qMeds = query(medsRef, orderBy('createdAt', 'desc'));
      const unsubMeds = onSnapshot(qMeds, (snapshot) => {
        const mList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedMeditation));
        setSavedMeditations(mList);
        meditationsLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Meditations sync error", err);
        meditationsLoaded = true;
        checkLoaded();
      });

      return () => {
        unsubProfile();
        unsubQuests();
        unsubProjects();
        unsubMeds();
      };
    } else {
      // Guest: Use localStorage
      try {
        const savedProfile = localStorage.getItem(`userProfile_guest`);
        const savedQuests = localStorage.getItem(`userQuests_guest`);
        const savedProjects = localStorage.getItem(`userProjects_guest`);
        const savedMeditations = localStorage.getItem(`userMeditations_guest`);

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedProjects) setProjects(JSON.parse(savedProjects));
        if (savedMeditations) setSavedMeditations(JSON.parse(savedMeditations));
      } catch (e) {
        console.error("Guest storage load failed", e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, [authUser, authLoading]);

  // Fallback for Guest Data Persistence
  useEffect(() => {
    if (isLoaded && !authUser) {
      localStorage.setItem('userProfile_guest', JSON.stringify(profile));
      localStorage.setItem('userQuests_guest', JSON.stringify(quests));
      localStorage.setItem('userProjects_guest', JSON.stringify(projects));
      localStorage.setItem('userMeditations_guest', JSON.stringify(savedMeditations));
    }
  }, [profile, quests, projects, savedMeditations, isLoaded, authUser]);


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


  const addQuest = async (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt' | 'createdAt'>) => {
    const id = `q-${Date.now()}-${Math.random()}`;
    const newQuest: Quest = {
      ...questData,
      id,
      isCompleted: false,
      createdAt: Date.now(),
    };

    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'quests', id), newQuest);
    } else {
      setQuests(prevQuests => [...prevQuests, newQuest]);
    }
    toast({ title: "Quest Added!", description: "A new quest has been added to your board." });
  };

  const editQuest = async (updatedQuest: Quest) => {
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'quests', updatedQuest.id), updatedQuest);
    } else {
      setQuests(prevQuests => prevQuests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
    }
    toast({ title: "Quest Updated!", description: "Your quest has been successfully updated." });
  };
  
  const deleteQuest = async (questId: string) => {
    if (authUser) {
      await deleteDoc(doc(db, 'users', authUser.uid, 'quests', questId));
    } else {
      setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
    }
    toast({ title: "Quest Deleted", description: "The quest has been removed from your board."});
  };

  const completeQuest = async (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const isNowCompleted = !quest.isCompleted;
    const completedAt = isNowCompleted ? Date.now() : undefined;

    // Adaptive XP Calculation
    const daysOld = Math.floor((Date.now() - quest.createdAt) / (1000 * 60 * 60 * 24));
    const finalXP = (isNowCompleted && daysOld >= 3) ? Math.floor(quest.xp * 1.5) : quest.xp;
    const xpChange = isNowCompleted ? finalXP : -quest.xp;
    
    let leveledUp = false;
    let newLevelCache = profile.level;
    let updatedProfile = { ...profile };

    let newXp = profile.xp + xpChange;
    if (newXp < 0) newXp = 0;

    if (isNowCompleted && newXp >= profile.xpToNextLevel) {
        newLevelCache = profile.level + 1;
        leveledUp = true;
        updatedProfile = {
            ...profile,
            level: newLevelCache,
            xp: newXp - profile.xpToNextLevel,
            xpToNextLevel: Math.floor(profile.xpToNextLevel * 1.5),
        };
    } else {
        updatedProfile = { ...profile, xp: newXp };
    }

    if (authUser) {
        const batch = writeBatch(db);
        batch.set(doc(db, 'users', authUser.uid, 'quests', questId), { ...quest, isCompleted: isNowCompleted, completedAt });
        batch.set(doc(db, 'users', authUser.uid), updatedProfile);
        await batch.commit();
    } else {
        setQuests(prevQuests => prevQuests.map(q => q.id === questId ? { ...q, isCompleted: isNowCompleted, completedAt } : q));
        setProfile(updatedProfile);
    }
    
    if (isNowCompleted) {
        if (leveledUp) {
            toast({ title: `Level Up!`, description: `Congratulations! You've reached Level ${newLevelCache}.` });
        } else {
            const bonusMsg = daysOld >= 3 ? " (includes 50% Anti-Procrastination bonus!)" : "";
            toast({ title: "Quest Complete!", description: `You earned ${finalXP} XP!${bonusMsg}` });
        }
    } else {
        toast({ title: "Quest Undone", description: `Re-added "${quest.title}" to your board.` });
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'tasks'>) => {
    const id = `p-${Date.now()}-${Math.random()}`;
    const newProject: Project = {
      ...projectData,
      id,
      tasks: [],
    };
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'projects', id), newProject);
    } else {
      setProjects(prevProjects => [...prevProjects, newProject]);
    }
  };
  
  const toggleProjectTask = async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    const updatedProject = { ...project, tasks: updatedTasks };

    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'projects', projectId), updatedProject);
    } else {
      setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
    }
  };

   const addProjectTask = async (projectId: string, taskText: string) => {
    if (!taskText.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newTask: ProjectTask = {
      id: `t-${Date.now()}-${Math.random()}`,
      text: taskText,
      isCompleted: false,
    };
    const updatedProject = { ...project, tasks: [...project.tasks, newTask] };

    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'projects', projectId), updatedProject);
    } else {
      setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
    }
  };

  const deleteProjectTask = async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedProject = { ...project, tasks: project.tasks.filter(t => t.id !== taskId) };

    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'projects', projectId), updatedProject);
    } else {
      setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
    }
    toast({ title: "Task Deleted", description: "The task has been removed from the project." });
  }

  // Dynamic Theme Application
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      const themes = ['theme-cyberpunk', 'theme-forest', 'theme-ocean', 'theme-cosmic', 'theme-sunset', 'theme-minimal'];
      themes.forEach(t => root.classList.remove(t));
      
      if (profile?.theme && profile.theme !== 'default') {
        root.classList.add(`theme-${profile.theme}`);
      }
    }
  }, [profile?.theme]);

  const updateProfileCustomization = async (title: string, avatarUrl: string) => {
    const updatedProfile = { ...profile, title, avatarUrl };
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid), updatedProfile);
    } else {
      setProfile(updatedProfile);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid), updatedProfile);
    } else {
      setProfile(updatedProfile);
    }
  };

  const resetProgress = async () => {
    const updatedProfile = {
      ...profile,
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
      theme: "default"
    };

    if (authUser) {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', authUser.uid), updatedProfile);
      
      // Delete all quests to reset board history
      quests.forEach((q) => {
        batch.delete(doc(db, 'users', authUser.uid, 'quests', q.id));
      });
      
      await batch.commit();
    } else {
      setQuests([]);
      setProfile(updatedProfile);
    }
    toast({ title: "Progress Reset", description: "Your level, XP, streaks, and quest history have been reset to zero." });
  };

  const addSavedMeditation = async (meditationData: { prompt: string; script: string; audioDataUri: string }) => {
    const id = `m-${Date.now()}`;
    const newMeditation: SavedMeditation = {
      ...meditationData,
      id,
      createdAt: Date.now(),
    };
    
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid, 'meditations', id), newMeditation);
    } else {
      setSavedMeditations(prev => {
          const updated = [newMeditation, ...prev];
          return updated.slice(0, 3);
      });
    }
  };

  if (!isLoaded || authLoading) {
    return (
        <div className="flex w-full h-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <UserContext.Provider value={{ profile, quests, projects, savedMeditations, setQuests, addQuest, editQuest, deleteQuest, completeQuest, addProject, toggleProjectTask, addProjectTask, deleteProjectTask, updateProfileCustomization, updateProfile, resetProgress, addSavedMeditation, isLoaded }}>
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
