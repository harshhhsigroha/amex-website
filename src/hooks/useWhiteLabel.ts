import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhiteLabelConfig {
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  enabled: boolean;
  hide_powered_by: boolean;
}

/** Convert a hex colour (#rrggbb or #rgb) to HSL string "H S% L%" */
function hexToHsl(hex: string): string | null {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
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
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Apply white-label CSS variables to :root so Tailwind tokens pick them up */
function applyWhiteLabelVars(primary: string | null) {
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
  // Reset to defaults
  root.style.removeProperty('--primary');
  root.style.removeProperty('--ring');
  root.style.removeProperty('--sidebar-primary');
  root.style.removeProperty('--sidebar-ring');
}

export function useWhiteLabel(clientId: string | null) {
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig | null>(null);

  useEffect(() => {
    if (!clientId) {
      applyWhiteLabelVars(null);
      return;
    }

    supabase
      .from('client_white_label')
      .select('brand_name, logo_url, primary_color, secondary_color, enabled, hide_powered_by')
      .eq('client_id', clientId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.enabled) {
          setWhiteLabel(data as WhiteLabelConfig);
          applyWhiteLabelVars(data.primary_color);
        } else {
          setWhiteLabel(null);
          applyWhiteLabelVars(null);
        }
      });

    return () => {
      applyWhiteLabelVars(null);
    };
  }, [clientId]);

  return { whiteLabel };
}
