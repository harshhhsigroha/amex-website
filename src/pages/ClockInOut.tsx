import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, LogIn, LogOut, Loader2, Search, CheckCircle, AlertTriangle } from 'lucide-react';
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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get geolocation
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

          // Reverse geocode with OpenStreetMap Nominatim
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { 'User-Agent': 'AMEX OutsourcingTimesheets/1.0' } }
            );
            const data = await resp.json();
            address = data.display_name || null;
          } catch {
            // Geocoding failed, continue with coords only
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

  // Lookup candidate
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

      // Pre-fetch location
      getLocation();
    } catch (err) {
      toast.error('Failed to look up employee');
    } finally {
      setIsLooking(false);
    }
  };

  // Clock in
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
      toast.success('Clocked In!', { description: `At ${new Date(data.clockIn).toLocaleTimeString()}` });
    } catch (err) {
      toast.error('Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  };

  // Clock out
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
      toast.success('Clocked Out!', {
        description: `Total: ${data.totalHours} hours`,
      });
    } catch (err) {
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
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {companyName || 'Time Clock'}
            </CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
            <p className="text-3xl font-mono font-bold text-foreground mt-2">
              {currentTime.toLocaleTimeString('en-GB')}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!candidate ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Enter your full name</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Smith"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  autoFocus
                  className="text-center text-lg h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLooking || !candidateName.trim()}>
                {isLooking ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                Find Me
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Candidate info */}
              <div className="bg-accent/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Welcome</p>
                <p className="text-xl font-bold text-foreground">{candidate.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">ID: {candidate.emp_id}</p>
              </div>

              {/* Location status */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {locationLoading ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Getting location...
                  </span>
                ) : locationError ? (
                  <span className="text-destructive">{locationError}</span>
                ) : location?.address ? (
                  <span className="text-muted-foreground truncate">{location.address}</span>
                ) : (
                  <span className="text-muted-foreground">Location unavailable</span>
                )}
              </div>

              {/* Active session info */}
              {activeSession && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    <span className="text-sm font-medium">Clocked in since</span>
                  </div>
                  <p className="text-lg font-mono font-semibold">
                    {new Date(activeSession.clockIn).toLocaleTimeString('en-GB')}
                  </p>
                  {activeSession.clockInAddress && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{activeSession.clockInAddress}</p>
                  )}
                </div>
              )}

              {/* Clock buttons */}
              <div className="grid gap-3">
                {!activeSession ? (
                  <Button
                    onClick={handleClockIn}
                    disabled={isClocking}
                    className="h-16 text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
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
                    className="h-16 text-lg"
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

                <Button variant="outline" onClick={handleReset} className="h-10">
                  Not you? Search again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
