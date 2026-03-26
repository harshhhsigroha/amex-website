import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ClientAuth() {
  const navigate = useNavigate();
  const { user, loading, signIn, isClient, isAdmin } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !loading) {
      if (isClient) {
        navigate('/ops'); // PayCore clients → Invoice Tool
      } else if (isAdmin) {
        navigate('/paycore'); // PayCore team should use /auth/team
      }
    }
  }, [user, loading, isClient, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' ? 'Invalid email or password' : error.message,
      });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Company Portal</CardTitle>
            <CardDescription>Sign in with the credentials provided by your account manager</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <LoginForm
              email={email}
              password={password}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
