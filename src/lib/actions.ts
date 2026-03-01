
"use server";

import { generateInquiryResponse } from "@/ai/flows/generate-inquiry-response-flow";
import { generateShopInquiryResponse } from "@/ai/flows/generate-shop-inquiry-response-flow";
import { z } from "zod";
import { getClinicById, getShopById } from "./data";

const inquiryResponseSchema = z.object({
    customerName: z.string(),
    customerMessage: z.string(),
    clinicId: z.string(),
});

export async function createInquiryResponse(
    prevState: any,
    formData: FormData
) {
    const validatedFields = inquiryResponseSchema.safeParse({
        customerName: formData.get("customerName"),
        customerMessage: formData.get("customerMessage"),
        clinicId: formData.get("clinicId"),
    });

    if (!validatedFields.success) {
        return {
        message: "Invalid fields for AI generation.",
        };
    }

    try {
        const clinic = await getClinicById(validatedFields.data.clinicId);
        if (!clinic) {
            return { message: "Clinic not found." };
        }

        const { response } = await generateInquiryResponse({
            customerName: validatedFields.data.customerName,
            customerMessage: validatedFields.data.customerMessage,
            clinicName: clinic.name,
        });
        return { response, message: "success" };
    } catch (error) {
        console.error(error);
        return {
            message: "Failed to generate response. Please try again.",
        };
    }
}

const shopInquiryResponseSchema = z.object({
    customerName: z.string(),
    customerMessage: z.string(),
    shopId: z.string(),
});

export async function createShopInquiryResponse(
    prevState: any,
    formData: FormData
) {
    const validatedFields = shopInquiryResponseSchema.safeParse({
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

        const { response } = await generateShopInquiryResponse({
            customerName: validatedFields.data.customerName,
            customerMessage: validatedFields.data.customerMessage,
            shopName: shop.name,
        });
        return { response, message: "success" };
    } catch (error) {
        console.error(error);
        return {
            message: "Failed to generate response. Please try again.",
        };
    }
}
