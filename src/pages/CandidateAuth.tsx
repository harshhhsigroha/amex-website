import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { checkRateLimit, recordFailedAttempt, clearLoginAttempts } from '@/lib/loginRateLimit';
import { ArrowLeft, Loader2, UserCircle2 } from 'lucide-react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  empId: z.string().trim().min(1, 'Employee ID is required').max(50),
  email: z.string().email('Invalid email address'),
  fullName: z.string().trim().min(2, 'Please enter your full name').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function CandidateAuth() {
  const navigate = useNavigate();
  const { user, loading, identityReady, signIn, isCandidate, isAdmin, isClient, isPortalUser, isRecovery, signOut } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regEmpId, setRegEmpId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHoneypot, setRegHoneypot] = useState('');

  useEffect(() => {
    if (isRecovery) return;
    if (!loading && identityReady && user) {
      if (isCandidate) {
        navigate('/candidate');
      } else if (isAdmin || isClient || isPortalUser) {
        toast({ variant: 'destructive', title: 'Wrong portal', description: 'This account is not a candidate account.' });
        signOut();
      }
    }
  }, [user, loading, identityReady, isCandidate, isAdmin, isClient, isPortalUser, isRecovery, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { allowed } = checkRateLimit();
    if (!allowed) {
      toast({ variant: 'destructive', title: 'Account Locked', description: 'Too many failed login attempts. Please wait.' });
      return;
    }
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse({
      empId: regEmpId, email: regEmail, fullName: regFullName, password: regPassword,
    });
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Validation Error', description: result.error.errors[0].message });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('candidate-self-register', {
        body: {
          empId: regEmpId.trim(),
          email: regEmail.trim().toLowerCase(),
          fullName: regFullName.trim(),
          password: regPassword,
          _hp_field: regHoneypot,
        },
      });
      if (error || (data && (data as { error?: string }).error)) {
        const msg = (data as { error?: string })?.error || error?.message || 'Could not create account';
        throw new Error(msg);
      }
      toast({ title: 'Account created', description: 'Signing you in…' });
      const { error: signInErr } = await signIn(regEmail.trim().toLowerCase(), regPassword);
      if (signInErr) {
        toast({ variant: 'destructive', title: 'Sign-in failed', description: signInErr.message });
        setTab('login');
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Registration failed', description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || (user && !identityReady)) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />Back to home
        </Button>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
              <UserCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Candidate Portal</CardTitle>
              <CardDescription>View your self-billed invoices and chat with the AMEX team</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : (
              <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-4">
                  <LoginForm
                    email={loginEmail}
                    password={loginPassword}
                    onEmailChange={setLoginEmail}
                    onPasswordChange={setLoginPassword}
                    onSubmit={handleLogin}
                    isSubmitting={isSubmitting}
                    onForgotPassword={() => setShowForgotPassword(true)}
                  />
                </TabsContent>

                <TabsContent value="register" className="mt-4">
                  <form onSubmit={handleRegister} className="space-y-3">
                    {/* Honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={regHoneypot}
                      onChange={(e) => setRegHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
                      aria-hidden="true"
                    />

                    <div className="space-y-1.5">
                      <Label htmlFor="reg-emp-id">Employee ID</Label>
                      <Input id="reg-emp-id" placeholder="e.g. EMP12345" value={regEmpId} onChange={(e) => setRegEmpId(e.target.value)} required />
                      <p className="text-[11px] text-muted-foreground">As shown on your remittance.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-full-name">Full name</Label>
                      <Input id="reg-full-name" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                      <p className="text-[11px] text-muted-foreground">Must match the email on file for your record.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                      <PasswordStrength password={regPassword} />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create candidate account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
