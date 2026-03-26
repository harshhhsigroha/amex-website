import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomDomainProvider, useCustomDomainContext } from "./contexts/CustomDomainContext";
import PortalChooser from "./pages/PortalChooser";
import Index from "./pages/Index";
import ClientAuth from "./pages/ClientAuth";
import PortalAuth from "./pages/PortalAuth";
import ClientDashboard from "./pages/ClientDashboard";
import PortalDashboard from "./pages/PortalDashboard";
import ResetPassword from "./pages/ResetPassword";
import CandidateOnboarding from "./pages/CandidateOnboarding";
import PayCoreAdmin from "./pages/PayCoreAdmin";
import ClockInOut from "./pages/ClockInOut";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import { LoadingScreen } from "./components/layout/LoadingScreen";


const queryClient = new QueryClient();

/** When on a custom domain, the landing page redirects to the portal login */
function CustomDomainLanding() {
  const { isCustomDomain, domainInfo } = useCustomDomainContext();

  if (isCustomDomain && domainInfo) {
    // On a custom domain, show the portal auth instead of the marketing landing
    return <PortalAuth />;
  }
  return <Landing />;
}

/** Custom domain onboarding — auto-injects clientId */
function CustomDomainOnboarding() {
  const { domainInfo } = useCustomDomainContext();
  // If we're on a custom domain, we already know the clientId
  // The CandidateOnboarding component reads from useParams, but we'll
  // navigate to the correct route. For now, if the URL has no clientId,
  // and we're on a custom domain, we pass it via the route.
  return <CandidateOnboarding />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CustomDomainProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CustomDomainProvider>
    </AuthProvider>
  </QueryClientProvider>
);

function AppRoutes() {
  const { isLoading, isCustomDomain, domainInfo } = useCustomDomainContext();

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<CustomDomainLanding />} />
      {/* PayCore Team management portal */}
      <Route path="/paycore" element={<PayCoreAdmin />} />
      {/* PayCore Clients — Invoice generation tool */}
      <Route path="/ops" element={<Index />} />
      {/* End Users (clients of PayCore clients) */}
      <Route path="/admin" element={<PortalDashboard />} />
      {/* Auth portals */}
      <Route path="/auth/team" element={<TeamAuth />} />
      <Route path="/auth/client" element={<ClientAuth />} />
      <Route path="/auth/portal" element={<PortalAuth />} />
      {/* Legacy /auth → team login */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      {/* Clock-in/out page — public, no auth required */}
      <Route path="/clock/:clientId" element={<ClockInOut />} />
      {/* On custom domains, /onboarding works without clientId */}
      <Route
        path="/onboarding/:clientId"
        element={<CandidateOnboarding />}
      />
      <Route
        path="/onboarding"
        element={<CandidateOnboarding />}
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
