'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/allocate-task-time.ts';
import '@/ai/flows/prioritize-tasks.ts';
import '@/ai/flows/chat.ts';
