import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortalChooser() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to AMEX Outsourcing</h1>
          <p className="text-muted-foreground">Select your portal to sign in</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
            onClick={() => navigate('/auth/client')}
          >
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Admin Portal</CardTitle>
                <CardDescription className="text-xs">
                  For AMEX Outsourcing administrators
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
            onClick={() => navigate('/auth/portal')}
          >
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Client Portal</CardTitle>
                <CardDescription className="text-xs">
                  For end-users & candidates
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
