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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema } from "@shared/schema";
import { z } from "zod";
import { Upload, ArrowLeft, ArrowRight, ArrowDown, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Extended schema for the form
const uploadVideoSchema = insertVideoSchema.extend({
  file: z.instanceof(File).optional(),
});

type UploadVideoFormValues = z.infer<typeof uploadVideoSchema>;

export default function UploadVideo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adPlacement, setAdPlacement] = useState<string>("pre-roll");
  
  // Get user info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<UploadVideoFormValues>({
    resolver: zodResolver(uploadVideoSchema),
    defaultValues: {
      userId: 0,
      title: "",
      description: "",
      category: "",
      rawFilePath: "",
      status: "uploaded",
      adPlacement: "pre-roll",
      adPreferences: { allowedTypes: ["any"] }
    }
  });

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await fetch('/api/videos/upload', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast.success({
        title: "Video Uploaded",
        description: "Your video has been successfully uploaded and is being processed.",
      });
      navigate("/dashboard/creator");
    },
    onError: (error) => {
      toast.error({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your video.",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        toast.error({
          title: "File Too Large",
          description: "The maximum file size is 2GB.",
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

  const handleAdPlacementChange = (value: string) => {
    setAdPlacement(value);
    setValue("adPlacement", value);
  };

  const onSubmit = async (data: UploadVideoFormValues) => {
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
        description: "Please log in to upload a video.",
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
      formData.append('category', data.category || "");
      formData.append('userId', user.id.toString());
      formData.append('adPlacement', data.adPlacement);
      formData.append('adPreferences', JSON.stringify(data.adPreferences));
      
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

      await uploadVideoMutation.mutateAsync(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUserLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
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
            onClick={() => navigate("/dashboard/creator")}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Upload New Video</h1>
          <p className="text-gray-600">Upload your video and choose ad placement preferences</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <div 
                  className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('videoFile')?.click()}
                >
                  <input
                    type="file"
                    id="videoFile"
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
                      <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                        <Upload size={24} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Drag and drop your video</h3>
                      <p className="text-gray-500 mb-4">or</p>
                      <Button type="button" className="bg-amber-500 hover:bg-amber-600">
                        Browse Files
                      </Button>
                      <p className="text-sm text-gray-500 mt-4">Supported formats: MP4, MOV, AVI (Max 2GB)</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="block text-gray-700 font-medium mb-2">Video Title</Label>
                  <Input
                    id="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter video title"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</Label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="Gaming">Gaming</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</Label>
                  <Textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter video description"
                    rows={3}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <Label className="block text-gray-700 font-medium mb-2">Ad Preferences</Label>
                <Controller
                  control={control}
                  name="adPreferences"
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange({ allowedTypes: [value] })}
                      value={field.value?.allowedTypes?.[0] || "any"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ad preferences" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any relevant ads</SelectItem>
                        <SelectItem value="tech">Tech products only</SelectItem>
                        <SelectItem value="education">Educational content only</SelectItem>
                        <SelectItem value="no-competitors">No competitor ads</SelectItem>
                        <SelectItem value="custom">Custom preferences</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <Label className="block text-gray-700 font-medium mb-2">Ad Placement</Label>
                <Controller
                  control={control}
                  name="adPlacement"
                  render={({ field }) => (
                    <RadioGroup
                      className="grid grid-cols-3 gap-4"
                      value={field.value}
                      onValueChange={(value) => handleAdPlacementChange(value)}
                    >
                      <div className={`border rounded-md p-4 flex flex-col items-center hover:border-amber-500 cursor-pointer ${adPlacement === 'pre-roll' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'}`}>
                        <div className="h-2 w-full bg-amber-500/50 mb-4 rounded"></div>
                        <RadioGroupItem value="pre-roll" id="pre-roll" className="sr-only" />
                        <Label htmlFor="pre-roll" className="mb-2 text-sm cursor-pointer">Pre-roll</Label>
                        <ArrowRight className="text-2xl text-amber-500" />
                      </div>
                      <div className={`border rounded-md p-4 flex flex-col items-center hover:border-amber-500 cursor-pointer ${adPlacement === 'mid-roll' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'}`}>
                        <div className="h-2 w-full mb-4 rounded"></div>
                        <div className="h-2 w-full bg-amber-500/50 mb-4 rounded"></div>
                        <RadioGroupItem value="mid-roll" id="mid-roll" className="sr-only" />
                        <Label htmlFor="mid-roll" className="mb-2 text-sm cursor-pointer">Mid-roll</Label>
                        <ArrowDown className="text-2xl text-amber-500" />
                      </div>
                      <div className={`border rounded-md p-4 flex flex-col items-center hover:border-amber-500 cursor-pointer ${adPlacement === 'post-roll' ? 'border-amber-500 bg-amber-50' : 'border-gray-300'}`}>
                        <div className="h-2 w-full mb-4 rounded"></div>
                        <div className="h-2 w-full bg-amber-500/50 rounded"></div>
                        <RadioGroupItem value="post-roll" id="post-roll" className="sr-only" />
                        <Label htmlFor="post-roll" className="mb-2 text-sm cursor-pointer">Post-roll</Label>
                        <ArrowLeft className="text-2xl text-amber-500" />
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-4"
                  onClick={() => navigate("/dashboard/creator")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? `Uploading (${uploadProgress}%)` : "Upload & Process"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
