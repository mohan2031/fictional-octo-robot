"use client";

import { useFormState } from "react-dom";
import { useEffect, useState } from 'react';
import { createShopInquiryResponse } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ShopInquiry } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const initialState = {
  message: "",
  response: "",
};

interface AiShopInquiryResponseProps {
    inquiry: ShopInquiry;
}

export function AiShopInquiryResponse({ inquiry }: AiShopInquiryResponseProps) {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(createShopInquiryResponse, initialState);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsGenerating(false);
    if (formState.message === "success" && formState.response) {
      setGeneratedResponse(formState.response);
    } else if (formState.message && formState.message !== "success") {
      toast({
        title: "Error",
        description: formState.message,
        variant: "destructive",
      });
      setIsOpen(false);
    }
  }, [formState, toast]);

  const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(true);
    setGeneratedResponse("");
    setIsGenerating(true);
    const formData = new FormData();
    formData.append("customerName", inquiry.name);
    formData.append("customerMessage", inquiry.message);
    formData.append("shopId", inquiry.shopId);
    formAction(formData);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResponse);
    toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" onClick={handleGenerateClick} onFocus={(e) => e.stopPropagation()}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Reply
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>AI Generated Reply</DialogTitle>
          <DialogDescription>
            Here's a draft response for the message from {inquiry.name}. You can edit it before sending.
          </DialogDescription>
        </DialogHeader>
        {isGenerating ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Generating response...</p>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ai-response">Suggested Response</Label>
                    <Textarea 
                        id="ai-response"
                        value={generatedResponse}
                        onChange={(e) => setGeneratedResponse(e.target.value)}
                        rows={8}
                    />
                </div>
                 <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                </Button>
            </div>
        )}
        <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
