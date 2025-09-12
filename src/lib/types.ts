export interface Campaign {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'google';
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  targetAudience: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
}

export interface Recommendation {
  id: string;
  type: 'budget' | 'audience' | 'creative' | 'timing' | 'bidding';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'complex';
  estimatedImprovement: string;
}

export interface CampaignMetrics {
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  roas: number; // Return on ad spend
  conversionRate: number;
}

export interface Feedback {
  id: string;
  campaignId: string;
  rating: number;
  comment: string;
  category: 'usability' | 'recommendations' | 'features' | 'general';
  createdAt: string;
}

export interface DashboardData {
  totalSpent: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  averageCPC: number;
  activeCampaigns: number;
  campaignsByPlatform: {
    facebook: number;
    instagram: number;
    google: number;
  };
}