
"use client";

import { useState } from "react";
import { useUser } from "@/context/user-context";
import type { Quest, QuestCategory } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { GenerateQuestsDialog } from "@/components/dashboard/generate-quests-dialog";
import { AddEditQuestDialog } from "@/components/dashboard/add-edit-quest-dialog";
import { Button } from "@/components/ui/button";
import { FocusMode } from "@/components/dashboard/focus-mode";
import {
  BrainCircuit,
  Dumbbell,
  Code,
  BookOpen,
  Briefcase,
  Swords,
  Edit,
  Trash2,
  PlusCircle,
  Target,
  Zap,
  Archive,
  History,
  Layout,
  FileText,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { isToday, isTomorrow, addDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

const categoryIcons: Record<QuestCategory, React.ReactNode> = {
  Mind: <BrainCircuit className="w-5 h-5" />,
  Strength: <Dumbbell className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Wisdom: <BookOpen className="w-5 h-5" />,
  Legacy: <Briefcase className="w-5 h-5" />,
};

const categoryColors: Record<QuestCategory, string> = {
  Mind: "text-chart-1 border-chart-1/50",
  Strength: "text-chart-2 border-chart-2/50",
  Code: "text-chart-3 border-chart-3/50",
  Wisdom: "text-chart-4 border-chart-4/50",
  Legacy: "text-chart-5 border-chart-5/50",
};

const energyColors = {
  Low: "text-blue-400 border-blue-400/50",
  Medium: "text-yellow-400 border-yellow-400/50",
  High: "text-orange-500 border-orange-500/50",
};

function QuestItem({ quest }: { quest: Quest }) {
  const { completeQuest, deleteQuest, projects } = useUser();
  const linkedProject = quest.projectId ? projects.find(p => p.id === quest.projectId) : null;
  const daysOld = Math.floor((Date.now() - (quest.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
  const isAdaptive = daysOld >= 3;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const id = `quest-${quest.id}`;
  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
        className="flex items-start md:items-center space-x-4 p-5 md:p-4 bg-card hover:bg-muted/50 rounded-2xl md:rounded-lg transition-all duration-200 group border border-border/50 md:border-none shadow-sm md:shadow-none"
    >
      <div className="pt-1 md:pt-0">
          <Checkbox
            id={id}
            checked={quest.isCompleted}
            onCheckedChange={() => completeQuest(quest.id)}
            aria-label={`Mark quest ${quest.title} as completed`}
            className="w-7 h-7 md:w-6 md:h-6 rounded-lg border-2"
          />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <label
            htmlFor={id}
            className={`font-medium cursor-pointer truncate ${
                quest.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
            >
            {quest.title}
            </label>
            {linkedProject && (
                <Badge variant="secondary" className="gap-1 py-0 px-1.5 h-5 bg-muted/50 text-[10px] border-none shrink-0">
                    <Archive className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[80px]">{linkedProject.title}</span>
                </Badge>
            )}
            {quest.notes && (
                <FileText className="w-3 h-3 text-muted-foreground shrink-0" title="Has notes" />
            )}
            {quest.priority === 1 && (
                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" title="Urgent & Important" />
            )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
          <Badge variant="outline" className={`gap-1 h-6 px-2 ${categoryColors[quest.category]}`}>
            {categoryIcons[quest.category]}
            <span>{quest.category}</span>
          </Badge>
          <Badge variant="outline" className={`gap-1 h-6 px-2 ${energyColors[quest.energyLevel || 'Medium']}`}>
            <Zap className="w-3 h-3 fill-current" />
            <span>{quest.energyLevel || 'Medium'}</span>
          </Badge>
          <span className={cn(
              "font-bold flex items-center gap-1 shrink-0",
              isAdaptive ? "text-primary animate-pulse" : "text-accent"
          )}>
            +{isAdaptive ? Math.floor(quest.xp * 1.5) : quest.xp} XP
            {isAdaptive && <History className="w-3 h-3" />}
          </span>
          <Badge variant="secondary" className="h-6 shrink-0">{quest.time}</Badge>
        </div>
        {quest.notes && !quest.isCompleted && (
            <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-2 border-primary/50 line-clamp-2">
                {quest.notes}
            </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!quest.isCompleted && (
            <FocusMode quest={quest}>
                <Button variant="ghost" size="icon">
                    <Target className="w-4 h-4" />
                </Button>
            </FocusMode>
        )}
        <AddEditQuestDialog
          quest={quest}
          mode="edit"
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        >
          <Button variant="ghost" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </AddEditQuestDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your quest.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteQuest(quest.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

function QuestList({ quests, emptyMessage }: { quests: Quest[], emptyMessage?: string }) {
    return (
        <AnimatePresence>
            {quests.length > 0 ? (
                quests.map((quest) => <QuestItem key={quest.id} quest={quest} />)
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-8"
                >
                    <p className="mb-2">{emptyMessage || "Your quest board is clear!"}</p>
                    <p className="text-sm">Add a new quest or generate one with AI to start your journey.</p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function StrategicView({ quests }: { quests: Quest[] }) {
    const quadrants = [
        { id: 1, title: "Urgent & Important", color: "border-red-500/50 bg-red-500/5" },
        { id: 2, title: "Important (Not Urgent)", color: "border-blue-500/50 bg-blue-500/5" },
        { id: 3, title: "Urgent (Not Important)", color: "border-orange-500/50 bg-orange-500/5" },
        { id: 4, title: "Backlog / Eliminate", color: "border-slate-500/50 bg-slate-500/5" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quadrants.map((quad) => {
                const quadQuests = quests.filter(q => q.priority === quad.id);
                return (
                    <Card key={quad.id} className={cn("border-dashed rounded-2xl", quad.color)}>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold flex justify-between items-center uppercase tracking-widest text-muted-foreground">
                                {quad.title}
                                <Badge variant="outline" className="text-[10px] font-mono">{quadQuests.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                             {quadQuests.length > 0 ? (
                                 quadQuests.map(q => (
                                     <div key={q.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl text-sm border border-border/50 group active:scale-95 transition-transform">
                                         <span className="flex-1 truncate font-medium">{q.title}</span>
                                         <Badge variant="secondary" className="text-[10px] px-1.5 h-5 shrink-0">{q.category}</Badge>
                                     </div>
                                 ))
                             ) : (
                                 <p className="text-[10px] text-muted-foreground italic py-2">No quests assigned</p>
                             )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

function QuestCategoryTabs({ quests }: { quests: Quest[] }) {
    const categories: QuestCategory[] = ["Mind", "Strength", "Code", "Wisdom", "Legacy"];
    return (
         <Tabs defaultValue="All" className="w-full">
          <div className="md:hidden">
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <TabsList className="grid w-max grid-cols-7">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Strategic" className="gap-1"><Layout className="w-3 h-3"/>Strategic</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <TabsList className="hidden md:grid w-full grid-cols-7">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Strategic" className="gap-1"><Layout className="w-3 h-3"/>Strategic</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All" className="mt-4 space-y-3">
              <QuestList quests={quests} emptyMessage="No quests for this day."/>
          </TabsContent>
          <TabsContent value="Strategic" className="mt-4">
              <StrategicView quests={quests} />
          </TabsContent>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
                <QuestList quests={quests.filter((q) => q.category === cat)} emptyMessage="No quests in this category for this day."/>
            </TabsContent>
          ))}
        </Tabs>
    )
}

export function QuestBoard() {
  const { quests } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const todaysQuests = quests.filter(q => isToday(new Date(q.date)) && !q.isCompleted);
  const tomorrowsQuests = quests.filter(q => isTomorrow(new Date(q.date)) && !q.isCompleted);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Swords className="text-primary" />
          Upcoming Quests
        </CardTitle>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <GenerateQuestsDialog />
          <AddEditQuestDialog mode="add" open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button className="gap-2 w-full md:w-auto">
              <PlusCircle className="w-4 h-4" />
              <span>Add Quest</span>
            </Button>
          </AddEditQuestDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="mt-4">
                <QuestCategoryTabs quests={todaysQuests} />
            </TabsContent>
            <TabsContent value="tomorrow" className="mt-4">
                 <QuestCategoryTabs quests={tomorrowsQuests} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
