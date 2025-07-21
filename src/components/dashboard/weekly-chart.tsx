
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "@/context/user-context";
import { subDays, format } from "date-fns";
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
    const today = new Date();
    
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
      });
    }

    // This is a simplified logic. In a real app, quests would have a completion date.
    // For this prototype, we'll randomly distribute completed quests across the week.
    quests.forEach((quest: Quest) => {
      if (quest.isCompleted) {
        const randomDayIndex = Math.floor(Math.random() * 7);
        if (data[randomDayIndex]) {
            data[randomDayIndex][quest.category] += 1;
        }
      }
    });

    return data;
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
