"use server";

import { generateProductDescription } from "@/ai/flows/generate-product-description-flow";
import { z } from "zod";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  keyFeatures: z.string().optional(),
});

export async function createProductDescription(
  prevState: any,
  formData: FormData
) {
  const validatedFields = productSchema.safeParse({
    productName: formData.get("productName"),
    keyFeatures: formData.get("keyFeatures"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid fields for AI generation.",
    };
  }

  try {
    const { description } = await generateProductDescription(
      validatedFields.data
    );
    return { description, message: "success" };
  } catch (error) {
    return {
      message: "Failed to generate description. Please try again.",
    };
  }
}
