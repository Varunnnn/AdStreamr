import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LoginInput, RegisterInput, CompanyRegisterInput, CreatorRegisterInput } from "@shared/schema";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: "company" | "creator";
  profile: any;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput & { role: "company" | "creator", companyName?: string, industry?: string, channelName?: string, category?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isCompany: () => boolean;
  isCreator: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  const { data, error, isLoading, isFetched } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    throwOnError: false,
  });
  
  useEffect(() => {
    if (isFetched) {
      if (data) {
        setUser({
          ...data.user,
          profile: data.profile
        });
      } else {
        setUser(null);
      }
    }
  }, [data, isFetched]);
  
  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginInput) => {
      return apiRequest('POST', '/api/auth/login', loginData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });
  
  const registerMutation = useMutation({
    mutationFn: async (registerData: RegisterInput & { role: "company" | "creator", companyName?: string, industry?: string, channelName?: string, category?: string }) => {
      const { role, ...userData } = registerData;
      let endpoint = '/api/auth/register/';
      
      if (role === "company") {
        endpoint += "company";
        return apiRequest('POST', endpoint, userData as CompanyRegisterInput);
      } else {
        endpoint += "creator";
        return apiRequest('POST', endpoint, userData as CreatorRegisterInput);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.clear();
      setUser(null);
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Logout failed",
        variant: "destructive",
      });
    },
  });
  
  // Redirect based on authentication state
  useEffect(() => {
    if (isFetched) {
      // If user is logged in and tries to access login/register pages
      if (user && ['/login', '/register'].includes(location)) {
        if (user.role === 'company') {
          navigate('/company/dashboard');
        } else if (user.role === 'creator') {
          navigate('/creator/dashboard');
        }
      }
      
      // If user is not logged in but tries to access protected routes
      if (!user && !isLoading) {
        if (location.startsWith('/company/') || location.startsWith('/creator/')) {
          navigate('/login');
          toast({
            title: "Authentication required",
            description: "Please log in to access this page.",
            variant: "default",
          });
        }
      }
      
      // If company tries to access creator routes or vice versa
      if (user) {
        if (user.role === 'company' && location.startsWith('/creator/')) {
          navigate('/company/dashboard');
          toast({
            title: "Access denied",
            description: "You don't have permission to access creator pages.",
            variant: "destructive",
          });
        } else if (user.role === 'creator' && location.startsWith('/company/')) {
          navigate('/creator/dashboard');
          toast({
            title: "Access denied",
            description: "You don't have permission to access company pages.",
            variant: "destructive",
          });
        }
      }
    }
  }, [user, isLoading, isFetched, location]);
  
  const login = async (loginData: LoginInput) => {
    await loginMutation.mutateAsync(loginData);
  };
  
  const register = async (registerData: RegisterInput & { role: "company" | "creator", companyName?: string, industry?: string, channelName?: string, category?: string }) => {
    await registerMutation.mutateAsync(registerData);
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const isCompany = () => user?.role === 'company';
  const isCreator = () => user?.role === 'creator';
  
  return (
    <AuthContext.Provider value={{
      user,
      loading: isLoading,
      error: error as Error,
      login,
      register,
      logout,
      isCompany,
      isCreator
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
