
'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import Header from '@/components/header';
import AppSidebar from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { BoardColumn, BoardContainer } from '@/components/board';
import TaskCard from '@/components/task-card';
import { type Task, TaskStatus } from '@/types';

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Draft Q3 marketing strategy',
    description: 'Outline the main channels, budget, and KPIs for the next quarter\'s marketing plan.',
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    category: 'Work',
    status: 'todo',
    estimatedTime: '3 hours',
    priority: 3,
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
    priority: 2,
  },
  {
    id: '4',
    name: 'Return library books',
    description: 'Drop off overdue books at the downtown library branch.',
    deadline: new Date(),
    category: 'Errands',
    status: 'done',
    estimatedTime: '30 minutes',
    priority: 1,
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
];


export default function UpcomingPage() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const columns = useMemo(() => {
        const cols = new Map<TaskStatus, { id: TaskStatus; title: string }>();
        cols.set('todo', { id: 'todo', title: 'To Do' });
        cols.set('inprogress', { id: 'inprogress', title: 'In Progress' });
        cols.set('done', { id: 'done', title: 'Done' });
        return cols;
      }, []);
      
    const tasksByColumn = useMemo(() => {
        const tasksMap = new Map<TaskStatus, Task[]>();
        Array.from(columns.keys()).forEach(status => {
            tasksMap.set(status, tasks.filter(task => task.status === status));
        })
        return tasksMap;
    }, [tasks, columns]);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 10,
          },
        })
      );
    
    const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    };

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Task') {
          setActiveTask(event.active.data.current.task);
          return;
        }
    }
    
    function onDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;
    
        if (activeId === overId) return;
    
        const isActiveATask = active.data.current?.type === 'Task';
        if (!isActiveATask) return;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        let newStatus = activeTask.status;
        const overIsColumn = over.data.current?.type === 'Column';
        if (overIsColumn) {
            newStatus = overId as TaskStatus;
        }

        const overIsTask = over.data.current?.type === "Task";
        if (overIsTask) {
            const overTask = tasks.find(t => t.id === overId);
            if(overTask) {
                newStatus = overTask.status;
            }
        }
        
        setTasks(currentTasks => {
            return currentTasks.map(t => 
              t.id === activeId ? { ...t, status: newStatus } : t
            );
        });
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
      
        const activeId = active.id;
        const overId = over.id;
      
        if (activeId === overId) return;
      
        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";
      
        if (!isActiveATask) return;

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;
      
        if (isActiveATask && isOverATask) {
          setTasks((tasks) => {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const overIndex = tasks.findIndex((t) => t.id === overId);
            
            if (tasks[activeIndex].status !== tasks[overIndex].status) {
                tasks[activeIndex].status = tasks[overIndex].status;
                return arrayMove(tasks, activeIndex, overIndex - 1);
            }
    
            return arrayMove(tasks, activeIndex, overIndex);
          });
        }
      
        const isOverAColumn = over.data.current?.type === "Column";
      
        if (isActiveATask && isOverAColumn) {
          
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                tasks[activeIndex].status = overId as TaskStatus;
                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                    <Header />
                    <SidebarInset>
                        <main className="flex-grow container mx-auto p-4 md:p-8">
                            <DndContext
                                sensors={sensors}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onDragOver={onDragOver}
                            >
                                <BoardContainer>
                                {Array.from(columns.values()).map(col => (
                                    <BoardColumn
                                        key={col.id}
                                        column={col}
                                        tasks={tasksByColumn.get(col.id) || []}
                                        onUpdateStatus={handleUpdateStatus}
                                    />
                                ))}
                                </BoardContainer>

                                {typeof document !== 'undefined' && createPortal(
                                    <DragOverlay>
                                        {activeTask && (
                                        <TaskCard
                                            task={activeTask}
                                            isOverlay
                                            onUpdateStatus={handleUpdateStatus}
                                        />
                                        )}
                                    </DragOverlay>,
                                    document.body
                                )}
                            </DndContext>
                        </main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
