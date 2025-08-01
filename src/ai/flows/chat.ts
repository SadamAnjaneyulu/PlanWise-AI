'use server';
/**
 * @fileOverview A conversational AI flow for assisting with tasks.
 *
 * - chat - A function that handles conversational interactions.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  tasks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    deadline: z.string().describe("The deadline of the task (ISO format)."),
    category: z.string(),
    status: z.string(),
  })).optional().describe("The user's current list of tasks."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are a helpful AI assistant for the PlanWise AI application. Your goal is to help users manage their tasks and plans.

You have access to the user's current task list. Use this information to answer questions about their schedule, suggest what to work on, or help them plan their day.

Today's date is: ${new Date().toLocaleDateString()}

Here is the user's current task list:
{{#if tasks}}
  {{#each tasks}}
  - Task: {{this.name}} (Status: {{this.status}})
    Description: {{this.description}}
    Deadline: {{this.deadline}}
    Category: {{this.category}}
  {{/each}}
{{else}}
  The user has no tasks.
{{/if}}

User message: {{{message}}}

Provide a helpful and concise response based on the user's tasks and their message.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
