import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CompanyDashboard from "@/pages/dashboard/company-dashboard";
import CreatorDashboard from "@/pages/dashboard/creator-dashboard";
import UploadAd from "@/pages/upload-ad";
import UploadVideo from "@/pages/upload-video";
import { useEffect, useState } from "react";

function Router() {
  const [location, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Auth status:", data);
          setIsAuthenticated(data.isAuthenticated);
          setUserType(data.userType);
          
          // Redirect if authenticated but on home page
          if (data.isAuthenticated && location === '/') {
            if (data.userType === 'company') {
              navigate('/dashboard/company');
            } else if (data.userType === 'creator') {
              navigate('/dashboard/creator');
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserType(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Protected routes */}
      <Route path="/dashboard/company">
        {() => (isAuthenticated && userType === 'company' ? <CompanyDashboard /> : <Home />)}
      </Route>
      <Route path="/dashboard/creator">
        {() => (isAuthenticated && userType === 'creator' ? <CreatorDashboard /> : <Home />)}
      </Route>
      <Route path="/upload-ad">
        {() => (isAuthenticated && userType === 'company' ? <UploadAd /> : <Home />)}
      </Route>
      <Route path="/upload-video">
        {() => (isAuthenticated && userType === 'creator' ? <UploadVideo /> : <Home />)}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
