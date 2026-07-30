
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
        .filter(q => q.date && q.completedAt && q.category in categoryMap)
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    const calculateStreakForCategory = (cat: keyof typeof streaks) => {
        let streak = 0;
        let currentDate = startOfDay(new Date());
        
        const categoryQuests = sortedQuests.filter(q => categoryMap[q.category] === cat);
        const uniqueDays = Array.from(new Set(categoryQuests.filter(q => q.date).map(q => startOfDay(parseISO(q.date)).getTime()))).sort((a,b) => b-a);
        
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
  addQuests: (newQuestsList: Omit<Quest, 'isCompleted' | 'completedAt'>[]) => Promise<void>;
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
  cloudSyncError: boolean;
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
  const [cloudSyncError, setCloudSyncError] = useState(false);

  // Reset sync error on user change
  useEffect(() => {
    setCloudSyncError(false);
  }, [authUser]);

  // Real-time Firestore Sync or Local Storage Fallback
  useEffect(() => {
    if (authLoading) return;

    setIsLoaded(false);

    const isLocalDevOffline = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      localStorage.getItem('mock_user') === 'true'
    );

    if (authUser && !cloudSyncError && !isLocalDevOffline) {
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

      const handleSyncError = (err: any, source: string) => {
        console.error(`${source} sync error`, err);
        const isPermissionDenied = err.code === 'permission-denied' || 
                                   err.message?.toLowerCase().includes('permission') || 
                                   err.message?.toLowerCase().includes('denied');
        if (isPermissionDenied) {
          setCloudSyncError(true);
          toast({
            title: "Database Sync Offline",
            description: "Access denied by Security Rules. Falling back to local storage.",
            variant: "destructive",
          });
        }
        
        // Mark as loaded so we don't block the UI forever
        if (source === 'Profile') profileLoaded = true;
        if (source === 'Quests') questsLoaded = true;
        if (source === 'Projects') projectsLoaded = true;
        if (source === 'Meditations') meditationsLoaded = true;
        checkLoaded();
      };

      // 1. Sync Profile
      const unsubProfile = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          const init = { ...initialProfile, name: authUser.displayName || initialProfile.name, avatarUrl: authUser.photoURL || initialProfile.avatarUrl };
          setDoc(userDocRef, init).catch((err) => handleSyncError(err, 'Profile'));
        }
        profileLoaded = true;
        checkLoaded();
      }, (err) => handleSyncError(err, 'Profile'));

      // 2. Sync Quests & Handle Migration
      const questsRef = collection(db, 'users', authUser.uid, 'quests');
      const qQuests = query(questsRef, orderBy('createdAt', 'desc'));
      const unsubQuests = onSnapshot(qQuests, (snapshot) => {
        const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
        setQuests(qList);

        // MIGRATION LOGIC: If Firestore is empty, migrate guest data from local storage
        if (qList.length === 0) {
          try {
            const guestQuestsStr = localStorage.getItem('userQuests_guest');
            const guestProjectsStr = localStorage.getItem('userProjects_guest');
            const guestMeditationsStr = localStorage.getItem('userMeditations_guest');
            const guestProfileStr = localStorage.getItem('userProfile_guest');

            const guestQuests = guestQuestsStr ? JSON.parse(guestQuestsStr) : [];
            const guestProjects = guestProjectsStr ? JSON.parse(guestProjectsStr) : [];
            const guestMeditations = guestMeditationsStr ? JSON.parse(guestMeditationsStr) : [];

            if (guestQuests.length > 0 || guestProjects.length > 0 || guestMeditations.length > 0) {
              const batch = writeBatch(db);

              if (guestProfileStr) {
                const parsedProfile = JSON.parse(guestProfileStr);
                batch.set(userDocRef, {
                  ...initialProfile,
                  name: authUser.displayName || initialProfile.name,
                  avatarUrl: authUser.photoURL || initialProfile.avatarUrl,
                  level: parsedProfile.level || 1,
                  xp: parsedProfile.xp || 0,
                  xpToNextLevel: parsedProfile.xpToNextLevel || 100,
                  theme: parsedProfile.theme || 'default',
                  streaks: parsedProfile.streaks || { personal: 0, work: 0, freelancing: 0, mindBody: 0 },
                }, { merge: true });
              }

              guestQuests.forEach((q: Quest) => {
                const newRef = doc(db, 'users', authUser.uid, 'quests', q.id);
                batch.set(newRef, q);
              });

              guestProjects.forEach((p: Project) => {
                const newRef = doc(db, 'users', authUser.uid, 'projects', p.id);
                batch.set(newRef, p);
              });

              guestMeditations.forEach((m: SavedMeditation) => {
                const newRef = doc(db, 'users', authUser.uid, 'meditations', m.id);
                batch.set(newRef, m);
              });

              batch.commit()
                .then(() => {
                  toast({ 
                    title: "Data Synced!", 
                    description: "Your local quests, projects, and meditations have been migrated to the cloud." 
                  });
                  try {
                    localStorage.removeItem('userQuests_guest');
                    localStorage.removeItem('userProjects_guest');
                    localStorage.removeItem('userMeditations_guest');
                    localStorage.removeItem('userProfile_guest');
                  } catch (e) {
                    console.warn("Failed to clear local guest items after migration:", e);
                  }
                })
                .catch((err) => {
                  console.error("Migration failed:", err);
                });
            }
          } catch (e) {
            console.error("Failed to parse guest data for migration:", e);
          }
        }
        questsLoaded = true;
        checkLoaded();
      }, (err) => handleSyncError(err, 'Quests'));

      // 3. Sync Projects
      const projectsRef = collection(db, 'users', authUser.uid, 'projects');
      const unsubProjects = onSnapshot(projectsRef, (snapshot) => {
        const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(pList);
        projectsLoaded = true;
        checkLoaded();
      }, (err) => handleSyncError(err, 'Projects'));

      // 4. Sync Meditations
      const medsRef = collection(db, 'users', authUser.uid, 'meditations');
      const qMeds = query(medsRef, orderBy('createdAt', 'desc'));
      const unsubMeds = onSnapshot(qMeds, (snapshot) => {
        const mList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedMeditation));
        setSavedMeditations(mList);
        meditationsLoaded = true;
        checkLoaded();
      }, (err) => handleSyncError(err, 'Meditations'));

      return () => {
        unsubProfile();
        unsubQuests();
        unsubProjects();
        unsubMeds();
      };
    } else {
      // Guest or sync offline fallback
      const keySuffix = authUser ? authUser.uid : 'guest';
      try {
        const savedProfile = localStorage.getItem(`userProfile_${keySuffix}`);
        const savedQuests = localStorage.getItem(`userQuests_${keySuffix}`);
        const savedProjects = localStorage.getItem(`userProjects_${keySuffix}`);
        const savedMeditations = localStorage.getItem(`userMeditations_${keySuffix}`);

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          const init = authUser ? {
            ...initialProfile,
            name: authUser.displayName || initialProfile.name,
            avatarUrl: authUser.photoURL || initialProfile.avatarUrl
          } : initialProfile;
          setProfile(init);
        }
        
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        else setQuests([]);

        if (savedProjects) setProjects(JSON.parse(savedProjects));
        else setProjects([]);

        if (savedMeditations) setSavedMeditations(JSON.parse(savedMeditations));
        else setSavedMeditations([]);
      } catch (e) {
        console.error("Local storage load failed", e);
      } finally {
        setIsLoaded(true);
      }
    }
  }, [authUser, authLoading, cloudSyncError]);

  // Local Data Persistence when Offline/Guest
  useEffect(() => {
    if (isLoaded && (!authUser || cloudSyncError)) {
      const keySuffix = authUser ? authUser.uid : 'guest';
      localStorage.setItem(`userProfile_${keySuffix}`, JSON.stringify(profile));
      localStorage.setItem(`userQuests_${keySuffix}`, JSON.stringify(quests));
      localStorage.setItem(`userProjects_${keySuffix}`, JSON.stringify(projects));
      localStorage.setItem(`userMeditations_${keySuffix}`, JSON.stringify(savedMeditations));
    }
  }, [profile, quests, projects, savedMeditations, isLoaded, authUser, cloudSyncError]);

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

  // Helper helper to wrap database write and fall back locally on failure
  const executeWrite = async (
    cloudWriteFn: () => Promise<void>,
    localWriteFn: () => void,
    errorTitle: string = "Write failed"
  ) => {
    if (authUser && !cloudSyncError) {
      try {
        await cloudWriteFn();
      } catch (error: any) {
        console.error(`${errorTitle}:`, error);
        const isPermissionDenied = error.code === 'permission-denied' || 
                                   error.message?.toLowerCase().includes('permission') || 
                                   error.message?.toLowerCase().includes('denied');
        if (isPermissionDenied) {
          setCloudSyncError(true);
          localWriteFn();
          toast({
            title: "Database Sync Offline",
            description: "Write rejected by Security Rules. Switched to local storage.",
            variant: "destructive",
          });
        } else {
          setCloudSyncError(true);
          localWriteFn();
          toast({
            title: "Sync Error",
            description: "Connection error. Saving locally instead.",
            variant: "destructive",
          });
        }
      }
    } else {
      localWriteFn();
    }
  };

  const addQuest = async (questData: Omit<Quest, 'id' | 'isCompleted' | 'completedAt' | 'createdAt'>) => {
    const id = `q-${Date.now()}-${Math.random()}`;
    const newQuest: Quest = {
      ...questData,
      id,
      isCompleted: false,
      createdAt: Date.now(),
    };

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'quests', id), newQuest);
      },
      () => {
        setQuests(prevQuests => [...prevQuests, newQuest]);
      },
      "Add Quest"
    );
    toast({ title: "Quest Added!", description: "A new quest has been added to your board." });
  };

  const addQuests = async (newQuestsList: Omit<Quest, 'isCompleted' | 'completedAt'>[]) => {
    const formatted: Quest[] = newQuestsList.map(q => {
      const id = q.id || `q-${Date.now()}-${Math.random()}`;
      return {
        ...q,
        id,
        isCompleted: false,
        createdAt: q.createdAt || Date.now(),
      } as Quest;
    });

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        const batch = writeBatch(db);
        formatted.forEach(q => {
          const docRef = doc(db, 'users', uid, 'quests', q.id);
          batch.set(docRef, q);
        });
        await batch.commit();
      },
      () => {
        setQuests(prevQuests => [...formatted, ...prevQuests]);
      },
      "Add Quests (AI generated)"
    );
    toast({ title: "Quests Added!", description: `${formatted.length} new quests have been added to your board.` });
  };

  const editQuest = async (updatedQuest: Quest) => {
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'quests', updatedQuest.id), updatedQuest);
      },
      () => {
        setQuests(prevQuests => prevQuests.map(q => q.id === updatedQuest.id ? updatedQuest : q));
      },
      "Edit Quest"
    );
    toast({ title: "Quest Updated!", description: "Your quest has been successfully updated." });
  };
  
  const deleteQuest = async (questId: string) => {
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await deleteDoc(doc(db, 'users', uid, 'quests', questId));
      },
      () => {
        setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
      },
      "Delete Quest"
    );
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

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        const batch = writeBatch(db);
        batch.set(doc(db, 'users', uid, 'quests', questId), { ...quest, isCompleted: isNowCompleted, completedAt });
        batch.set(doc(db, 'users', uid), updatedProfile);
        await batch.commit();
      },
      () => {
        setQuests(prevQuests => prevQuests.map(q => q.id === questId ? { ...q, isCompleted: isNowCompleted, completedAt } : q));
        setProfile(updatedProfile);
      },
      "Complete Quest"
    );
    
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
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'projects', id), newProject);
      },
      () => {
        setProjects(prevProjects => [...prevProjects, newProject]);
      },
      "Add Project"
    );
  };
  
  const toggleProjectTask = async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    const updatedProject = { ...project, tasks: updatedTasks };

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'projects', projectId), updatedProject);
      },
      () => {
        setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
      },
      "Toggle Project Task"
    );
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

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'projects', projectId), updatedProject);
      },
      () => {
        setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
      },
      "Add Project Task"
    );
  };

  const deleteProjectTask = async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const updatedProject = { ...project, tasks: project.tasks.filter(t => t.id !== taskId) };

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'projects', projectId), updatedProject);
      },
      () => {
        setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? updatedProject : p));
      },
      "Delete Project Task"
    );
    toast({ title: "Task Deleted", description: "The task has been removed from the project." });
  };

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
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid), updatedProfile);
      },
      () => {
        setProfile(updatedProfile);
      },
      "Update Profile Customization"
    );
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid), updatedProfile);
      },
      () => {
        setProfile(updatedProfile);
      },
      "Update Profile"
    );
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

    // Remove any guest migration data to prevent immediate restoration
    try {
      localStorage.removeItem('userQuests_guest');
      localStorage.removeItem('userProfile_guest');
      localStorage.removeItem('userProjects_guest');
      localStorage.removeItem('userMeditations_guest');
    } catch (lsErr) {
      console.warn("localStorage clear failed:", lsErr);
    }

    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        const batch = writeBatch(db);
        batch.set(doc(db, 'users', uid), updatedProfile);
        
        // Delete all quests to reset board history
        quests.forEach((q) => {
          batch.delete(doc(db, 'users', uid, 'quests', q.id));
        });
        
        await batch.commit();

        // Update local state immediately for snappy UI
        setQuests([]);
        setProfile(updatedProfile);
      },
      () => {
        setQuests([]);
        setProfile(updatedProfile);
      },
      "Reset Progress"
    );
    toast({ title: "Progress Reset", description: "Your level, XP, streaks, and quest history have been reset to zero." });
  };

  const addSavedMeditation = async (meditationData: { prompt: string; script: string; audioDataUri: string }) => {
    const id = `m-${Date.now()}`;
    const newMeditation: SavedMeditation = {
      ...meditationData,
      id,
      createdAt: Date.now(),
    };
    
    const uid = authUser?.uid;
    await executeWrite(
      async () => {
        if (!uid) throw new Error("No user authenticated");
        await setDoc(doc(db, 'users', uid, 'meditations', id), newMeditation);
      },
      () => {
        setSavedMeditations(prev => {
            const updated = [newMeditation, ...prev];
            return updated.slice(0, 3);
        });
      },
      "Add Saved Meditation"
    );
  };

  if (!isLoaded || authLoading) {
    return (
        <div className="flex w-full h-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <UserContext.Provider value={{ profile, quests, projects, savedMeditations, setQuests, addQuest, addQuests, editQuest, deleteQuest, completeQuest, addProject, toggleProjectTask, addProjectTask, deleteProjectTask, updateProfileCustomization, updateProfile, resetProgress, addSavedMeditation, isLoaded, cloudSyncError }}>
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
