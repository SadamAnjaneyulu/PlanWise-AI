
'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Clock, Tag, MoreVertical, Edit, Trash2, Star, GripVertical } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import EditTaskDialog from './edit-task-dialog';

interface TaskCardProps {
  task: Task;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
  isOverlay?: boolean;
}

const categoryStyles = {
  Work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Personal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Study: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Errands: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const priorityStyles = {
  1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
  2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300',
};

const statusOptions: { label: string; value: TaskStatus }[] = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'inprogress' },
    { label: 'Done', value: 'done' },
  ];

export default function TaskCard({ task, onUpdateTask, onDeleteTask, onUpdateStatus, isOverlay }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isDone = task.status === 'done';
  const isOverdue = !isDone && task.deadline < new Date();

  const handleCheckboxChange = (checked: boolean) => {
    if (onUpdateStatus) {
      onUpdateStatus(task.id, checked ? 'done' : 'todo');
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  }

  const handleUpdate = (updatedTask: Omit<Task, 'id' | 'status'>) => {
    if(onUpdateTask) {
        onUpdateTask({ ...task, ...updatedTask });
    }
  }

  const cardContent = (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all relative group',
        isDragging && 'opacity-50 z-50 shadow-lg',
        isDone && 'bg-card/60',
        isOverlay && 'shadow-2xl'
      )}
    >
      <div className="flex items-start p-4" >
        <button {...attributes} {...listeners} className="flex-shrink-0 mt-1 -ml-1 mr-2 p-1 touch-none cursor-grab group-hover:bg-accent rounded-sm" aria-label={`Drag task ${task.name}`}>
            <GripVertical className="h-5 w-5 text-muted-foreground/50" />
        </button>
        <Checkbox
          id={`task-${task.id}`}
          checked={isDone}
          onCheckedChange={handleCheckboxChange}
          className="mr-4 mt-1"
          aria-label={`Mark task ${task.name} as ${isDone ? 'not done' : 'done'}`}
        />
        <div className="flex-grow">
          <CardHeader className="p-0">
            <CardTitle className={cn('text-lg', isDone && 'line-through text-muted-foreground')}>
              {task.name}
            </CardTitle>
            {task.description && (
              <CardDescription className={cn(isDone && 'line-through text-muted-foreground/80')}>
                {task.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 mt-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className={cn(isOverdue && 'text-red-500 font-medium')}>{format(task.deadline, 'MMM d, yyyy')}</span>
              </div>
              {task.estimatedTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{task.estimatedTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className={cn('font-normal', categoryStyles[task.category])}>
                    <Tag className="h-3 w-3 mr-1.5"/>
                    {task.category}
                </Badge>
                {task.priority && (
                    <Badge variant="outline" className={cn('font-medium', priorityStyles[task.priority as keyof typeof priorityStyles] || 'border-transparent')}>
                        <Star className="h-3 w-3 mr-1.5" />
                        Priority {task.priority}
                    </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>
        {(onDeleteTask || onUpdateStatus || onUpdateTask) && (
            <div className="ml-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Task options</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {onUpdateStatus && (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <span>Move to</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {statusOptions.map(option => (
                                    <DropdownMenuItem 
                                        key={option.value}
                                        onClick={() => onUpdateStatus(task.id, option.value)}
                                        disabled={task.status === option.value}
                                    >
                                    {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                )}
                {onUpdateTask && (
                    <EditTaskDialog task={task} onUpdateTask={handleUpdate} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                    </EditTaskDialog>
                )}
                {onDeleteTask && (
                    <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                    </DropdownMenuItem>
                )}
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
        )}
      </div>
    </Card>
  );

  return cardContent;
}
