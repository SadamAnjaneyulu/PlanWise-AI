
"use client"

import React, { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import TaskCard from './task-card';
import { type Task, TaskStatus } from '@/types';

interface BoardContainerProps {
  children: React.ReactNode;
}

export function BoardContainer({ children }: BoardContainerProps) {
  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}

interface BoardColumnProps {
  column: {
    id: TaskStatus;
    title: string;
  };
  tasks: Task[];
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
}

export function BoardColumn({ column, tasks, onUpdateStatus }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col"
    >
      <div className="bg-muted p-4 rounded-lg rounded-b-none border-x border-t">
        <h3 className="text-lg font-bold">{column.title}</h3>
      </div>
      <div className="flex flex-grow flex-col gap-4 p-4 bg-muted/50 rounded-lg rounded-t-none border">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdateStatus={onUpdateStatus} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
