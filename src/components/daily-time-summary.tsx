
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, isFuture, addDays, eachDayOfInterval, startOfToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Task } from '@/types';

interface DailyTimeSummaryProps {
  tasks: Task[];
}

function parseEstimatedTime(timeString?: string): number {
  if (!timeString) return 0;
  const time = timeString.toLowerCase();
  let hours = 0;
  if (time.includes('hour')) {
    hours = parseFloat(time.replace(/hours?/, '').trim());
  } else if (time.includes('minute')) {
    hours = parseFloat(time.replace(/minutes?/, '').trim()) / 60;
  }
  return isNaN(hours) ? 0 : hours;
}

export default function DailyTimeSummary({ tasks }: DailyTimeSummaryProps) {
  const chartData = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {};

    tasks.forEach(task => {
      if (task.status !== 'done' && isFuture(task.deadline)) {
        const day = format(task.deadline, 'yyyy-MM-dd');
        const timeInHours = parseEstimatedTime(task.estimatedTime);
        if (!dailyTotals[day]) {
          dailyTotals[day] = 0;
        }
        dailyTotals[day] += timeInHours;
      }
    });

    const today = startOfToday();
    const next7Days = eachDayOfInterval({
      start: today,
      end: addDays(today, 6),
    });

    const data = next7Days.map(day => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        return {
            date: format(day, 'MMM d'),
            totalTime: dailyTotals[formattedDate] || 0
        }
    });

    return data;

  }, [tasks]);

  const chartConfig = {
    totalTime: {
      label: 'Hours',
      color: 'hsl(var(--primary))',
    },
  };

  const hasData = useMemo(() => chartData.some(d => d.totalTime > 0), [chartData]);

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle>Daily Workload</CardTitle>
        <CardDescription>Estimated hours for upcoming tasks in the next 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    />
                    <YAxis
                        tickFormatter={(value) => `${value}h`}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                     <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value) => `${value.toFixed(1)} hours`}
                            labelClassName="font-bold"
                         />}
                        />
                    <Bar dataKey="totalTime" fill="var(--color-totalTime)" radius={4} />
                </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground text-center">
                <div>
                    <p>No upcoming tasks with estimated time.</p>
                    <p className="text-xs">Add tasks with deadlines and estimates to see your workload.</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
