"use client";

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createProductDescription } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function AiProductForm() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleGenerateClick = async () => {
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
        try {
          const result = await createProductDescription({}, formData);
          if (result.message === 'success' && result.description) {
            setDescription(result.description);
            toast({
              title: "Description Generated!",
              description: "The AI-generated description has been added.",
            });
          } else {
            throw new Error(result.message);
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to generate description.",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
    }
  };

  const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !firestore || !formRef.current) return;
    
    setIsSaving(true);
    const formData = new FormData(formRef.current);
    const productName = formData.get('productName') as string;
    const formDescription = formData.get('description') as string;

    if (!productName) {
        toast({
            title: "Product Name Required",
            description: "Please enter a product name before saving.",
            variant: "destructive"
        });
        setIsSaving(false);
        return;
    }

    try {
        const shopsRef = collection(firestore, 'shops');
        const q = query(shopsRef, where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("No shop found for your account. Please create a shop first.");
        }

        const shopDoc = querySnapshot.docs[0];
        const shopRef = doc(firestore, 'shops', shopDoc.id);

        const newProduct = {
            id: crypto.randomUUID(),
            name: productName,
            description: formDescription || "No description provided.",
            isAvailable: formData.get('isAvailable') === 'on',
            imageUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/400/300`,
            imageHint: 'product',
        };

        updateDoc(shopRef, {
            products: arrayUnion(newProduct)
        }).catch((error) => {
          const permissionError = new FirestorePermissionError({
              path: shopRef.path,
              operation: 'update',
              requestResourceData: { products: arrayUnion(newProduct) },
          });
          errorEmitter.emit('permission-error', permissionError);
          throw error;
        });

        toast({
            title: "Product Saved!",
            description: `${productName} has been added to your shop.`,
        });
        router.push('/dashboard/products');

    } catch (error: any) {
        console.error("Error saving product:", error);
        if (!(error instanceof FirestorePermissionError)) {
          toast({
              title: "Error Saving Product",
              description: error.message || "An unexpected error occurred.",
              variant: "destructive",
          });
        }
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <form ref={formRef} onSubmit={handleSaveProduct} className="space-y-6">
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
      <div className="flex items-center space-x-2">
        <Switch id="isAvailable" name="isAvailable" defaultChecked={true} />
        <Label htmlFor="isAvailable">Product is Available</Label>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}
