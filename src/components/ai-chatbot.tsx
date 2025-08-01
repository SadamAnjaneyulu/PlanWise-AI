'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Chat from '@/components/chat';
import { Task } from '@/types';

interface AIChatbotProps {
    tasks: Task[];
}

export default function AIChatbot({ tasks }: AIChatbotProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="rounded-full w-14 h-14 bg-primary text-primary-foreground text-2xl font-bold shadow-lg hover:bg-primary/90"
            aria-label="Open AI Assistant"
          >
            A
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 border-0" align="end" sideOffset={10}>
          <Chat tasks={tasks} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
