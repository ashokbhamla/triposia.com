import { NextRequest, NextResponse } from 'next/server';
import { getAllAirports } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const airports = await getAllAirports();
    return NextResponse.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports' },
      { status: 500 }
    );
  }
}

