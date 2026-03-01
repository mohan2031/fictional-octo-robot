"use server";

import { generateProductDescription } from "@/ai/flows/generate-product-description-flow";
import { generateInquiryResponse } from "@/ai/flows/generate-inquiry-response-flow";
import { z } from "zod";
import { getShopById } from "./data";

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
    console.error(error);
    return {
      message: "Failed to generate description. Please try again.",
    };
  }
}


const inquiryResponseSchema = z.object({
    customerName: z.string(),
    customerMessage: z.string(),
    shopId: z.string(),
});

export async function createInquiryResponse(
    prevState: any,
    formData: FormData
) {
    const validatedFields = inquiryResponseSchema.safeParse({
        customerName: formData.get("customerName"),
        customerMessage: formData.get("customerMessage"),
        shopId: formData.get("shopId"),
    });

    if (!validatedFields.success) {
        return {
        message: "Invalid fields for AI generation.",
        };
    }

    try {
        const shop = await getShopById(validatedFields.data.shopId);
        if (!shop) {
            return { message: "Shop not found." };
        }

        const { response } = await generateInquiryResponse({
            customerName: validatedFields.data.customerName,
            customerMessage: validatedFields.data.customerMessage,
            shopName: shop.name,
            shopProducts: shop.products.map(p => p.name),
        });
        return { response, message: "success" };
    } catch (error) {
        console.error(error);
        return {
            message: "Failed to generate response. Please try again.",
        };
    }
}
