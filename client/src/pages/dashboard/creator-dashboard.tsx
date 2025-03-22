import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatNumber, formatTimeAgo, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@shared/schema";

import { 
  Home, Upload, BarChart2, Settings, HelpCircle, LogOut, Bell, Mail,
  Download, Eye, ChartLine, MoreVertical, Loader2, Play, PlayCircle, User, DollarSign
} from "lucide-react";

export default function CreatorDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get user info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Get videos
  const { data: videos, isLoading: isVideosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Get analytics summary
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['/api/analytics/creator/summary'],
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast.success({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast.error({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "An error occurred during logout.",
      });
    },
  });

  // Download video mutation
  const downloadVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest("GET", `/api/videos/${videoId}/download`, {});
    },
    onSuccess: (data) => {
      // This would typically trigger a file download
      toast.success({
        title: "Download Started",
        description: "Your video is being downloaded.",
      });
    },
    onError: (error) => {
      toast.error({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download video.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDownloadVideo = (videoId: number) => {
    downloadVideoMutation.mutate(videoId);
  };

  const isLoading = isUserLoading || isVideosLoading || isAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <div className="text-xl font-bold mb-6 flex items-center">
            <PlayCircle className="mr-2" />
            AdVidly
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="font-bold">{user?.fullName?.substring(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-xs text-gray-400">Creator Account</div>
              </div>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/creator">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md bg-amber-500/20 text-white">
                    <Home size={18} />
                    <span>Dashboard</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/videos">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <Play size={18} />
                    <span>My Videos</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/upload-video">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <Upload size={18} />
                    <span>Upload Video</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/analytics">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <BarChart2 size={18} />
                    <span>Analytics</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/earnings">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <DollarSign size={18} />
                    <span>Earnings</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <Settings size={18} />
                    <span>Settings</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-amber-500/10 text-gray-300 hover:text-white">
                    <HelpCircle size={18} />
                    <span>Help & Support</span>
                  </a>
                </Link>
              </li>
              <li className="pt-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-red-500/10 text-gray-300 hover:text-red-500"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Creator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Mail size={20} />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Total Videos</h3>
                  <div className="text-amber-500 bg-amber-100 p-2 rounded-full">
                    <Play size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{analytics?.totalVideos || 0}</div>
                <div className="text-sm text-green-500 flex items-center mt-2">
                  <span>{analytics?.newVideos || 0} new this month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Total Views</h3>
                  <div className="text-blue-500 bg-blue-100 p-2 rounded-full">
                    <Eye size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{formatNumber(analytics?.totalViews || 0)}</div>
                <div className="text-sm text-green-500 flex items-center mt-2">
                  <span>{analytics?.viewsGrowth || 0}% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Ad Earnings</h3>
                  <div className="text-green-500 bg-green-100 p-2 rounded-full">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">${analytics?.totalEarnings || 0}</div>
                <div className="text-sm text-green-500 flex items-center mt-2">
                  <span>{analytics?.earningsGrowth || 0}% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Processing Videos</h3>
                  <div className="text-purple-500 bg-purple-100 p-2 rounded-full">
                    <Loader2 size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{analytics?.processingVideos || 0}</div>
                <div className="text-sm text-gray-500 flex items-center mt-2">
                  <span>Estimated completion: {analytics?.processingEta || 'calculating...'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Videos */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Videos</h2>
                <Link href="/upload-video">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Video
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos && videos.length > 0 ? (
                  videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                        {video.thumbnailPath ? (
                          <img src={video.thumbnailPath} alt={video.title} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Play size={48} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration || 0)}
                        </div>
                        <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded
                          ${video.status === 'ready' ? 'bg-green-500' : 
                            video.status === 'processing' ? 'bg-yellow-500' :
                            video.status === 'published' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1">{video.title}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>{formatNumber(video.views || 0)} views</span>
                          <span>{formatTimeAgo(video.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {video.adPlacement === 'pre-roll' ? 'Pre-roll ad' :
                             video.adPlacement === 'mid-roll' ? 'Mid-roll ad' :
                             video.adPlacement === 'post-roll' ? 'Post-roll ad' : 'No ads'}
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <ChartLine size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => handleDownloadVideo(video.id)}
                              disabled={video.status !== 'ready' && video.status !== 'published'}
                            >
                              <Download size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <MoreVertical size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    No videos yet. Upload your first video to get started!
                  </div>
                )}
              </div>
              
              {videos && videos.length > 3 && (
                <div className="mt-6 text-center">
                  <Link href="/videos">
                    <a className="text-primary hover:text-blue-700 font-medium">
                      View All Videos <span className="ml-1">→</span>
                    </a>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Upload New Video */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Upload New Video</h2>
              
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                  <Upload size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag and drop your video</h3>
                <p className="text-gray-500 mb-4">or</p>
                <Link href="/upload-video">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Browse Files
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">Supported formats: MP4, MOV, AVI (Max 2GB)</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
