'use server';
/**
 * @fileOverview An AI agent for generating responses to customer inquiries.
 *
 * - generateInquiryResponse - A function that generates a response to a customer inquiry.
 * - GenerateInquiryResponseInput - The input type for the generateInquiryResponse function.
 * - GenerateInquiryResponseOutput - The return type for the generateInquiryResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInquiryResponseInputSchema = z.object({
  customerName: z.string().describe("The name of the customer making the inquiry."),
  customerMessage: z.string().describe("The customer's inquiry message."),
  shopName: z.string().describe("The name of the shop."),
  shopProducts: z.array(z.string()).describe("A list of products the shop sells."),
});
export type GenerateInquiryResponseInput = z.infer<
  typeof GenerateInquiryResponseInputSchema
>;

const GenerateInquiryResponseOutputSchema = z.object({
  response: z.string().describe('The generated response to the customer.'),
});
export type GenerateInquiryResponseOutput = z.infer<
  typeof GenerateInquiryResponseOutputSchema
>;

export async function generateInquiryResponse(
  input: GenerateInquiryResponseInput
): Promise<GenerateInquiryResponseOutput> {
  return generateInquiryResponseFlow(input);
}

const generateInquiryResponsePrompt = ai.definePrompt({
  name: 'generateInquiryResponsePrompt',
  input: {schema: GenerateInquiryResponseInputSchema},
  output: {schema: GenerateInquiryResponseOutputSchema},
  prompt: `You are a helpful assistant for a busy shop owner. Your task is to draft a polite and helpful response to a customer's inquiry.

Shop Name: {{{shopName}}}
Shop Products: {{#each shopProducts}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Customer Name: {{{customerName}}}
Customer's Message:
"{{{customerMessage}}}"

Based on the customer's message and the shop's information, draft a friendly and professional response.
- If the customer is asking about product availability, check if it's in the product list.
- If the question is generic, provide a helpful, non-committal response.
- Keep the tone warm and personal.
- Address the customer by name.

Generate only the response text.
`,
});

const generateInquiryResponseFlow = ai.defineFlow(
  {
    name: 'generateInquiryResponseFlow',
    inputSchema: GenerateInquiryResponseInputSchema,
    outputSchema: GenerateInquiryResponseOutputSchema,
  },
  async input => {
    const {output} = await generateInquiryResponsePrompt(input);
    return output!;
  }
);
