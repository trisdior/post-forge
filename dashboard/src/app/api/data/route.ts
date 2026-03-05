import { readBusinessData } from '@/lib/dataReader';
import { NextResponse } from 'next/server';
import { BusinessData } from '@/lib/types';

export async function GET() {
  try {
    const data = await readBusinessData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading business data:', error);
    return NextResponse.json({
      valencia: {
        status: 'In Progress',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Get 1st consultation (Feb 28)',
      },
      trovva: {
        status: 'Pre-Launch',
        followers: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: 'Launch Monday, March 1',
        launchDate: 'March 1, 2026',
      },
      delvrai: {
        status: 'Planning',
        clients: 0,
        revenue: 0,
        progressPercent: 0,
        nextMilestone: '10 clients by April',
      },
      totalFollowers: 0,
      totalRevenue: 0,
      targetMonthly: 25000,
    });
  }
}
