import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Shield, Building2, Users } from 'lucide-react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthModeToggle, type LoginMode } from '@/components/auth/AuthModeToggle';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signIn, signUp, isAdmin, isClient, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const modeFromUrl = searchParams.get('mode') as LoginMode | null;
  const [loginMode, setLoginMode] = useState<LoginMode>(modeFromUrl || 'team');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Sync mode with URL
  useEffect(() => {
    if (modeFromUrl) setLoginMode(modeFromUrl);
  }, [modeFromUrl]);

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (user && !loading) {
      if (isSuperAdmin) navigate('/paycore');
      else if (isAdmin) navigate('/admin');
      else if (isClient) navigate('/client');
    }
  }, [user, loading, isAdmin, isClient, isSuperAdmin, navigate]);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signUpSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (error) {
      const isAlreadyRegistered = error.message.includes('already registered');
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: isAlreadyRegistered ? 'This email is already registered. Please log in instead.' : error.message,
      });
      if (isAlreadyRegistered) setActiveTab('login');
    } else {
      toast({ title: 'Account Created', description: 'Please contact a super admin to get access.' });
      setActiveTab('login');
    }
  };

  if (loading) return <LoadingScreen />;

  const PortalIcon = loginMode === 'team' ? Shield : loginMode === 'client' ? Building2 : Users;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <AuthModeToggle mode={loginMode} onModeChange={setLoginMode} />
          
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <PortalIcon className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">
              {loginMode === 'team' ? 'PayCore Team' : loginMode === 'client' ? 'Client Admin' : 'Client Portal'}
            </CardTitle>
            <CardDescription>
              {loginMode === 'team' 
                ? 'Internal team — full access to all client management' 
                : loginMode === 'client'
                ? 'Sign in to access your admin dashboard'
                : 'Sign in to access your company portal'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {loginMode === 'team' ? (
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              ) : (
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Use the credentials provided by your administrator
                </p>
              )}
              
              <TabsContent value="login">
                <LoginForm
                  email={email}
                  password={password}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handleLogin}
                  isSubmitting={isSubmitting}
                  onForgotPassword={() => setShowForgotPassword(true)}
                />
              </TabsContent>
              
              {loginMode === 'team' && (
                <TabsContent value="signup">
                  <SignUpForm
                    email={email}
                    password={password}
                    fullName={fullName}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onFullNameChange={setFullName}
                    onSubmit={handleSignUp}
                    isSubmitting={isSubmitting}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
