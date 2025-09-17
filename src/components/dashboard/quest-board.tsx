
"use client";

import { useState } from "react";
import { useUser } from "@/context/user-context";
import type { Quest, QuestCategory } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Target
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

function QuestItem({ quest }: { quest: Quest }) {
  const { completeQuest, deleteQuest } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const id = `quest-${quest.id}`;
  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
        className="flex items-center space-x-4 p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
    >
      <Checkbox
        id={id}
        checked={quest.isCompleted}
        onCheckedChange={() => completeQuest(quest.id)}
        aria-label={`Mark quest ${quest.title} as completed`}
        className="w-6 h-6"
      />
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`font-medium cursor-pointer ${
            quest.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {quest.title}
        </label>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <Badge variant="outline" className={`gap-1 ${categoryColors[quest.category]}`}>
            {categoryIcons[quest.category]}
            <span>{quest.category}</span>
          </Badge>
          <span className="font-semibold text-accent">+{quest.xp} XP</span>
          <Badge variant="secondary">{quest.time}</Badge>
        </div>
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

function QuestCategoryTabs({ quests }: { quests: Quest[] }) {
    const categories: QuestCategory[] = ["Mind", "Strength", "Code", "Wisdom", "Legacy"];
    return (
         <Tabs defaultValue="All" className="w-full">
          <div className="md:hidden">
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <TabsList className="grid w-max grid-cols-6">
                <TabsTrigger value="All">All</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <TabsList className="hidden md:grid w-full grid-cols-6">
            <TabsTrigger value="All">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All" className="mt-4 space-y-3">
              <QuestList quests={quests} emptyMessage="No quests for this day."/>
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
