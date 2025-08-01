
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer
} from '@/components/ui/chart';
import type { Task } from '@/types';

interface ProgressOverviewProps {
  tasks: Task[];
}

export default function ProgressOverview({ tasks }: ProgressOverviewProps) {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    const chartData = useMemo(() => {
        const completed = tasks.filter((task) => task.status === 'done').length;
        const pending = tasks.length - completed;
        return [
        { name: 'Completed', value: completed, fill: 'hsl(var(--primary))' },
        { name: 'Pending', value: pending, fill: 'hsl(var(--accent))' },
        ];
    }, [tasks]);
    
    const totalTasks = tasks.length;
    const completedTasks = chartData.find(d => d.name === 'Completed')?.value || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    useEffect(() => {
        if (progressPercentage === 0) {
            setAnimatedPercentage(0);
            return;
        }

        const animationDuration = 1000; // 1 second
        const frameRate = 60; // 60fps
        const totalFrames = animationDuration / (1000 / frameRate);
        const increment = progressPercentage / totalFrames;
        let currentPercentage = 0;

        const timer = setInterval(() => {
            currentPercentage += increment;
            if (currentPercentage >= progressPercentage) {
                setAnimatedPercentage(progressPercentage);
                clearInterval(timer);
            } else {
                setAnimatedPercentage(Math.round(currentPercentage));
            }
        }, 1000 / frameRate);

        return () => clearInterval(timer);
    }, [progressPercentage]);


  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
        <CardDescription>A summary of your task completion.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-[200px]">
        {totalTasks > 0 ? (
            <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="70%"
                        outerRadius="100%"
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={450}
                        cy="50%"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">
                        {animatedPercentage}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Completed
                    </span>
                </div>
            </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center">
            <div>
                <p>No tasks to track.</p>
                <p className="text-xs">Add a task to see your progress.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-sm pt-4">
        {totalTasks > 0 && (
            <div className="text-center text-muted-foreground">
                <p><span className="font-bold text-foreground">{completedTasks}</span> of <span className="font-bold text-foreground">{totalTasks}</span> tasks done.</p>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

