
'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from '@/components/task-card';
import type { Task, TaskStatus } from '@/types';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskList({
  tasks,
  setTasks,
  onUpdateTask,
  onDeleteTask,
  onUpdateStatus,
}: TaskListProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
             setTasks((currentTasks) => {
                const activeTaskInGlobal = currentTasks.find(t => t.id === active.id);
                const overTaskInGlobal = currentTasks.find(t => t.id === over.id);

                if (!activeTaskInGlobal || !overTaskInGlobal) return currentTasks;

                const oldIndexInGlobal = currentTasks.indexOf(activeTaskInGlobal);
                const newIndexInGlobal = currentTasks.indexOf(overTaskInGlobal);
                
                return arrayMove(currentTasks, oldIndexInGlobal, newIndexInGlobal);
            });
        }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          ) : (
            <div className="text-center py-12 px-6 bg-card rounded-lg border border-dashed">
              <h3 className="text-lg font-medium text-muted-foreground">No tasks for this day!</h3>
              <p className="text-sm text-muted-foreground mt-1">Select another date or add a new task.</p>
            </div>
          )}
        </div>
      </SortableContext>
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>{activeTask && <TaskCard task={activeTask} isOverlay />}</DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
