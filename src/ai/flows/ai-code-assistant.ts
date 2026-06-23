'use server';
/**
 * @fileOverview An AI assistant for code generation, explanation, and improvement suggestions.
 *
 * - aiCodeAssistant - A function that handles AI code assistance requests.
 * - AICodeAssistantInput - The input type for the aiCodeAssistant function.
 * - AICodeAssistantOutput - The return type for the aiCodeAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICodeAssistantInputSchema = z.object({
  userQuery: z
    .string()
    .describe(
      "The developer's question or request for the AI assistant (e.g., 'generate a responsive navbar', 'explain this CSS property', 'suggest improvements for this JS code')."
    ),
  htmlCode: z.string().describe('The current HTML code in the editor.').default(''),
  cssCode: z.string().describe('The current CSS code in the editor.').default(''),
  jsCode: z.string().describe('The current JavaScript code in the editor.').default(''),
  activeEditor: z
    .enum(['html', 'css', 'javascript'])
    .describe('The editor (HTML, CSS, or JavaScript) the user is currently focused on.')
    .default('html'),
});
export type AICodeAssistantInput = z.infer<typeof AICodeAssistantInputSchema>;

const AICodeAssistantOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe(
      'The AI assistant\'s response, which can be a generated code snippet, an explanation, or a suggestion.'
    ),
});
export type AICodeAssistantOutput = z.infer<typeof AICodeAssistantOutputSchema>;

export async function aiCodeAssistant(input: AICodeAssistantInput): Promise<AICodeAssistantOutput> {
  return aiCodeAssistantFlow(input);
}

const aiCodeAssistantPrompt = ai.definePrompt({
  name: 'aiCodeAssistantPrompt',
  input: {schema: AICodeAssistantInputSchema},
  output: {schema: AICodeAssistantOutputSchema},
  prompt: `You are an AI code assistant for a web development editor named CodeCanvas. Your primary goal is to help developers accelerate their development process and learn more effectively by providing intelligent assistance for HTML, CSS, and JavaScript.

Based on the user's request and the provided code context, you should perform one of the following tasks:
1. Generate code snippets that are well-formatted and directly usable.
2. Provide clear, concise explanations for unfamiliar syntax or concepts, avoiding unnecessary jargon.
3. Suggest improvements or best practices for the code, explaining the reasoning behind your suggestions.

Always prioritize providing directly actionable and high-quality responses. If generating code, wrap it in appropriate markdown code blocks (e.g., \x60\x60\x60html \x60\x60\x60, \x60\x60\x60css \x60\x60\x60, or \x60\x60\x60javascript \x60\x60\x60).

Here is the current code context from the user's editor:

---
HTML Code:
\x60\x60\x60html
{{{htmlCode}}}
\x60\x60\x60

CSS Code:
\x60\x60\x60css
{{{cssCode}}}
\x60\x60\x60

JavaScript Code:
\x60\x60\x60javascript
{{{jsCode}}}
\x60\x60\x60
---

Active Editor: {{{activeEditor}}}

Developer's Request: {{{userQuery}}}

Your helpful and expert response:`,
});

const aiCodeAssistantFlow = ai.defineFlow(
  {
    name: 'aiCodeAssistantFlow',
    inputSchema: AICodeAssistantInputSchema,
    outputSchema: AICodeAssistantOutputSchema,
  },
  async input => {
    const {output} = await aiCodeAssistantPrompt(input);
    return output!;
  }
);
