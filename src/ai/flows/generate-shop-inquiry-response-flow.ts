'use server';
/**
 * @fileOverview An AI agent for generating responses to customer inquiries for a shop.
 *
 * - generateShopInquiryResponse - A function that generates a response to a customer inquiry.
 * - GenerateShopInquiryResponseInput - The input type for the generateShopInquiryResponse function.
 * - GenerateShopInquiryResponseOutput - The return type for the generateShopInquiryResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShopInquiryResponseInputSchema = z.object({
  customerName: z.string().describe("The name of the customer making the inquiry."),
  customerMessage: z.string().describe("The customer's inquiry message."),
  shopName: z.string().describe("The name of the shop."),
});
export type GenerateShopInquiryResponseInput = z.infer<
  typeof GenerateShopInquiryResponseInputSchema
>;

const GenerateShopInquiryResponseOutputSchema = z.object({
  response: z.string().describe('The generated response to the customer.'),
});
export type GenerateShopInquiryResponseOutput = z.infer<
  typeof GenerateShopInquiryResponseOutputSchema
>;

export async function generateShopInquiryResponse(
  input: GenerateShopInquiryResponseInput
): Promise<GenerateShopInquiryResponseOutput> {
  return generateShopInquiryResponseFlow(input);
}

const generateShopInquiryResponsePrompt = ai.definePrompt({
  name: 'generateShopInquiryResponsePrompt',
  input: {schema: GenerateShopInquiryResponseInputSchema},
  output: {schema: GenerateShopInquiryResponseOutputSchema},
  prompt: `You are a helpful assistant for a busy shop owner. Your task is to draft a polite and helpful response to a customer's inquiry.

Shop Name: {{{shopName}}}

Customer Name: {{{customerName}}}
Customer's Message:
"{{{customerMessage}}}"

Based on the customer's message, draft a friendly and professional response.
- If the customer is asking about product availability or price, suggest they visit the shop or provide contact details for more information.
- If the customer is asking about services, provide a general and helpful response.
- Keep the tone warm and professional.
- Address the customer by name.

Generate only the response text.
`,
});

const generateShopInquiryResponseFlow = ai.defineFlow(
  {
    name: 'generateShopInquiryResponseFlow',
    inputSchema: GenerateShopInquiryResponseInputSchema,
    outputSchema: GenerateShopInquiryResponseOutputSchema,
  },
  async input => {
    const {output} = await generateShopInquiryResponsePrompt(input);
    return output!;
  }
);
