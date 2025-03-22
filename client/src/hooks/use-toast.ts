import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastOriginal,
  ToastActionProps,
} from "@/components/ui/use-toast";

export type ToasterToast = ReturnType<typeof useToast>["toast"];

type ToastOptions = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

export function useToast() {
  const { toast, ...rest } = useToastOriginal();

  const success = (options: ToastOptions) => {
    return toast({
      title: options.title || "Success",
      description: options.description,
      action: options.action,
      variant: "default",
    });
  };

  const error = (options: ToastOptions) => {
    return toast({
      title: options.title || "Error",
      description: options.description,
      action: options.action,
      variant: "destructive",
    });
  };

  const info = (options: ToastOptions) => {
    return toast({
      title: options.title || "Information",
      description: options.description,
      action: options.action,
      variant: "default",
    });
  };

  return {
    toast,
    success,
    error,
    info,
    ...rest,
  };
}
