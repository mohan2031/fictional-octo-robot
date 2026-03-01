
"use server";

import { generateInquiryResponse } from "@/ai/flows/generate-inquiry-response-flow";
import { z } from "zod";
import { getClinicById } from "./data";

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
