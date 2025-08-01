export type TaskCategory = 'Work' | 'Personal' | 'Errands' | 'Study';

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type Task = {
  id: string;
  name: string;
  description: string;
  deadline: Date;
  category: TaskCategory;
  priority?: number; // 1 is highest
  status: TaskStatus;
  estimatedTime?: string;
};
