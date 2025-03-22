import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, User, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { z } from "zod";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  initialUserType: 'company' | 'individual' | null;
}

type RegisterFormValues = z.infer<typeof registerUserSchema>;

export default function RegisterModal({ isOpen, onClose, onLoginClick, initialUserType }: RegisterModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'company' | 'individual'>(initialUserType || 'individual');
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      userType: initialUserType || "individual",
    },
  });

  // Update form value when userType changes
  useEffect(() => {
    setValue("userType", userType);
  }, [userType, setValue]);

  // Update userType when initialUserType changes
  useEffect(() => {
    if (initialUserType) {
      setUserType(initialUserType);
      setValue("userType", initialUserType);
    }
  }, [initialUserType, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!termsAccepted) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", data);

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });

      // Auto login user after registration
      const loginData = {
        email: data.email,
        password: data.password
      };

      const loginRes = await apiRequest("POST", "/api/auth/login", loginData);
      const userData = await loginRes.json();

      // Redirect based on user type
      if (userData.userType === "company") {
        navigate("/dashboard/company");
      } else {
        navigate("/dashboard/creator");
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">I am a:</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button"
              variant="outline"
              className={`border-2 p-4 rounded-md text-center flex flex-col items-center h-auto ${
                userType === 'company' ? 'border-green-500 bg-green-50' : ''
              }`}
              onClick={() => setUserType('company')}
            >
              <Building className="h-6 w-6 text-green-500 mb-2" />
              <span className="font-medium">Company</span>
            </Button>
            <Button 
              type="button"
              variant="outline"
              className={`border-2 p-4 rounded-md text-center flex flex-col items-center h-auto ${
                userType === 'individual' ? 'border-amber-500 bg-amber-50' : ''
              }`}
              onClick={() => setUserType('individual')}
            >
              <User className="h-6 w-6 text-amber-500 mb-2" />
              <span className="font-medium">Creator</span>
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</Label>
            <Input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="password" className="block text-gray-700 font-medium mb-2">Create Password</Label>
            <Input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long.</p>
          </div>

          <div className="mb-6">
            <Label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <div className="mb-6 flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className={`w-full ${userType === 'company' ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p>Already have an account? <Button variant="link" className="p-0" onClick={onLoginClick}>Log in</Button></p>
        </div>
      </div>
    </div>
  );
}
