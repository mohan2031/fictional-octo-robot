import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { ProductList } from "./product-list";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-headline">Manage Products</h2>
          <p className="text-muted-foreground">Add, edit, and manage your products and services.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Inventory</CardTitle>
          <CardDescription>A list of all products and services you offer.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductList />
        </CardContent>
      </Card>
    </div>
  );
}
