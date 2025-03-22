import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@shared/schema";

import { 
  Home, Upload, BarChart2, Settings, HelpCircle, LogOut, Bell, Mail,
  Plus, Edit, Trash2, PlayCircle, Building
} from "lucide-react";

export default function CompanyDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get user info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Get campaigns
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  // Get analytics summary
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['/api/analytics/summary'],
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

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      return await apiRequest("DELETE", `/api/campaigns/${campaignId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast.success({
        title: "Campaign Deleted",
        description: "The campaign has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete campaign.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteCampaign = (campaignId: number) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  const isLoading = isUserLoading || isCampaignsLoading || isAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="font-bold">{user?.fullName?.substring(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-xs text-gray-400">Company Account</div>
              </div>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/company">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md bg-primary/20 text-white">
                    <Home size={18} />
                    <span>Dashboard</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/campaigns">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-primary/10 text-gray-300 hover:text-white">
                    <Building size={18} />
                    <span>Ad Campaigns</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/upload-ad">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-primary/10 text-gray-300 hover:text-white">
                    <Upload size={18} />
                    <span>Upload Ads</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/analytics">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-primary/10 text-gray-300 hover:text-white">
                    <BarChart2 size={18} />
                    <span>Analytics</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-primary/10 text-gray-300 hover:text-white">
                    <Settings size={18} />
                    <span>Settings</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-primary/10 text-gray-300 hover:text-white">
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
            <h1 className="text-2xl font-bold">Company Dashboard</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Active Campaigns</h3>
                  <div className="text-blue-500 bg-blue-100 p-2 rounded-full">
                    <Building size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{analytics?.activeCampaigns || 0}</div>
                <div className="text-sm text-green-500 flex items-center mt-2">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  <span>{analytics?.campaignGrowth || 0}% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Ad Views</h3>
                  <div className="text-green-500 bg-green-100 p-2 rounded-full">
                    <PlayCircle size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold">{formatNumber(analytics?.totalViews || 0)}</div>
                <div className="text-sm text-green-500 flex items-center mt-2">
                  <ArrowUp className="mr-1 h-4 w-4" />
                  <span>{analytics?.viewsGrowth || 0}% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-500">Budget Used</h3>
                  <div className="text-purple-500 bg-purple-100 p-2 rounded-full">
                    <span className="text-lg font-bold">$</span>
                  </div>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(analytics?.budgetUsed || 0)}</div>
                <div className="text-sm text-gray-500 flex items-center mt-2">
                  <span>{analytics?.budgetPercentage || 0}% of monthly budget</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Campaigns */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Campaigns</h2>
                <Link href="/campaigns/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns && campaigns.length > 0 ? (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 mr-3">
                                <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-500">
                                  <Building size={20} />
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{campaign.name}</div>
                                <div className="text-sm text-gray-500">Created on {formatDate(campaign.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              campaign.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : campaign.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{formatNumber(campaign.views || 0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{formatCurrency(Number(campaign.spent))}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Progress value={campaign.performance || 0} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">{campaign.performance || 0}% CTR</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No active campaigns found. Create a new campaign to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Upload New Ad */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Upload New Ad</h2>
              
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Upload size={24} />
                </div>
                <h3 className="text-lg font-medium mb-2">Drag and drop your ad video</h3>
                <p className="text-gray-500 mb-4">or</p>
                <Link href="/upload-ad">
                  <Button>
                    Browse Files
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">Supported formats: MP4, MOV, AVI (Max 100MB)</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
