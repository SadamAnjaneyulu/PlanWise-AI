
'use client';

import { useState, useMemo, useTransition } from 'react';
import { Plus, Sparkles, Loader2, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import AddTaskDialog from '@/components/add-task-dialog';
import ProgressOverview from '@/components/progress-overview';
import type { Task, TaskStatus } from '@/types';
import { prioritizeTasks } from '@/ai/flows/prioritize-tasks';
import { useToast } from '@/hooks/use-toast';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay } from 'date-fns';
import AIChatbot from '@/components/ai-chatbot';
import DailyTimeSummary from '@/components/daily-time-summary';

const TaskList = dynamic(() => import('@/components/task-list'), { ssr: false });

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Draft Q3 marketing strategy',
    description: 'Outline the main channels, budget, and KPIs for the next quarter\'s marketing plan.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    category: 'Work',
    status: 'todo',
    estimatedTime: '3 hours',
  },
  {
    id: '2',
    name: 'Schedule annual check-up',
    description: 'Call Dr. Smith\'s office to schedule an appointment for the yearly physical exam.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
    category: 'Personal',
    status: 'todo',
    estimatedTime: '15 minutes',
  },
  {
    id: '3',
    name: 'Finish UI/UX course module',
    description: 'Complete the section on responsive design and accessibility.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
    category: 'Study',
    status: 'inprogress',
    estimatedTime: '2 hours',
  },
  {
    id: '4',
    name: 'Return library books',
    description: 'Drop off overdue books at the downtown library branch.',
    deadline: new Date(),
    category: 'Errands',
    status: 'done',
    estimatedTime: '30 minutes',
  },
  {
    id: '5',
    name: 'Plan weekend trip',
    description: 'Research destinations and book accommodation.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 10)),
    category: 'Personal',
    status: 'inprogress',
    estimatedTime: '4 hours',
  },
].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPrioritizing, startPrioritizing] = useTransition();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | null | undefined>(null);

  const filteredTasks = useMemo(() => {
    if (!date) {
      return tasks;
    }
    // Filter by date if a date is selected
    return tasks.filter((task) => isSameDay(task.deadline, date));
  }, [tasks, date]);


  const handleAddTask = (newTask: Omit<Task, 'id' | 'status'>) => {
    const taskWithId: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      status: 'todo',
    };
    setTasks((prev) => [...prev, taskWithId].sort((a, b) => a.deadline.getTime() - b.deadline.getTime()));
    toast({
      title: "Task Added",
      description: `"${newTask.name}" has been added to your list.`,
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast({
        title: "Task Deleted",
        variant: "destructive",
      });
  };
  
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handlePrioritize = () => {
    startPrioritizing(async () => {
      try {
        const tasksToPrioritize = tasks
          .filter((task) => task.status !== 'done')
          .map(({ name, deadline, category }) => ({
            name,
            deadline: deadline.toISOString(),
            category,
          }));

        if (tasksToPrioritize.length === 0) {
          toast({
            title: 'No tasks to prioritize',
            description: 'Add some tasks or mark them as "to-do" or "in progress".',
          });
          return;
        }

        const result = await prioritizeTasks({ tasks: tasksToPrioritize });

        const newTasks = [...tasks];
        
        result.prioritizedTasks.forEach(pTask => {
          const taskIndex = newTasks.findIndex(t => t.name === pTask.name);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], priority: pTask.priority };
          }
        });

        newTasks.sort((a, b) => {
          if (a.status === 'done' && b.status !== 'done') return 1;
          if (a.status !== 'done' && b.status === 'done') return -1;
          const priorityA = a.priority ?? Infinity;
          const priorityB = b.priority ?? Infinity;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          return a.deadline.getTime() - b.deadline.getTime();
        });
        
        setTasks(newTasks);

        toast({
          title: 'Tasks Prioritized!',
          description: 'Your tasks have been successfully prioritized by AI.',
        });
      } catch (error) {
        console.error('AI Prioritization Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to prioritize tasks. Please try again.',
        });
      }
    });
  };

  const handleDateSelect = (selectedDate?: Date) => {
    if (selectedDate && date && isSameDay(selectedDate, date)) {
        setDate(null);
    } else {
        setDate(selectedDate || null);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen">
          <Header />
          <SidebarInset>
            <div className="flex-1 overflow-y-auto">
              <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-6">{date ? `Tasks for ${date.toLocaleDateString()}` : "All Tasks"}</h2>
                      <TaskList
                        tasks={filteredTasks}
                        setTasks={setTasks}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateStatus={handleUpdateTaskStatus}
                      />
                    </div>
                    <DailyTimeSummary tasks={tasks} />
                  </div>

                  <aside className="lg:col-span-1 space-y-8 lg:sticky top-8 h-fit">
                    <div className="bg-card p-6 rounded-lg shadow-sm border">
                      <h3 className="text-xl font-bold text-foreground mb-4">Dashboard</h3>
                      <div className="space-y-4">
                        <AddTaskDialog onAddTask={handleAddTask}>
                          <Button className="w-full" size="lg">
                            <Plus className="mr-2 h-5 w-5" /> Add Task
                          </Button>
                        </AddTaskDialog>
                        <Button
                          className="w-full"
                          variant="outline"
                          size="lg"
                          onClick={handlePrioritize}
                          disabled={isPrioritizing}
                        >
                          {isPrioritizing ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-5 w-5" />
                          )}
                          Prioritize with AI
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          size="lg"
                          onClick={() => setDate(null)}
                          disabled={!date}
                        >
                          <Eye className="mr-2 h-5 w-5" />
                          View All Tasks
                        </Button>
                      </div>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={date || undefined}
                          onSelect={handleDateSelect}
                          className="w-full"
                        />
                      </CardContent>
                    </Card>

                    <ProgressOverview tasks={tasks} />
                  </aside>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
        <AIChatbot tasks={tasks} />
      </div>
    </SidebarProvider>
  );
}
