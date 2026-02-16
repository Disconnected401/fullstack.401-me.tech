import bcrypt from 'bcryptjs';
import { User, Ad } from './types';

// Mock users data
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@adreport.com',
    password: '$2b$10$.8DYPZxgvPDwu8tqjz4FAudqsvECMymzQ2awDc/ooq3TEa4ft9Clu', // demo123
    created_at: new Date('2026-01-01'),
  },
];

// Mock ads data
export const mockAds: Ad[] = [
  {
    id: 1,
    user_id: 1,
    campaign_name: 'Summer Sale 2026',
    platform: 'Facebook',
    ad_type: 'Image',
    budget: 5000.00,
    target_audience: 'Age 25-40, Interested in fashion',
    start_date: '2026-06-01',
    end_date: null,
    status: 'active',
    impressions: 125000,
    clicks: 3250,
    conversions: 180,
    cost: 2150.00,
    created_at: new Date('2026-01-15'),
    updated_at: new Date('2026-02-10'),
  },
  {
    id: 2,
    user_id: 1,
    campaign_name: 'Tech Launch',
    platform: 'Google',
    ad_type: 'Video',
    budget: 10000.00,
    target_audience: 'Tech enthusiasts, Age 20-35',
    start_date: '2026-02-01',
    end_date: null,
    status: 'active',
    impressions: 250000,
    clicks: 8500,
    conversions: 420,
    cost: 4800.00,
    created_at: new Date('2026-01-20'),
    updated_at: new Date('2026-02-12'),
  },
  {
    id: 3,
    user_id: 1,
    campaign_name: 'Holiday Special',
    platform: 'Instagram',
    ad_type: 'Carousel',
    budget: 3000.00,
    target_audience: 'Parents, Age 30-50',
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    status: 'completed',
    impressions: 98000,
    clicks: 2100,
    conversions: 95,
    cost: 1850.00,
    created_at: new Date('2025-11-15'),
    updated_at: new Date('2025-12-31'),
  },
];

// In-memory store for new ads (only used in demo mode)
export const inMemoryAds: Ad[] = [...mockAds];
let nextAdId = 4;

export function addMockAd(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'conversions' | 'cost'>): number {
  const newAd: Ad = {
    ...ad,
    id: nextAdId++,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cost: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };
  inMemoryAds.push(newAd);
  return newAd.id;
}

export function getMockUserByUsername(username: string): User | undefined {
  return mockUsers.find(u => u.username === username);
}

export function getMockAdsByUserId(userId: number): Ad[] {
  return inMemoryAds.filter(ad => ad.user_id === userId);
}
