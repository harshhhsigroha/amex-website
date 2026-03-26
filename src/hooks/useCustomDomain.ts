import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomDomainInfo {
  clientId: string;
  brandName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  hidePoweredBy: boolean;
}

/** Known Lovable / preview hostnames — not custom domains */
function isLovableHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.lovable.app') ||
    hostname.endsWith('.lovableproject.com') ||
    hostname.endsWith('.webcontainer.io')
  );
}

/**
 * Detects if the app is running on a custom domain and resolves
 * the owning client's white-label configuration.
 *
 * Returns `null` while loading, `false` if not a custom domain,
 * or the `CustomDomainInfo` if matched.
 */
export function useCustomDomain() {
  const [result, setResult] = useState<CustomDomainInfo | false | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;

    if (isLovableHost(hostname)) {
      setResult(false);
      return;
    }

    // Query the white-label table for a matching custom_domain
    supabase
      .from('client_white_label')
      .select('client_id, brand_name, logo_url, primary_color, secondary_color, hide_powered_by')
      .eq('enabled', true)
      .or(`custom_domain.eq.${hostname},custom_domain.eq.www.${hostname}`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setResult({
            clientId: data.client_id,
            brandName: data.brand_name,
            logoUrl: data.logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            hidePoweredBy: data.hide_powered_by,
          });
        } else {
          setResult(false);
        }
      });
  }, []);

  return {
    /** Still loading */
    isLoading: result === null,
    /** True when on a recognized custom domain */
    isCustomDomain: result !== null && result !== false,
    /** Client info, or null */
    domainInfo: typeof result === 'object' && result !== null ? result : null,
  };
}
