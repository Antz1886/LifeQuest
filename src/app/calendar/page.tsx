
"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Check, Circle, ExternalLink } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/context/user-context";
import { isSameDay, isValid } from "date-fns";
import { Quest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";


function QuestItem({ quest, onToggle }: { quest: Quest, onToggle: (id: string) => void }) {
    return (
        <div 
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer"
            onClick={() => onToggle(quest.id)}
        >
            {quest.isCompleted ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
            <span className={`flex-grow ${quest.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{quest.title}</span>
            <Badge variant="secondary">+{quest.xp} XP</Badge>
        </div>
    )
}

function CalendarPageContent() {
    const { quests, completeQuest } = useUser();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const questsForSelectedDay = selectedDate
        ? quests.filter(quest => {
              const questDate = new Date(quest.date);
              return isValid(questDate) && isSameDay(questDate, selectedDate);
          })
        : [];
        
    const hasQuestsOnDate = (date: Date) => {
        return quests.some(quest => {
            const questDate = new Date(quest.date);
            return isValid(questDate) && isSameDay(questDate, date);
        });
    };

    const handleImportFromCalendar = () => {
        // We will implement this logic in the next step.
        alert("TODO: Implement Google Calendar event import");
    }

    return (
        <main className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                <CalendarIcon className="text-primary"/>
                                Quest Calendar
                            </CardTitle>
                            <CardDescription>
                                Select a day to view and manage your quests.
                            </CardDescription>
                        </div>
                         {user && (
                            <Button onClick={handleImportFromCalendar} variant="outline">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Import from Calendar
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border p-0"
                             components={{
                                DayContent: (props) => {
                                    const hasQuests = hasQuestsOnDate(props.date);
                                    return (
                                        <div className="relative h-full w-full flex items-center justify-center">
                                            <span className={cn(hasQuests && 'font-bold text-primary')}>{props.date.getDate()}</span>
                                            {hasQuests && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                                        </div>
                                    )
                                }
                             }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                 <Card>
                    <CardHeader>
                         <CardTitle className="font-headline text-xl">
                            {selectedDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(selectedDate) : 'Select a date'}
                        </CardTitle>
                        <CardDescription>
                            {questsForSelectedDay.length} quest(s) for this day.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         {questsForSelectedDay.length > 0 ? (
                            questsForSelectedDay.map(quest => (
                                <QuestItem key={quest.id} quest={quest} onToggle={completeQuest}/>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No quests scheduled for this day.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


export default function CalendarPage() {
  return (
      <AppShell>
        <AppHeader title="Calendar" />
        <CalendarPageContent />
      </AppShell>
  )
}
