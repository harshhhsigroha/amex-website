import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { checkRateLimit, recordFailedAttempt, clearLoginAttempts } from '@/lib/loginRateLimit';
import { ShieldCheck } from 'lucide-react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ClientAuth() {
  const navigate = useNavigate();
  const { user, loading, identityReady, signIn, isClient, isAdmin, isPortalUser, isRecovery, signOut } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isRecovery) return;
    if (user && !loading && identityReady) {
      if (isAdmin) {
        navigate('/dashboard');
      } else if (isClient || isPortalUser) {
        // Clients and portal users don't belong here — redirect or block
        toast({ variant: 'destructive', title: 'Access Denied', description: 'This portal is for the AMEX admin team only. Please use the Client Portal.' });
        signOut();
      }
    }
  }, [user, loading, identityReady, isClient, isAdmin, isPortalUser, isRecovery, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { allowed } = checkRateLimit();
    if (!allowed) {
      toast({ variant: 'destructive', title: 'Account Locked', description: 'Too many failed login attempts. Please wait.' });
      return;
    }
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      const { locked, remainingAttempts } = recordFailedAttempt();
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: locked
          ? 'Too many failed attempts. Your account is temporarily locked for 5 minutes.'
          : `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      });
    } else {
      clearLoginAttempts();
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>AMEX Outsourcing team login</CardDescription>
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
