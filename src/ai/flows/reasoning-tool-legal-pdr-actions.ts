'use server';
/**
 * @fileOverview This file implements a Genkit flow that analyzes account details and includes relevant reminders or addenda
 * regarding potential legal or PDR (pre-disconnection review) actions in the generated letter if the account meets specific guidelines.
 *
 * - reasoningToolForLegalPdrActions - A function that processes the account details and returns legal/PDR reminders or addenda.
 * - ReasoningToolForLegalPdrActionsInput - The input type for the reasoningToolForLegalPdrActions function.
 * - ReasoningToolForLegalPdrActionsOutput - The return type for the reasoningToolForLegalPdrActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasoningToolForLegalPdrActionsInputSchema = z.object({
  accountBalance: z.number().describe('The current balance of the account.'),
  daysPastDue: z.number().describe('The number of days the account is past due.'),
  paymentHistory: z.string().describe('A summary of the account payment history.'),
});
export type ReasoningToolForLegalPdrActionsInput = z.infer<typeof ReasoningToolForLegalPdrActionsInputSchema>;

const ReasoningToolForLegalPdrActionsOutputSchema = z.object({
  legalReminder: z.string().describe('A reminder about potential legal actions.'),
  pdrAddendum: z.string().describe('An addendum regarding pre-disconnection review.'),
});
export type ReasoningToolForLegalPdrActionsOutput = z.infer<typeof ReasoningToolForLegalPdrActionsOutputSchema>;

export async function reasoningToolForLegalPdrActions(input: ReasoningToolForLegalPdrActionsInput): Promise<ReasoningToolForLegalPdrActionsOutput> {
  return reasoningToolForLegalPdrActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningToolForLegalPdrActionsPrompt',
  input: {schema: ReasoningToolForLegalPdrActionsInputSchema},
  output: {schema: ReasoningToolForLegalPdrActionsOutputSchema},
  prompt: `Analyze the account details below and determine if legal or PDR actions should be mentioned.

Account Balance: {{accountBalance}}
Days Past Due: {{daysPastDue}}
Payment History: {{paymentHistory}}

If the account balance is greater than 1000 and the days past due are greater than 90, include a legal reminder. If the days past due are greater than 60, include a PDR addendum. Return the legal reminder and PDR addendum text.
`,
});

const reasoningToolForLegalPdrActionsFlow = ai.defineFlow(
  {
    name: 'reasoningToolForLegalPdrActionsFlow',
    inputSchema: ReasoningToolForLegalPdrActionsInputSchema,
    outputSchema: ReasoningToolForLegalPdrActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
