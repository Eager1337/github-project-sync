import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/** Loads Google Analytics with the configured measurement ID and tracks route changes. */
const AnalyticsProvider = () => {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ga_measurement_id')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) initAnalytics(data?.value ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsProvider;
