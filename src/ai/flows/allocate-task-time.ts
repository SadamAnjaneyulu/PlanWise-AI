'use server';

/**
 * @fileOverview Allocates time for a given task using AI.
 *
 * - allocateTaskTime - A function that suggests an appropriate time allocation for a task.
 * - AllocateTaskTimeInput - The input type for the allocateTaskTime function.
 * - AllocateTaskTimeOutput - The return type for the allocateTaskTime function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const AllocateTaskTimeInputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  category: z.string().describe('The category of the task (e.g., work, personal, errands).'),
  priority: z
    .enum(['high', 'medium', 'low'])
    .describe('The priority of the task. Higher priority tasks may require more immediate attention.'),
});
export type AllocateTaskTimeInput = z.infer<typeof AllocateTaskTimeInputSchema>;

const AllocateTaskTimeOutputSchema = z.object({
  estimatedTime: z
    .string()
    .describe(
      'The estimated time needed to complete the task, in minutes or hours. E.g., "30 minutes" or "2 hours".'
    ),
  reasoning: z
    .string()
    .describe('The AI explanation for the time allocation, considering task details and priority.'),
});
export type AllocateTaskTimeOutput = z.infer<typeof AllocateTaskTimeOutputSchema>;

export async function allocateTaskTime(input: AllocateTaskTimeInput): Promise<AllocateTaskTimeOutput> {
  return allocateTaskTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'allocateTaskTimePrompt',
  input: {schema: AllocateTaskTimeInputSchema},
  output: {schema: AllocateTaskTimeOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are a time management expert. Analyze the task details and suggest an estimated time needed to complete the task.

Task Name: {{{taskName}}}
Description: {{{taskDescription}}}
Category: {{{category}}}
Priority: {{{priority}}}

Consider the task's complexity, category, and priority when determining the time allocation. Provide a brief reasoning for your suggestion.

Format your response as follows:
estimatedTime: [estimated time in minutes or hours]
reasoning: [explanation for the time allocation]`,
});

const allocateTaskTimeFlow = ai.defineFlow(
  {
    name: 'allocateTaskTimeFlow',
    inputSchema: AllocateTaskTimeInputSchema,
    outputSchema: AllocateTaskTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
