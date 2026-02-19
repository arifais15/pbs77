import { LoginForm } from '@/components/login-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-2xl">বিলিং শাখার পত্র ব্যবস্থাপনা</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter>
            <p className="w-full text-center text-xs text-muted-foreground">
                Ariful Islam , AGM Finance, Gazipur PBS-2
            </p>
        </CardFooter>
      </Card>
    </main>
  );
}
