import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomDomainProvider, useCustomDomainContext } from "./contexts/CustomDomainContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import ClientAuth from "./pages/ClientAuth";
import PortalAuth from "./pages/PortalAuth";
import ClientDashboard from "./pages/ClientDashboard";
import PortalDashboard from "./pages/PortalDashboard";
import ResetPassword from "./pages/ResetPassword";
import CandidateOnboarding from "./pages/CandidateOnboarding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Process from "./pages/Process";
import EmploymentStatus from "./pages/services/EmploymentStatus";
import PayrollServices from "./pages/services/PayrollServices";
import HRServices from "./pages/services/HRServices";
import Construction from "./pages/industries/Construction";
import Healthcare from "./pages/industries/Healthcare";
import Hospitality from "./pages/industries/Hospitality";

import ClockInOut from "./pages/ClockInOut";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { LoadingScreen } from "./components/layout/LoadingScreen";

const queryClient = new QueryClient();

/** When on a custom domain, show portal auth; otherwise show the portal chooser */
function CustomDomainHome() {
  const { isCustomDomain, domainInfo } = useCustomDomainContext();

  if (isCustomDomain && domainInfo) {
    return <PortalAuth />;
  }
  return <Landing />;
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
  const { isLoading } = useCustomDomainContext();

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<CustomDomainHome />} />
      
      <Route path="/admin" element={<Index />} />
      <Route path="/client" element={<PortalDashboard />} />
      <Route path="/auth/client" element={<ClientAuth />} />
      <Route path="/auth/portal" element={<PortalAuth />} />
      <Route path="/auth" element={<ClientAuth />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/clock/:clientId" element={<ClockInOut />} />
      <Route path="/onboarding/:clientId" element={<CandidateOnboarding />} />
      <Route path="/onboarding" element={<CandidateOnboarding />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/process" element={<Process />} />
      <Route path="/services/employment-status" element={<EmploymentStatus />} />
      <Route path="/services/payroll-services" element={<PayrollServices />} />
      <Route path="/services/hr-services" element={<HRServices />} />
      <Route path="/industries/construction" element={<Construction />} />
      <Route path="/industries/healthcare" element={<Healthcare />} />
      <Route path="/industries/hospitality" element={<Hospitality />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
