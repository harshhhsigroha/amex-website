import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, LogIn, LogOut, Loader2, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster as Sonner } from '@/components/ui/sonner';

interface GeoLocation {
  lat: number;
  lng: number;
  address: string | null;
}

interface CandidateInfo {
  id: string;
  name: string;
  emp_id: string;
}

interface ActiveSession {
  id: string;
  clockIn: string;
  clockInAddress: string | null;
}

export default function ClockInOut() {
  const { clientId } = useParams<{ clientId: string }>();
  const [candidateName, setCandidateName] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [isClocking, setIsClocking] = useState(false);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocation = useCallback(async (): Promise<GeoLocation | null> => {
    setLocationLoading(true);
    setLocationError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation not supported');
        setLocationLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let address: string | null = null;

          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { 'User-Agent': 'AMEXOutsourcing/1.0' } }
            );
            const data = await resp.json();
            address = data.display_name || null;
          } catch {
            // Geocoding failed
          }

          const loc = { lat: latitude, lng: longitude, address };
          setLocation(loc);
          setLocationLoading(false);
          resolve(loc);
        },
        (err) => {
          setLocationError(err.message || 'Failed to get location');
          setLocationLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !clientId) return;

    setIsLooking(true);
    setCandidate(null);
    setActiveSession(null);

    try {
      const { data, error } = await supabase.functions.invoke('clock-action', {
        body: { action: 'lookup', clientId, candidateName: candidateName.trim() },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCandidate(data.candidate);
      setActiveSession(data.activeSession || null);
      setCompanyName(data.companyName || '');
      getLocation();
    } catch {
      toast.error('Failed to look up. Please try again.');
    } finally {
      setIsLooking(false);
    }
  };

  const handleClockIn = async () => {
    if (!candidate || !clientId) return;
    setIsClocking(true);

    const loc = location || await getLocation();

    try {
      const { data, error } = await supabase.functions.invoke('clock-action', {
        body: {
          action: 'clock_in',
          clientId,
          candidateName: candidate.name,
          lat: loc?.lat,
          lng: loc?.lng,
          address: loc?.address,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setActiveSession({ id: data.logId, clockIn: data.clockIn, clockInAddress: data.address });
      toast.success('Clocked In!', { description: `At ${new Date(data.clockIn).toLocaleTimeString('en-GB')}` });
    } catch {
      toast.error('Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    if (!candidate || !clientId) return;
    setIsClocking(true);

    const loc = location || await getLocation();

    try {
      const { data, error } = await supabase.functions.invoke('clock-action', {
        body: {
          action: 'clock_out',
          clientId,
          candidateName: candidate.name,
          lat: loc?.lat,
          lng: loc?.lng,
          address: loc?.address,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setActiveSession(null);
      toast.success('Clocked Out!', { description: `Total: ${data.totalHours} hours` });
    } catch {
      toast.error('Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  };

  const handleReset = () => {
    setCandidate(null);
    setActiveSession(null);
    setCandidateName('');
    setLocation(null);
  };

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold">Invalid Link</p>
            <p className="text-muted-foreground mt-2">This clock-in link is not valid. Please contact your employer.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Sonner />
      <Card className="w-full max-w-md shadow-2xl border-border/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {companyName || 'Time Clock'}
          </CardTitle>
          <CardDescription className="mt-1">
            {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </CardDescription>
          <p className="text-4xl font-mono font-bold text-foreground mt-3 tracking-wider">
            {currentTime.toLocaleTimeString('en-GB')}
          </p>
        </div>

        <CardContent className="px-6 pb-8 pt-6 space-y-6">
          {!candidate ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Enter your full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. John Smith"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    autoFocus
                    className="pl-10 text-center text-lg h-12"
                    maxLength={100}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Type your name exactly as registered, or enter a new name to get started
                </p>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLooking || !candidateName.trim()}>
                {isLooking ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                Continue
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Welcome card */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 text-center border border-primary/10">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Welcome</p>
                <p className="text-xl font-bold text-foreground mt-1">{candidate.name}</p>
                <Badge variant="outline" className="mt-2 font-mono text-xs">
                  ID: {candidate.emp_id}
                </Badge>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm px-1">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {locationLoading ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Getting location...
                  </span>
                ) : locationError ? (
                  <span className="text-amber-600 text-xs">{locationError}</span>
                ) : location?.address ? (
                  <span className="text-muted-foreground text-xs truncate">{location.address}</span>
                ) : (
                  <span className="text-muted-foreground text-xs">Location unavailable</span>
                )}
              </div>

              {/* Active session */}
              {activeSession && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Active Session</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {new Date(activeSession.clockIn).toLocaleTimeString('en-GB')}
                  </p>
                  {activeSession.clockInAddress && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{activeSession.clockInAddress}</p>
                  )}
                </div>
              )}

              {/* Clock buttons */}
              <div className="grid gap-3 pt-2">
                {!activeSession ? (
                  <Button
                    onClick={handleClockIn}
                    disabled={isClocking}
                    className="h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                    size="lg"
                  >
                    {isClocking ? (
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-6 w-6 mr-2" />
                    )}
                    Clock In
                  </Button>
                ) : (
                  <Button
                    onClick={handleClockOut}
                    disabled={isClocking}
                    className="h-16 text-lg font-bold rounded-xl shadow-lg"
                    variant="destructive"
                    size="lg"
                  >
                    {isClocking ? (
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    ) : (
                      <LogOut className="h-6 w-6 mr-2" />
                    )}
                    Clock Out
                  </Button>
                )}

                <Button variant="ghost" onClick={handleReset} className="h-10 text-muted-foreground">
                  Not you? Start over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
