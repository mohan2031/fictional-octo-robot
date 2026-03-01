"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from 'react';
import { createInquiryResponse } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inquiry } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";

const initialState = {
  message: "",
  response: "",
};

interface AiInquiryResponseProps {
    inquiry: Inquiry;
}

export function AiInquiryResponse({ inquiry }: AiInquiryResponseProps) {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(createInquiryResponse, initialState);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (formState.message === "success" && formState.response) {
      setGeneratedResponse(formState.response);
      setIsGenerating(false);
    } else if (formState.message && formState.message !== "success") {
      toast({
        title: "Error",
        description: formState.message,
        variant: "destructive",
      });
      setIsGenerating(false);
      setShowResponse(false);
    }
  }, [formState, toast]);

  const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setGeneratedResponse("");
    setIsGenerating(true);
    setShowResponse(true);
    const formData = new FormData();
    formData.append("customerName", inquiry.name);
    formData.append("customerMessage", inquiry.message);
    formData.append("clinicId", inquiry.clinicId);
    formAction(formData);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResponse);
    toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
    });
  }

  if (!showResponse) {
    return (
        <Button size="sm" variant="outline" onClick={handleGenerateClick} onFocus={(e) => e.stopPropagation()}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Reply with AI
        </Button>
    );
  }

  return (
    <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4 space-y-4">
            <Label htmlFor="ai-response" className="flex items-center gap-2 text-primary font-semibold">
                <Sparkles className="h-4 w-4" />
                AI Generated Response
            </Label>
            {isGenerating ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4">Generating response...</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <Textarea 
                        id="ai-response"
                        value={generatedResponse}
                        onChange={(e) => setGeneratedResponse(e.target.value)}
                        rows={6}
                        className="bg-background"
                    />
                     <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Text
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
