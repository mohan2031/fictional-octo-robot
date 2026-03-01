import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, ShoppingCart, ArrowRight, User } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <div className="text-center w-full">
        <h1 className="text-4xl font-bold font-headline">Join RuralReach</h1>
        <p className="mt-2 text-lg text-muted-foreground">Choose your account type to get started.</p>
        <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-6xl mx-auto">
          <Card className="text-center flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-grow">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full mb-4 w-fit">
                <User className="h-10 w-10" />
              </div>
              <CardTitle>Patient or Customer</CardTitle>
              <CardDescription>
                Create an account to book appointments and manage your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="accent">
                <Link href="/signup-user">
                  Create an Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-grow">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full mb-4 w-fit">
                <Stethoscope className="h-10 w-10" />
              </div>
              <CardTitle>Clinic or Hospital</CardTitle>
              <CardDescription>
                Manage appointments, respond to patient inquiries, and update your clinic's profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/signup">
                  Register as a Clinic <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-grow">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full mb-4 w-fit">
                <ShoppingCart className="h-10 w-10" />
              </div>
              <CardTitle>Local Shop or Service</CardTitle>
              <CardDescription>
                List your products, manage customer inquiries, and grow your local business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/signup-shop">
                  Register as a Shop <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
