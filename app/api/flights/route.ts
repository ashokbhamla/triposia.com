import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Route } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection<any>('routes');
    const routes = await collection.find({}).limit(1000).toArray();
    const mappedRoutes: Route[] = routes.map(route => ({
      _id: route._id,
      origin_iata: route.origin_iata,
      destination_iata: route.destination_iata,
      destination_city: route.destination_city,
      flights_per_day: route.flights_per_day,
      has_flight_data: route.has_flight_data || false,
    }));
    return NextResponse.json(mappedRoutes);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

