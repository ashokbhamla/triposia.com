import { NextRequest, NextResponse } from 'next/server';
import { getAllAirlines } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const airlines = await getAllAirlines();
    return NextResponse.json(airlines);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airlines' },
      { status: 500 }
    );
  }
}

