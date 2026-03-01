import { AiProductForm } from "@/components/ai-product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div className="text-left">
          <h2 className="text-3xl font-bold font-headline">Add a New Product</h2>
          <p className="text-muted-foreground">Fill in the details below. Use our AI tool to generate a compelling description!</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Provide information about your new product or service.</CardDescription>
        </CardHeader>
        <CardContent>
          <AiProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
