import { NextRequest, NextResponse } from 'next/server';
import { getFlightsByRoute } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { origin: string; destination: string } }
) {
  try {
    const origin = params.origin.toUpperCase();
    const destination = params.destination.toUpperCase();
    
    const flights = await getFlightsByRoute(origin, destination);
    
    return NextResponse.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

