
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
import {
  BrainCircuit,
  HeartPulse,
  Code,
  BookOpen,
  Users,
  Swords,
  Edit,
  Trash2,
  PlusCircle,
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

const categoryIcons: Record<QuestCategory, React.ReactNode> = {
  Mind: <BrainCircuit className="w-5 h-5" />,
  Strength: <HeartPulse className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Wisdom: <BookOpen className="w-5 h-5" />,
  Legacy: <Users className="w-5 h-5" />,
};

const categoryColors: Record<QuestCategory, string> = {
  Mind: "text-blue-400 border-blue-400/50",
  Strength: "text-red-400 border-red-400/50",
  Code: "text-green-400 border-green-400/50",
  Wisdom: "text-yellow-400 border-yellow-400/50",
  Legacy: "text-purple-400 border-purple-400/50",
};

function QuestItem({ quest }: { quest: Quest }) {
  const { completeQuest, deleteQuest } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const id = `quest-${quest.id}`;
  return (
    <div className="flex items-center space-x-4 p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors duration-200 group">
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
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}

export function QuestBoard() {
  const { quests } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const categories: QuestCategory[] = ["Mind", "Strength", "Code", "Wisdom", "Legacy"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Swords className="text-primary" />
          Today's Quests
        </CardTitle>
        <div className="flex items-center gap-2">
          <GenerateQuestsDialog />
          <AddEditQuestDialog mode="add" open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Quest
            </Button>
          </AddEditQuestDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="All">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All" className="mt-4 space-y-3">
            {quests.length > 0 ? (
                quests.map((quest) => <QuestItem key={quest.id} quest={quest} />)
            ) : (
                <p className="text-center text-muted-foreground py-8">No quests yet. Add one or generate with AI!</p>
            )}
          </TabsContent>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
                {quests.filter((q) => q.category === cat).map((quest) => (
                    <QuestItem key={quest.id} quest={quest} />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
