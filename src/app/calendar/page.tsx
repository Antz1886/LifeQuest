"use client";

import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Check, 
  Circle, 
  ExternalLink, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Send,
  User,
  Heart,
  Briefcase,
  Laptop,
  Dumbbell
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/context/user-context";
import { isSameDay, isValid, startOfWeek, addDays, format, formatISO, parseISO } from "date-fns";
import { Quest, QuestCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchGoogleCalendarEvents, CalendarEvent } from "@/services/calendar";
import { askPlannerAssistant } from "@/ai/flows/planner-assistant-flow";
import { AddEditQuestDialog } from "@/components/dashboard/add-edit-quest-dialog";

// Helper to parse quest time into hour index (6 to 22)
function getQuestHour(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/);
  if (!match) {
    const rangeMatch = clean.split('-')[0].trim().match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/);
    if (rangeMatch) {
      let hr = parseInt(rangeMatch[1]);
      const isPm = rangeMatch[3] === 'PM';
      const isAm = rangeMatch[3] === 'AM';
      if (isPm && hr !== 12) hr += 12;
      if (isAm && hr === 12) hr = 0;
      return hr;
    }
    return null;
  }
  let hr = parseInt(match[1]);
  const isPm = match[3] === 'PM';
  const isAm = match[3] === 'AM';
  if (isPm && hr !== 12) hr += 12;
  if (isAm && hr === 12) hr = 0;
  return hr;
}

// Category mappings for styling and icons
const categoryColors: Record<QuestCategory, string> = {
  Personal: "text-purple-400 border-purple-400/50 bg-purple-400/5",
  Work: "text-blue-400 border-blue-400/50 bg-blue-400/5",
  Freelancing: "text-green-400 border-green-400/50 bg-green-400/5",
  "Mind & Body": "text-orange-400 border-orange-400/50 bg-orange-400/5",
};

const categoryIcons: Record<QuestCategory, React.ReactNode> = {
  Personal: <Heart className="w-3.5 h-3.5" />,
  Work: <Briefcase className="w-3.5 h-3.5" />,
  Freelancing: <Laptop className="w-3.5 h-3.5" />,
  "Mind & Body": <Dumbbell className="w-3.5 h-3.5" />,
};

// Mock calendar events for demonstration
const mockEvents: CalendarEvent[] = [
  {
    summary: "Cybersecurity Standup Meeting",
    start: { dateTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString() },
    description: "Daily sync with the NOC security monitoring team."
  },
  {
    summary: "Freelance Client UI Sync",
    start: { dateTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString() },
    description: "Show prototype components for the Women's Health Biz app."
  },
  {
    summary: "Yoga & Core Strengthening",
    start: { dateTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(18, 15, 0, 0)).toISOString() },
    description: "Quick recovery session and light weights."
  },
  {
    summary: "Dentist Appointment",
    start: { dateTime: new Date(addDays(new Date(), 1).setHours(11, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(addDays(new Date(), 1).setHours(12, 0, 0, 0)).toISOString() },
    description: "Routine cleaning checkup."
  },
  {
    summary: "Family Barbecue Dinner",
    start: { dateTime: new Date(new Date().setHours(19, 0, 0, 0)).toISOString() },
    end: { dateTime: new Date(new Date().setHours(21, 0, 0, 0)).toISOString() },
    description: "Celebrate birthday in the garden."
  }
];

export default function PlannerPage() {
  const { quests, addQuest, completeQuest, profile } = useUser();
  const { accessToken, user, signInWithGoogle, clearAccessToken } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [syncedEvents, setSyncedEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [currentView, setCurrentView] = useState<string>("daily");

  // AI Assistant Chat States
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    { 
      sender: 'assistant', 
      text: `### Welcome to LifeQuest Planner Assistant! ⚔️\n\nI can analyze your load, recommend freelancing priorities, or ensure you maintain a healthy Mind & Body balance. \n\n*Choose a suggestion chip below or type your inquiry.*` 
    }
  ]);
  const [queryInput, setQueryInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Dialog states for Quick Add Quest
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [quickAddTime, setQuickAddTime] = useState("09:00 AM");

  // Load Google Calendar events automatically if token is active
  useEffect(() => {
    if (accessToken) {
      handleSyncGoogle(true);
    } else {
      // Initialize with demo events for a rich user experience out-of-the-box
      setSyncedEvents(mockEvents);
      setUsingDemoData(true);
    }
  }, [accessToken]);

  const handleSyncGoogle = async (silent = false) => {
    if (!accessToken) {
      if (!silent) {
        toast({
          title: "Sign-In Required",
          description: "Authorizing with Google to sync your calendar.",
        });
        await signInWithGoogle();
      }
      return;
    }

    setIsSyncing(true);
    try {
      const events = await fetchGoogleCalendarEvents(accessToken);
      setSyncedEvents(events);
      setUsingDemoData(false);
      if (!silent) {
        toast({
          title: "Calendar Synced Successfully",
          description: `Imported ${events.length} events from Google Calendar.`,
        });
      }
    } catch (error: any) {
      console.error("Google Sync failed:", error);
      if (error.status === 401) {
        clearAccessToken();
        if (!silent) {
          toast({
            title: "Connection Expired",
            description: "Google Calendar authorization has expired. Please click Sync again to re-authorize.",
            variant: "destructive",
          });
        }
      } else {
        if (!silent) {
          toast({
            title: "Sync Failed",
            description: error.message || "Failed to load events.",
            variant: "destructive",
          });
        }
      }
      // Fallback to mock data if actual fetch fails
      setSyncedEvents(mockEvents);
      setUsingDemoData(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadDemo = () => {
    setSyncedEvents(mockEvents);
    setUsingDemoData(true);
    toast({
      title: "Demo Calendar Loaded",
      description: "Showing mock schedule events for demonstration.",
    });
  };

  // Convert calendar event to quest
  const handleConvertToQuest = async (event: CalendarEvent) => {
    const summary = event.summary.toLowerCase();
    let category: QuestCategory = 'Personal';
    
    // Auto-detect category
    if (summary.includes('gym') || summary.includes('workout') || summary.includes('yoga') || summary.includes('meditation') || summary.includes('run') || summary.includes('exercise')) {
      category = 'Mind & Body';
    } else if (summary.includes('meeting') || summary.includes('work') || summary.includes('standup') || summary.includes('corporate') || summary.includes('office') || summary.includes('noc')) {
      category = 'Work';
    } else if (summary.includes('freelance') || summary.includes('client') || summary.includes('gig') || summary.includes('women') || summary.includes('biz')) {
      category = 'Freelancing';
    }

    let timeStr = '09:00 AM';
    if (event.start.dateTime) {
      const dateObj = new Date(event.start.dateTime);
      timeStr = format(dateObj, "hh:mm a");
    }

    const targetDate = event.start.dateTime 
      ? formatISO(new Date(event.start.dateTime), { representation: 'date' })
      : event.start.date || formatISO(new Date(), { representation: 'date' });

    // Check if quest already exists
    const duplicate = quests.some(q => q.title === event.summary && q.date === targetDate);
    if (duplicate) {
      toast({
        title: "Quest Already Exists",
        description: `"${event.summary}" is already on your Quest Board.`,
        variant: "destructive",
      });
      return;
    }

    await addQuest({
      title: event.summary,
      category,
      xp: 60,
      time: timeStr,
      date: targetDate,
      energyLevel: 'Medium',
      priority: 2,
      notes: event.description || 'Synced and converted from Calendar event',
    });

    toast({
      title: "Converted to Quest!",
      description: `"${event.summary}" added under ${category} (+60 XP reward)`,
    });
  };

  // AI assistant trigger
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setQueryInput("");
    setIsAiLoading(true);

    try {
      const response = await askPlannerAssistant({
        query: queryText,
        profile: profile,
        quests: quests,
        calendarEvents: syncedEvents,
      });

      setChatMessages(prev => [...prev, { sender: 'assistant', text: response.response }]);
    } catch (error) {
      console.error("Planner Assistant failed:", error);
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: `⚠️ **Unable to connect with AI assistant.**\n\nPlease ensure your API Key is valid and active in your configuration.` 
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Setup Weekly View Dates
  const startOfCurrentWeek = useMemo(() => {
    return startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  }, [selectedDate]);

  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);

  // Hourly timeline generation (6:00 AM to 10:00 PM)
  const hourlySlots = useMemo(() => {
    const hours = [];
    for (let h = 6; h <= 22; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const timeLabel = `${displayHour}:00 ${ampm}`;
      hours.push({ hourIndex: h, label: timeLabel });
    }
    return hours;
  }, []);

  // Filter quests & events for the selected date
  const questsOnSelectedDay = useMemo(() => {
    return quests.filter(q => {
      const qDate = parseISO(q.date);
      return isValid(qDate) && isSameDay(qDate, selectedDate);
    });
  }, [quests, selectedDate]);

  const eventsOnSelectedDay = useMemo(() => {
    return syncedEvents.filter(event => {
      if (event.start.dateTime) {
        const evDate = parseISO(event.start.dateTime);
        return isValid(evDate) && isSameDay(evDate, selectedDate);
      }
      if (event.start.date) {
        const evDate = parseISO(event.start.date);
        return isValid(evDate) && isSameDay(evDate, selectedDate);
      }
      return false;
    });
  }, [syncedEvents, selectedDate]);

  // Split calendar events into all-day and timed events
  const allDayEventsOnSelectedDay = useMemo(() => {
    return eventsOnSelectedDay.filter(event => !event.start.dateTime);
  }, [eventsOnSelectedDay]);

  const timedEventsOnSelectedDay = useMemo(() => {
    return eventsOnSelectedDay.filter(event => !!event.start.dateTime);
  }, [eventsOnSelectedDay]);

  return (
    <AppShell>
      <AppHeader title="Personal Planner" />
      
      <div className="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left/Middle: Planner Views */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/40">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDate(prev => addDays(prev, -1))}
                className="hover:bg-primary/10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Button>
              <h2 className="text-xl font-bold font-headline min-w-[180px] text-center">
                {format(selectedDate, "eeee, MMM d")}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                className="hover:bg-primary/10 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedDate(new Date())}
                className="text-xs rounded-xl"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={currentView} onValueChange={setCurrentView} className="w-auto">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="daily" className="text-xs uppercase tracking-wider font-semibold rounded-lg px-3 py-1.5">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs uppercase tracking-wider font-semibold rounded-lg px-3 py-1.5">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs uppercase tracking-wider font-semibold rounded-lg px-3 py-1.5">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>

              {user ? (
                <Button 
                  onClick={() => handleSyncGoogle()} 
                  variant="outline" 
                  size="sm" 
                  disabled={isSyncing}
                  className="rounded-xl border-dashed h-9"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isSyncing && "animate-spin")} />
                  Sync
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button 
                    onClick={() => handleSyncGoogle()} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-dashed h-9 text-xs"
                  >
                    Google Sync
                  </Button>
                  {!usingDemoData && (
                    <Button 
                      onClick={handleLoadDemo} 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl text-xs"
                    >
                      Demo Schedule
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tab Contents */}
          
          {/* DAILY VIEW */}
          {currentView === "daily" && (
            <Card className="border-none shadow-none md:border md:shadow-md bg-card/30 backdrop-blur-md overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-border/30 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-lg flex items-center gap-2 text-primary">
                      <Clock className="w-5 h-5" /> Hourly Quest & Schedule Sync
                    </CardTitle>
                    <CardDescription>Drag, track, and convert external events into active gamified quests.</CardDescription>
                  </div>
                  {usingDemoData && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Demo Schedule
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                
                {/* All Day Events Row */}
                {allDayEventsOnSelectedDay.length > 0 && (
                  <div className="flex border-b border-border/30 bg-muted/40 p-4 gap-3 items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-20">All Day</span>
                    <div className="flex flex-wrap gap-2 flex-grow">
                      {allDayEventsOnSelectedDay.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-card border border-border/50 py-1.5 px-3 rounded-xl text-sm shadow-sm group">
                          <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">All Day</Badge>
                          <span className="font-medium">{event.summary}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                            onClick={() => handleConvertToQuest(event)}
                            title="Convert this event to a quest"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hourly Timeline */}
                <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto">
                  {hourlySlots.map(({ hourIndex, label }) => {
                    // Match events in this hour
                    const hourEvents = timedEventsOnSelectedDay.filter(ev => {
                      const dateObj = new Date(ev.start.dateTime!);
                      return dateObj.getHours() === hourIndex;
                    });

                    // Match quests in this hour
                    const hourQuests = questsOnSelectedDay.filter(q => {
                      const hr = getQuestHour(q.time);
                      return hr === hourIndex;
                    });

                    return (
                      <div key={hourIndex} className="flex group hover:bg-muted/5 transition-colors">
                        
                        {/* Time Label Column */}
                        <div className="w-24 p-4 border-r border-border/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-muted-foreground font-mono">{label}</span>
                        </div>

                        {/* Side by side Events & Quests Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-[70px]">
                          
                          {/* Calendar Events Column */}
                          <div className="space-y-2">
                            {hourEvents.length > 0 ? (
                              hourEvents.map((event, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-start justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border/40 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all shadow-sm group/ev"
                                >
                                  <div>
                                    <h4 className="font-medium text-sm text-foreground">{event.summary}</h4>
                                    {event.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{event.description}</p>
                                    )}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-[10px] font-bold h-7 rounded-lg border-primary/30 text-primary hover:bg-primary hover:text-white flex items-center gap-1 opacity-80 group-hover/ev:opacity-100"
                                    onClick={() => handleConvertToQuest(event)}
                                  >
                                    <Sparkles className="w-3 h-3" /> Questify
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="h-full flex items-center">
                                <span className="text-[11px] text-muted-foreground/30 italic group-hover:text-muted-foreground/45 transition-colors">No calendar items</span>
                              </div>
                            )}
                          </div>

                          {/* Quests Column */}
                          <div className="space-y-2">
                            {hourQuests.length > 0 ? (
                              hourQuests.map((quest) => (
                                <div 
                                  key={quest.id} 
                                  onClick={() => completeQuest(quest.id)}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-muted/40 transition-all shadow-sm",
                                    quest.isCompleted ? "border-border/30 bg-muted/20 opacity-60" : "border-border/60 bg-card hover:border-primary/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {quest.isCompleted ? (
                                      <Check className="w-4 h-4 text-primary shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                    )}
                                    <span className={cn(
                                      "text-sm font-medium truncate",
                                      quest.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                    )}>
                                      {quest.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className={cn("text-[10px] gap-1 px-1.5 py-0.5", categoryColors[quest.category])}>
                                      {categoryIcons[quest.category]}
                                      <span className="hidden sm:inline">{quest.category}</span>
                                    </Badge>
                                    <Badge variant="secondary" className="text-[10px]">+{quest.xp} XP</Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="h-full flex items-center justify-between w-full">
                                <span className="text-[11px] text-muted-foreground/30 italic group-hover:text-muted-foreground/45 transition-colors">No quests</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10"
                                  onClick={() => {
                                    const period = hourIndex >= 12 ? 'PM' : 'AM';
                                    const displayHr = hourIndex % 12 === 0 ? 12 : hourIndex % 12;
                                    setQuickAddTime(`${String(displayHr).padStart(2, '0')}:00 ${period}`);
                                    setIsAddOpen(true);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* WEEKLY VIEW */}
          {currentView === "weekly" && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {daysOfWeek.map((day, idx) => {
                const isTodayDate = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                
                // Get quests for this day
                const dayQuests = quests.filter(q => {
                  const qDate = parseISO(q.date);
                  return isValid(qDate) && isSameDay(qDate, day);
                });

                // Get events for this day
                const dayEvents = syncedEvents.filter(ev => {
                  if (ev.start.dateTime) return isSameDay(parseISO(ev.start.dateTime), day);
                  if (ev.start.date) return isSameDay(parseISO(ev.start.date), day);
                  return false;
                });

                const completedQuests = dayQuests.filter(q => q.isCompleted);
                const progressPct = dayQuests.length > 0 ? (completedQuests.length / dayQuests.length) * 100 : 0;

                return (
                  <Card 
                    key={idx} 
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "cursor-pointer hover:border-primary/50 transition-all flex flex-col h-[350px] relative overflow-hidden",
                      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/60 bg-card/45 backdrop-blur-sm",
                      isTodayDate && !isSelected && "border-accent bg-accent/5"
                    )}
                  >
                    {/* Header */}
                    <div className="p-3 border-b border-border/30 text-center relative">
                      <p className={cn("text-xs font-bold uppercase tracking-wider", isTodayDate ? "text-accent" : "text-muted-foreground")}>
                        {format(day, "EEE")}
                      </p>
                      <p className={cn("text-xl font-bold font-headline mt-0.5", isTodayDate && "text-accent font-extrabold")}>
                        {format(day, "d")}
                      </p>
                      {isTodayDate && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Progress Bar indicator */}
                    {dayQuests.length > 0 && (
                      <div className="w-full h-1 bg-muted">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <ScrollArea className="flex-1 p-2">
                      <div className="space-y-2">
                        {/* Synced events */}
                        {dayEvents.map((ev, eIdx) => (
                          <div 
                            key={eIdx} 
                            className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] text-foreground leading-tight truncate"
                            title={`Calendar event: ${ev.summary}`}
                          >
                            📅 {ev.summary}
                          </div>
                        ))}

                        {/* Quests */}
                        {dayQuests.map((quest) => (
                          <div 
                            key={quest.id} 
                            className={cn(
                              "p-1.5 rounded-lg border text-[10px] leading-tight flex items-center justify-between gap-1",
                              quest.isCompleted 
                                ? "bg-muted/20 border-border/20 text-muted-foreground line-through" 
                                : "bg-card border-border/80 text-foreground"
                            )}
                            title={`Quest: ${quest.title}`}
                          >
                            <span className="truncate flex-1">{quest.title}</span>
                            <span className="text-[8px] font-bold text-accent shrink-0">+{quest.xp}</span>
                          </div>
                        ))}

                        {dayQuests.length === 0 && dayEvents.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/30 italic text-center pt-8">Clear ledger</p>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="p-2 border-t border-border/20 bg-muted/10 text-center shrink-0">
                      <p className="text-[10px] font-medium text-muted-foreground font-mono">
                        {dayQuests.length > 0 ? `${completedQuests.length}/${dayQuests.length} Done` : '0 Quests'}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* MONTHLY VIEW */}
          {currentView === "monthly" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-none md:border md:shadow-md bg-card/45 backdrop-blur-md p-4 rounded-2xl">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-xl p-0 w-full"
                  components={{
                    DayContent: (props) => {
                      const hasQuests = quests.some(q => {
                        const qDate = parseISO(q.date);
                        return isValid(qDate) && isSameDay(qDate, props.date);
                      });
                      const hasEvents = syncedEvents.some(ev => {
                        if (ev.start.dateTime) return isSameDay(parseISO(ev.start.dateTime), props.date);
                        if (ev.start.date) return isSameDay(parseISO(ev.start.date), props.date);
                        return false;
                      });

                      return (
                        <div className="relative h-full w-full flex items-center justify-center p-2 min-h-[40px]">
                          <span className={cn(
                            "text-sm font-semibold",
                            isSameDay(props.date, selectedDate) && "text-white"
                          )}>
                            {props.date.getDate()}
                          </span>
                          <div className="absolute bottom-1.5 flex gap-0.5">
                            {hasQuests && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            {hasEvents && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                          </div>
                        </div>
                      )
                    }
                  }}
                />
              </Card>

              {/* Day details side-panel for monthly view */}
              <Card className="border-border/60 bg-card/45 backdrop-blur-md rounded-2xl flex flex-col h-full min-h-[350px]">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    Reviewing quest backlog and synchronized events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 overflow-y-auto">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Synced Events</h4>
                    {eventsOnSelectedDay.length > 0 ? (
                      eventsOnSelectedDay.map((ev, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-2 p-2 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs">
                          <span className="font-medium truncate">{ev.summary}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 rounded-lg text-primary shrink-0"
                            onClick={() => handleConvertToQuest(ev)}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">No scheduled events.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheduled Quests</h4>
                    {questsOnSelectedDay.length > 0 ? (
                      questsOnSelectedDay.map((quest) => (
                        <div 
                          key={quest.id} 
                          onClick={() => completeQuest(quest.id)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all",
                            quest.isCompleted ? "border-border/30 bg-muted/10 opacity-60" : "border-border/60 bg-card hover:border-primary/50"
                          )}
                        >
                          <span className={cn(
                            "truncate font-medium",
                            quest.isCompleted && "line-through text-muted-foreground"
                          )}>
                            {quest.title}
                          </span>
                          <Badge variant="secondary" className="text-[9px]">+{quest.xp} XP</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">No quests scheduled.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Right Sidebar: AI Assistant Panel */}
        <div className="xl:col-span-1">
          <Card className="border-none shadow-none md:border md:shadow-md bg-card/30 backdrop-blur-md rounded-2xl flex flex-col h-[600px] xl:h-[680px]">
            <CardHeader className="border-b border-border/30 bg-muted/20">
              <CardTitle className="font-headline text-lg flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4 animate-pulse" /> LifeQuest Assistant
              </CardTitle>
              <CardDescription>Gamified AI advisor to coordinate your calendar and keep focus.</CardDescription>
            </CardHeader>
            
            {/* Chat Conversation Scroll Area */}
            <ScrollArea className="flex-grow p-4 space-y-4">
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex flex-col max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm",
                      msg.sender === 'user' 
                        ? "bg-primary text-white ml-auto rounded-tr-none" 
                        : "bg-muted/40 border border-border/40 mr-auto rounded-tl-none text-foreground leading-relaxed"
                    )}
                  >
                    {/* Render message contents with basic markdown formatting support */}
                    {msg.sender === 'assistant' ? (
                      <div className="space-y-2 prose prose-invert max-w-none text-xs leading-relaxed">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (line.startsWith('###')) {
                            return <h4 key={lIdx} className="font-headline text-sm font-bold text-primary mt-2">{line.replace('###', '').trim()}</h4>;
                          }
                          if (line.startsWith('*') && line.endsWith('*')) {
                            return <p key={lIdx} className="italic text-muted-foreground">{line.replace(/\*/g, '')}</p>;
                          }
                          if (line.startsWith('-')) {
                            return <li key={lIdx} className="ml-2 list-disc">{line.replace('-', '').trim()}</li>;
                          }
                          return <p key={lIdx}>{line}</p>;
                        })}
                      </div>
                    ) : (
                      <p className="text-xs">{msg.text}</p>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="bg-muted/40 border border-border/40 p-4 rounded-2xl rounded-tl-none mr-auto max-w-[80%] flex items-center gap-2 shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Consulting prompt flows...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestion Chips */}
            <div className="p-3 border-t border-border/20 bg-muted/5 flex flex-wrap gap-2">
              <button 
                onClick={() => handleSendQuery("Review my load for today")}
                disabled={isAiLoading}
                className="text-[10px] font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 py-1.5 px-3 rounded-full transition-all shrink-0 active:scale-95"
              >
                📊 Review Today's Load
              </button>
              <button 
                onClick={() => handleSendQuery("Plan Freelance quests")}
                disabled={isAiLoading}
                className="text-[10px] font-semibold bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 py-1.5 px-3 rounded-full transition-all shrink-0 active:scale-95"
              >
                💻 Plan Freelance Quests
              </button>
              <button 
                onClick={() => handleSendQuery("How is my balance?")}
                disabled={isAiLoading}
                className="text-[10px] font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 py-1.5 px-3 rounded-full transition-all shrink-0 active:scale-95"
              >
                ⚖️ Check Quest Balance
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border/30 bg-muted/10 flex gap-2">
              <input
                type="text"
                placeholder="Ask your assistant..."
                className="flex-grow bg-card border border-border/40 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-primary/50 text-foreground"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(queryInput)}
                disabled={isAiLoading}
              />
              <Button 
                size="icon" 
                className="rounded-xl w-9 h-9 shadow-md shadow-primary/20 shrink-0"
                onClick={() => handleSendQuery(queryInput)}
                disabled={isAiLoading || !queryInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

      </div>

      {/* Dialog for Quick Add Quest */}
      <AddEditQuestDialog
        mode="add"
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        quest={{
          id: "",
          title: "",
          category: "Personal",
          xp: 50,
          isCompleted: false,
          time: quickAddTime,
          date: formatISO(selectedDate, { representation: 'date' }),
          energyLevel: "Medium",
          priority: 2,
          createdAt: Date.now()
        }}
      >
        <span className="hidden" />
      </AddEditQuestDialog>

    </AppShell>
  );
}
