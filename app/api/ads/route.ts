import { NextRequest, NextResponse } from 'next/server';
import pool, { USE_DEMO_MODE } from '@/lib/db';
import { Ad, AdInput } from '@/lib/types';
import { getMockAdsByUserId, addMockAd } from '@/lib/mock-data';

// GET all ads
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

    // Demo mode - use mock data
    if (USE_DEMO_MODE) {
      const ads = getMockAdsByUserId(Number(userId));
      return NextResponse.json({ ads });
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
      const [rows] = await connection.execute(
        'SELECT * FROM ads WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return NextResponse.json({ ads: rows as Ad[] });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new ad
export async function POST(request: NextRequest) {
  try {
    const adData: AdInput = await request.json();

    const {
      user_id,
      campaign_name,
      platform,
      ad_type,
      budget,
      target_audience,
      start_date,
      end_date,
      status = 'draft',
    } = adData;

    if (!user_id || !campaign_name || !platform || !ad_type || !budget || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Demo mode - use mock data
    if (USE_DEMO_MODE) {
      const adId = addMockAd({
        user_id,
        campaign_name,
        platform,
        ad_type,
        budget,
        target_audience,
        start_date,
        end_date,
        status,
      });

      return NextResponse.json(
        {
          message: 'Ad created successfully (Demo Mode)',
          adId,
        },
        { status: 201 }
      );
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
      const [result] = await connection.execute(
        `INSERT INTO ads (user_id, campaign_name, platform, ad_type, budget, target_audience, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, campaign_name, platform, ad_type, budget, target_audience, start_date, end_date || null, status]
      );

      return NextResponse.json(
        {
          message: 'Ad created successfully',
          adId: (result as any).insertId,
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
