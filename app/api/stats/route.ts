import { NextRequest, NextResponse } from 'next/server';
import pool, { USE_DEMO_MODE } from '@/lib/db';
import { DashboardStats, ChartData } from '@/lib/types';
import { getMockAdsByUserId } from '@/lib/mock-data';

// Type predicate to check if an object is a valid row with numeric values
function isValidStatsRow(row: any): row is Record<string, number> {
  return (
    row &&
    typeof row.totalAds === 'number' &&
    typeof row.activeAds === 'number' &&
    typeof row.totalImpressions === 'number' &&
    typeof row.totalClicks === 'number' &&
    typeof row.totalConversions === 'number' &&
    typeof row.totalCost === 'number'
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Demo mode - calculate stats from mock data
    if (USE_DEMO_MODE) {
      const ads = getMockAdsByUserId(Number(userId));
      
      const totalAds = ads.length;
      const activeAds = ads.filter(ad => ad.status === 'active').length;
      const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
      const totalConversions = ads.reduce((sum, ad) => sum + ad.conversions, 0);
      const totalCost = ads.reduce((sum, ad) => sum + ad.cost, 0);

      const stats: DashboardStats = {
        totalAds,
        activeAds,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalCost,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        costPerClick: totalClicks > 0 ? totalCost / totalClicks : 0,
        costPerConversion: totalConversions > 0 ? totalCost / totalConversions : 0,
      };

      // Generate chart data
      const chartData: ChartData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        chartData.push({
          date: date.toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 10000) + 5000,
          clicks: Math.floor(Math.random() * 500) + 100,
          conversions: Math.floor(Math.random() * 50) + 10,
          cost: Math.floor(Math.random() * 500) + 100,
        });
      }

      return NextResponse.json({ stats, chartData });
    }

    // Database mode
    if (!pool) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Get dashboard stats
      const [statsRows] = await connection.execute(
        `SELECT 
          COUNT(*) as totalAds,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeAds,
          COALESCE(SUM(impressions), 0) as totalImpressions,
          COALESCE(SUM(clicks), 0) as totalClicks,
          COALESCE(SUM(conversions), 0) as totalConversions,
          COALESCE(SUM(cost), 0) as totalCost
         FROM ads
         WHERE user_id = ?`,
        [userId]
      );

      const statsRow = (statsRows as any[])[0];

      if (!isValidStatsRow(statsRow)) {
        throw new Error('Invalid stats data format');
      }

      const stats: DashboardStats = {
        totalAds: statsRow.totalAds,
        activeAds: statsRow.activeAds,
        totalImpressions: statsRow.totalImpressions,
        totalClicks: statsRow.totalClicks,
        totalConversions: statsRow.totalConversions,
        totalCost: Number(statsRow.totalCost),
        ctr: statsRow.totalImpressions > 0 
          ? (statsRow.totalClicks / statsRow.totalImpressions) * 100 
          : 0,
        conversionRate: statsRow.totalClicks > 0 
          ? (statsRow.totalConversions / statsRow.totalClicks) * 100 
          : 0,
        costPerClick: statsRow.totalClicks > 0 
          ? statsRow.totalCost / statsRow.totalClicks 
          : 0,
        costPerConversion: statsRow.totalConversions > 0 
          ? statsRow.totalCost / statsRow.totalConversions 
          : 0,
      };

      // Get chart data for last 30 days (mock data for demo)
      const chartData: ChartData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        chartData.push({
          date: date.toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 10000) + 5000,
          clicks: Math.floor(Math.random() * 500) + 100,
          conversions: Math.floor(Math.random() * 50) + 10,
          cost: Math.floor(Math.random() * 500) + 100,
        });
      }

      return NextResponse.json({
        stats,
        chartData,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
