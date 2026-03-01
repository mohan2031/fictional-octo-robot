'use server';
/**
 * @fileOverview An AI agent for generating product descriptions.
 *
 * - generateProductDescription - A function that generates a product description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  keyFeatures:
    z.string()
      .optional()
      .describe('Comma-separated key features of the product (e.g., "Waterproof, 10-hour battery life, ergonomic design").'),
  productCategory:
    z.string()
      .optional()
      .describe('The category of the product (e.g., "Electronics", "Clothing", "Home Goods").'),
  targetAudience:
    z.string()
      .optional()
      .describe('The primary target audience for the product (e.g., "Gamers", "Parents of toddlers", "DIY enthusiasts").'),
  additionalContext:
    z.string()
      .optional()
      .describe('Any additional context or specific selling points about the product.'),
});
export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const generateProductDescriptionPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are a skilled copywriter specializing in e-commerce product descriptions. Your task is to create a clear, concise, and engaging product description based on the provided details. The description should highlight key benefits, features, and appeal to the target audience.

Product Name: {{{productName}}}
{{#if keyFeatures}}Key Features: {{{keyFeatures}}}{{/if}}
{{#if productCategory}}Product Category: {{{productCategory}}}{{/if}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
{{#if additionalContext}}Additional Information: {{{additionalContext}}}{{/if}}

Generate a product description that is at least 3 sentences long, persuasive, and highlights the value proposition of the product. Focus on the benefits for the customer. Do not include a title or any introductory/concluding remarks like "Here is your description" or "Product Description:". Just provide the description itself.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateProductDescriptionPrompt(input);
    return output!;
  }
);
