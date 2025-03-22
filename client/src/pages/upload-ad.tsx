import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "@shared/schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAdSchema } from "@shared/schema";
import { z } from "zod";
import { Upload, ArrowLeft } from "lucide-react";

// Extended schema for the form
const uploadAdSchema = insertAdSchema.extend({
  file: z.instanceof(File).optional(),
});

type UploadAdFormValues = z.infer<typeof uploadAdSchema>;

export default function UploadAd() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get user info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Get campaigns for dropdown
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const { control, register, handleSubmit, formState: { errors } } = useForm<UploadAdFormValues>({
    resolver: zodResolver(uploadAdSchema),
    defaultValues: {
      userId: 0,
      title: "",
      description: "",
      campaignId: 0,
      filePath: "",
      duration: 0,
      status: "pending",
    }
  });

  // Upload ad mutation
  const uploadAdMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await fetch('/api/ads/upload', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast.success({
        title: "Ad Uploaded",
        description: "Your ad has been successfully uploaded and is now pending review.",
      });
      navigate("/dashboard/company");
    },
    onError: (error) => {
      toast.error({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your ad.",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error({
          title: "File Too Large",
          description: "The maximum file size is 100MB.",
        });
        return;
      }
      
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        toast.error({
          title: "Invalid File Type",
          description: "Only MP4, MOV, and AVI files are supported.",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: UploadAdFormValues) => {
    if (!selectedFile) {
      toast.error({
        title: "No File Selected",
        description: "Please select a video file to upload.",
      });
      return;
    }

    if (!user) {
      toast.error({
        title: "Not Authenticated",
        description: "Please log in to upload an ad.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', data.title);
      formData.append('description', data.description || "");
      formData.append('campaignId', data.campaignId?.toString() || "0");
      formData.append('userId', user.id.toString());
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      await uploadAdMutation.mutateAsync(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUserLoading || isCampaignsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2" 
            onClick={() => navigate("/dashboard/company")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Upload New Ad</h1>
          <p className="text-gray-600">Upload your ad video to be placed in creator content</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <div 
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('adVideo')?.click()}
                >
                  <input
                    type="file"
                    id="adVideo"
                    className="hidden"
                    accept="video/mp4,video/quicktime,video/x-msvideo"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile ? (
                    <div>
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <Upload size={24} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Drag and drop your ad video</h3>
                      <p className="text-gray-500 mb-4">or</p>
                      <Button type="button">
                        Browse Files
                      </Button>
                      <p className="text-sm text-gray-500 mt-4">Supported formats: MP4, MOV, AVI (Max 100MB)</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="block text-gray-700 font-medium mb-2">Ad Title</Label>
                  <Input
                    id="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter ad title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="campaignId" className="block text-gray-700 font-medium mb-2">Campaign</Label>
                  <Controller
                    control={control}
                    name="campaignId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns && campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">+ Create new campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.campaignId && (
                    <p className="text-red-500 text-sm mt-1">{errors.campaignId.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</Label>
                  <Textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter ad description"
                    rows={3}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-4"
                  onClick={() => navigate("/dashboard/company")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? `Uploading (${uploadProgress}%)` : "Submit Ad"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
