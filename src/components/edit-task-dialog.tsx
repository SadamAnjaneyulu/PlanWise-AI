
'use client';

import { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Task, TaskCategory } from '@/types';
import { allocateTaskTime } from '@/ai/flows/allocate-task-time';
import { useToast } from '@/hooks/use-toast';

const taskCategories: TaskCategory[] = ['Work', 'Personal', 'Errands', 'Study'];

const taskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required.'),
  description: z.string().optional(),
  category: z.enum(taskCategories),
  deadline: z.date({ required_error: 'A deadline is required.' }),
  estimatedTime: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface EditTaskDialogProps {
  children: React.ReactNode;
  task: Task;
  onUpdateTask: (task: Omit<Task, 'id' | 'status'>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTaskDialog({ children, task, onUpdateTask, open, onOpenChange }: EditTaskDialogProps) {
  const [isSuggestingTime, startSuggestingTime] = useTransition();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
        name: task.name,
        description: task.description,
        category: task.category,
        deadline: task.deadline,
        estimatedTime: task.estimatedTime,
    },
  });

  useEffect(() => {
    form.reset({
        name: task.name,
        description: task.description,
        category: task.category,
        deadline: task.deadline,
        estimatedTime: task.estimatedTime,
    })
  }, [task, form])

  const handleSuggestTime = () => {
    const taskData = form.getValues();
    if (!taskData.name) {
      form.setError('name', {
        type: 'manual',
        message: 'Please enter a task name to suggest a time.',
      });
      return;
    }

    startSuggestingTime(async () => {
      try {
        const result = await allocateTaskTime({
          taskName: taskData.name,
          taskDescription: taskData.description || '',
          category: taskData.category,
          priority: 'medium', // Default priority for new tasks
        });
        form.setValue('estimatedTime', result.estimatedTime);
        toast({
            title: "AI Suggestion",
            description: `We suggest allocating ${result.estimatedTime}. ${result.reasoning}`,
        })
      } catch (error) {
        console.error('AI Time Suggestion Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get AI time suggestion.',
        });
      }
    });
  };

  const onSubmit = (data: TaskFormValues) => {
    onUpdateTask({
      name: data.name,
      description: data.description || '',
      category: data.category,
      deadline: data.deadline,
      estimatedTime: data.estimatedTime,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild onClick={() => onOpenChange(true)}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finalize project report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="e.g., 2 hours" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestTime}
                      disabled={isSuggestingTime}
                      className="shrink-0"
                    >
                      {isSuggestingTime ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
