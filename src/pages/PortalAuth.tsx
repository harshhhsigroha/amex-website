import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomDomainContext } from '@/contexts/CustomDomainContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Building2, ArrowLeft } from 'lucide-react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function PortalAuth() {
  const navigate = useNavigate();
  const { user, loading, identityReady, signIn, isPortalUser, isClient, isAdmin } = useAuth();
  const { isCustomDomain, domainInfo } = useCustomDomainContext();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && identityReady && user) {
      if (isPortalUser) navigate('/admin');
      else if (isClient) navigate('/ops');
      else if (isAdmin) navigate('/paycore');
    }
  }, [user, loading, identityReady, isPortalUser, isClient, isAdmin, navigate]);

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

  if (loading || (user && !identityReady)) return <LoadingScreen />;

  const brandName = domainInfo?.brandName || 'Client Portal';
  const logoUrl = domainInfo?.logoUrl;
  const primaryColor = domainInfo?.primaryColor;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {!isCustomDomain && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />Back to home
          </Button>
        )}

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="mx-auto h-16 w-16 rounded-xl object-contain" />
            ) : (
              <div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                style={primaryColor ? { backgroundColor: primaryColor + '1a' } : { backgroundColor: 'hsl(var(--primary) / 0.1)' }}
              >
                <Building2 className="h-8 w-8" style={primaryColor ? { color: primaryColor } : { color: 'hsl(var(--primary))' }} />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold">{brandName}</CardTitle>
              <CardDescription>
                {isCustomDomain
                  ? 'Sign in to access your portal'
                  : 'Sign in with the credentials provided by your company'}
              </CardDescription>
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

        {isCustomDomain && !domainInfo?.hidePoweredBy && (
          <p className="text-center text-[10px] text-muted-foreground/50">Powered by AMEX Outsourcing</p>
        )}
      </div>
    </div>
  );
}
