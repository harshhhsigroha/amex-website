import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface RestrictedContentProps {
  message: string;
}

export function RestrictedContent({ message }: RestrictedContentProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="py-12 text-center">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}
