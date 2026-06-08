
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "@/context/user-context";
import { subDays, format, isSameDay, startOfDay, parseISO } from "date-fns";
import type { Quest, QuestCategory } from "@/lib/types";

const categoryColors: Record<QuestCategory, string> = {
  Personal: "#c084fc", // Purple 400
  Work: "#60a5fa", // Blue 400
  Freelancing: "#4ade80", // Green 400
  "Mind & Body": "#fb923c", // Orange 400
};


export function WeeklyChart() {
  const { quests } = useUser();

  const weeklyData = useMemo(() => {
    const data: { name: string; [key: string]: any }[] = [];
    const today = startOfDay(new Date());
    
    // Create data points for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayName = format(date, "EEE"); // "Mon", "Tue", etc.
      
      data.push({
        name: dayName,
        Personal: 0,
        Work: 0,
        Freelancing: 0,
        "Mind & Body": 0,
        date: date, // Store the date for matching
      });
    }

    // Distribute completed quests to the correct day
    quests.forEach((quest: Quest) => {
      if (quest.isCompleted && quest.completedAt && quest.date) {
        const completionDay = startOfDay(parseISO(quest.date));
        const dayData = data.find(d => isSameDay(d.date, completionDay));
        if (dayData) {
            dayData[quest.category] = (dayData[quest.category] || 0) + 1;
        }
      }
    });
    
    // Clean up the date property before rendering
    return data.map(({date, ...remaning}) => remaning);

  }, [quests]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            cursor={{ fill: "hsla(var(--muted), 0.5)" }}
          />
          <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
          <Bar dataKey="Personal" stackId="a" fill={categoryColors.Personal} />
          <Bar dataKey="Work" stackId="a" fill={categoryColors.Work} />
          <Bar dataKey="Freelancing" stackId="a" fill={categoryColors.Freelancing} />
          <Bar dataKey="Mind & Body" stackId="a" fill={categoryColors["Mind & Body"]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
