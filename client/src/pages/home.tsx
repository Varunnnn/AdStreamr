import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import LandingPage from '@/components/landing-page';
import { useLocation } from 'wouter';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUserType(data.userType);
          
          // Redirect based on user type
          if (data.userType === 'company') {
            navigate('/dashboard/company');
          } else if (data.userType === 'individual') {
            navigate('/dashboard/creator');
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Logging out function
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setIsAuthenticated(false);
      setUserType(null);
      toast.success({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error({
        title: 'Error',
        description: 'Could not log out. Please try again.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <LandingPage />;
}
