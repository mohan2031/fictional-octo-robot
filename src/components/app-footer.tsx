import { Leaf } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="bg-secondary/50 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold font-headline">RuralReach</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2024 RuralReach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
