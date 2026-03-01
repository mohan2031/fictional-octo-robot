"use client";

import { useFormState } from "react-dom";
import { useEffect, useState, useRef } from 'react';
import { createProductDescription } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: "",
  description: "",
};

export function AiProductForm() {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(createProductDescription, initialState);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsGenerating(false);
    if (formState.message === "success" && formState.description) {
      setDescription(formState.description);
      toast({
        title: "Description Generated!",
        description: "The AI-generated description has been added.",
      });
    } else if (formState.message && formState.message !== "success") {
      toast({
        title: "Error",
        description: formState.message,
        variant: "destructive",
      });
    }
  }, [formState, toast]);

  const handleGenerateClick = () => {
    if (formRef.current) {
        const formData = new FormData(formRef.current);
        const productName = formData.get('productName');
        if (!productName) {
            toast({
                title: "Product Name Required",
                description: "Please enter a product name before generating a description.",
                variant: "destructive"
            });
            return;
        }
        setIsGenerating(true);
        formAction(formData);
    }
  };


  return (
    <form ref={formRef} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="productName">Product Name</Label>
        <Input id="productName" name="productName" placeholder="e.g., 10kg Bag of Rice" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="keyFeatures">Key Features (optional)</Label>
        <Input id="keyFeatures" name="keyFeatures" placeholder="e.g., Premium quality, long-grain" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleGenerateClick} disabled={isGenerating}>
                {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate with AI
            </Button>
        </div>
        <Textarea 
            id="description" 
            name="description" 
            placeholder="A detailed description of your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">Save Product</Button>
      </div>
    </form>
  );
}
