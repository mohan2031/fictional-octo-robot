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
  customerName: z.string().describe("The name of the patient making the inquiry."),
  customerMessage: z.string().describe("The patient's inquiry message."),
  clinicName: z.string().describe("The name of the clinic."),
});
export type GenerateInquiryResponseInput = z.infer<
  typeof GenerateInquiryResponseInputSchema
>;

const GenerateInquiryResponseOutputSchema = z.object({
  response: z.string().describe('The generated response to the patient.'),
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
  prompt: `You are a helpful assistant for a busy clinic receptionist. Your task is to draft a polite and helpful response to a patient's inquiry.

Clinic Name: {{{clinicName}}}

Patient Name: {{{customerName}}}
Patient's Message:
"{{{customerMessage}}}"

Based on the patient's message and the clinic's information, draft a friendly and professional response.
- If the patient is asking about appointments, guide them to use the appointment booking feature.
- If the patient is asking about services, provide a general and helpful response.
- Keep the tone warm and professional.
- Address the patient by name.

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
