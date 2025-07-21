
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "@/context/user-context";
import { subDays, format, isSameDay, startOfDay } from "date-fns";
import type { Quest, QuestCategory } from "@/lib/types";

const categoryColors: Record<QuestCategory, string> = {
  Mind: "hsl(var(--chart-1))",
  Strength: "hsl(var(--chart-2))",
  Code: "hsl(var(--chart-3))",
  Wisdom: "hsl(var(--chart-4))",
  Legacy: "hsl(var(--chart-5))",
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
        Mind: 0,
        Strength: 0,
        Code: 0,
        Wisdom: 0,
        Legacy: 0,
        date: date, // Store the date for matching
      });
    }

    // Distribute completed quests to the correct day
    quests.forEach((quest: Quest) => {
      if (quest.isCompleted && quest.completedAt) {
        const completionDay = startOfDay(new Date(quest.completedAt));
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
          <Bar dataKey="Mind" stackId="a" fill={categoryColors.Mind} />
          <Bar dataKey="Strength" stackId="a" fill={categoryColors.Strength} />
          <Bar dataKey="Code" stackId="a" fill={categoryColors.Code} />
          <Bar dataKey="Wisdom" stackId="a" fill={categoryColors.Wisdom} />
          <Bar dataKey="Legacy" stackId="a" fill={categoryColors.Legacy} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
