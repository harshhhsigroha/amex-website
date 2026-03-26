import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomDomainInfo {
  clientId: string;
  brandName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  hidePoweredBy: boolean;
}

interface CustomDomainContextValue {
  isLoading: boolean;
  isCustomDomain: boolean;
  domainInfo: CustomDomainInfo | null;
}

const CustomDomainContext = createContext<CustomDomainContextValue>({
  isLoading: true,
  isCustomDomain: false,
  domainInfo: null,
});

export const useCustomDomainContext = () => useContext(CustomDomainContext);

function isLovableHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.includes('localhost') ||
    hostname.endsWith('.lovable.app') ||
    hostname.endsWith('.lovableproject.com') ||
    hostname.endsWith('.webcontainer.io')
  );
}

/** Convert hex colour to HSL string for CSS variables */
function hexToHsl(hex: string): string | null {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyBrandingVars(primary: string | null) {
  const root = document.documentElement;
  if (primary) {
    const hsl = hexToHsl(primary);
    if (hsl) {
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
      root.style.setProperty('--sidebar-primary', hsl);
      root.style.setProperty('--sidebar-ring', hsl);
      return;
    }
  }
  root.style.removeProperty('--primary');
  root.style.removeProperty('--ring');
  root.style.removeProperty('--sidebar-primary');
  root.style.removeProperty('--sidebar-ring');
}

export function CustomDomainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomDomainContextValue>({
    isLoading: true,
    isCustomDomain: false,
    domainInfo: null,
  });

  useEffect(() => {
    const hostname = window.location.hostname;

    if (isLovableHost(hostname)) {
      setState({ isLoading: false, isCustomDomain: false, domainInfo: null });
      return;
    }

    // Look up the custom domain in the database
    supabase
      .from('client_white_label')
      .select('client_id, brand_name, logo_url, primary_color, secondary_color, hide_powered_by')
      .eq('enabled', true)
      .or(`custom_domain.eq.${hostname},custom_domain.eq.www.${hostname}`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const info: CustomDomainInfo = {
            clientId: data.client_id,
            brandName: data.brand_name,
            logoUrl: data.logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            hidePoweredBy: data.hide_powered_by,
          };
          // Apply branding CSS variables immediately
          applyBrandingVars(info.primaryColor);
          setState({ isLoading: false, isCustomDomain: true, domainInfo: info });
        } else {
          setState({ isLoading: false, isCustomDomain: false, domainInfo: null });
        }
      });

    return () => {
      applyBrandingVars(null);
    };
  }, []);

  return (
    <CustomDomainContext.Provider value={state}>
      {children}
    </CustomDomainContext.Provider>
  );
}
