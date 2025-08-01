'use server';

/**
 * @fileOverview An AI agent that prioritizes tasks based on deadlines and categories.
 *
 * - prioritizeTasks - A function that prioritizes tasks.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string().describe('The name of the task.'),
        deadline: z.string().describe('The deadline of the task (ISO format).'),
        category: z.string().describe('The category of the task (e.g., Work, Personal).'),
      })
    )
    .describe('A list of tasks to prioritize.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z
    .array(
      z.object({
        name: z.string().describe('The name of the task.'),
        priority: z.number().describe('The priority of the task (1 being the highest).'),
        reason: z.string().describe('The reason for the assigned priority.'),
      })
    )
    .describe('A list of tasks with assigned priorities and reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an AI assistant helping users prioritize their tasks.

  Given the following list of tasks with their deadlines and categories, determine a priority for each task and provide a reason for the assigned priority.
  The priority should be a number, with 1 being the highest priority. Consider deadlines and categories when assigning priorities.

  Tasks:
  {{#each tasks}}
  - Name: {{this.name}}, Deadline: {{this.deadline}}, Category: {{this.category}}
  {{/each}}

  Output:
  Prioritized Tasks:
  {
    "prioritizedTasks": [
      {{#each tasks}}
        {
          "name": "{{this.name}}",
          "priority": (Number, 1 being the highest priority),
          "reason": "(Explanation for the assigned priority based on deadline and category)"
        }{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }
  `,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
