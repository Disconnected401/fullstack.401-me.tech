// TypeScript types for database models

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
}

export type UserInput = Omit<User, 'id' | 'created_at'>;

export interface Ad {
  id: number;
  user_id: number;
  campaign_name: string;
  platform: 'Facebook' | 'Google' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Twitter';
  ad_type: 'Image' | 'Video' | 'Carousel' | 'Text' | 'Story';
  budget: number;
  target_audience: string;
  start_date: string;
  end_date?: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  created_at: Date;
  updated_at: Date;
}

export type AdInput = Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'conversions' | 'cost'>;

export type AdUpdate = Partial<AdInput> & { id: number };

export interface AdAnalytics {
  id: number;
  ad_id: number;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

export type AdAnalyticsInput = Omit<AdAnalytics, 'id'>;

// Stats types
export interface DashboardStats {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalCost: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  costPerClick: number;
  costPerConversion: number;
}

export interface ChartData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}
