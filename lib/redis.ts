import { createClient } from 'redis';

// Redis connection URL from environment or use provided one
const redisUrl = process.env.REDIS_URL || 'redis://default:Wirf7Noq4hOQzhFNm2yhT5nFgqvTpwlc@redis-16470.c1.us-west-2-2.ec2.cloud.redislabs.com:16470';

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let redisClientPromise: Promise<RedisClient> | null = null;

// Create Redis client with connection pooling and error handling
function createRedisClient(): RedisClient {
  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Max reconnection attempts reached');
          return false; // Stop reconnecting
        }
        // Exponential backoff: 50ms, 100ms, 200ms, etc. (max 3s)
        return Math.min(retries * 50, 3000);
      },
      connectTimeout: 10000,
    },
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...');
  });

  return client;
}

// Get or create Redis client (cached for serverless environments)
export function getRedisClient(): Promise<RedisClient> {
  if (redisClient && redisClient.isOpen) {
    return Promise.resolve(redisClient);
  }

  if (redisClientPromise) {
    return redisClientPromise;
  }

  // For serverless environments, cache the connection globally
  if (process.env.NODE_ENV === 'development') {
    let globalWithRedis = global as typeof globalThis & {
      _redisClientPromise?: Promise<RedisClient>;
    };

    if (!globalWithRedis._redisClientPromise) {
      redisClient = createRedisClient();
      globalWithRedis._redisClientPromise = redisClient.connect().catch((error) => {
        console.error('Redis connection error in development:', error);
        globalWithRedis._redisClientPromise = undefined;
        redisClient = null;
        redisClientPromise = null;
        throw error;
      });
    }
    redisClientPromise = globalWithRedis._redisClientPromise;
  } else {
    // In production/serverless, also use global variable to cache connection
    let globalWithRedis = global as typeof globalThis & {
      _redisClientPromise?: Promise<RedisClient>;
    };

    if (!globalWithRedis._redisClientPromise) {
      redisClient = createRedisClient();
      globalWithRedis._redisClientPromise = redisClient.connect().catch((error) => {
        console.error('Redis connection error:', error);
        globalWithRedis._redisClientPromise = undefined;
        redisClient = null;
        redisClientPromise = null;
        throw error;
      });
    }
    redisClientPromise = globalWithRedis._redisClientPromise;
  }

  return redisClientPromise;
}

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    return null; // Fail gracefully - return null so app can fetch from DB
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
    // Fail silently - don't break the app if cache fails
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error);
    // Fail silently
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error(`Redis delete pattern error for pattern ${pattern}:`, error);
    // Fail silently
  }
}

// Cache key generators
export const CacheKeys = {
  airportSummary: (iata: string) => `airport:summary:${iata.toLowerCase()}`,
  airportDetails: (iata: string) => `airport:details:${iata.toLowerCase()}`,
  allAirports: () => 'airports:all',
  airportsByCountry: () => 'airports:by-country',
  route: (origin: string, dest: string) => `route:${origin.toLowerCase()}-${dest.toLowerCase()}`,
  deepRoute: (origin: string, dest: string) => `route:deep:${origin.toLowerCase()}-${dest.toLowerCase()}`,
  destinationData: (origin: string, dest: string) => `destination:${origin.toLowerCase()}-${dest.toLowerCase()}`,
  routesByCountry: () => 'routes:by-country',
  routesFromAirport: (iata: string) => `routes:from:${iata.toLowerCase()}`,
  routesToAirport: (iata: string) => `routes:to:${iata.toLowerCase()}`,
  airline: (code: string) => `airline:${code.toLowerCase()}`,
  allAirlines: () => 'airlines:all',
  airlineRoutes: (code: string) => `airline:routes:${code.toLowerCase()}`,
  flightsByRoute: (origin: string, dest: string) => `flights:${origin.toLowerCase()}-${dest.toLowerCase()}`,
  departures: (iata: string, limit: number) => `departures:${iata.toLowerCase()}:${limit}`,
  arrivals: (iata: string, limit: number) => `arrivals:${iata.toLowerCase()}:${limit}`,
  totalCounts: () => 'stats:total-counts',
  topAirlines: (limit: number) => `stats:top-airlines:${limit}`,
  busiestAirports: (limit: number) => `stats:busiest-airports:${limit}`,
  topAircraftTypes: (limit: number) => `stats:top-aircraft:${limit}`,
  longestFlight: () => 'stats:longest-flight',
  totalFlightsToday: () => 'stats:flights-today',
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  // Individual records - 1 hour
  airport: 3600,
  route: 3600,
  airline: 3600,
  destination: 3600,
  // Aggregated data - 6 hours
  allAirports: 21600,
  airportsByCountry: 21600,
  routesByCountry: 21600,
  allAirlines: 21600,
  // Flight data (more dynamic) - 15 minutes
  flights: 900,
  departures: 900,
  arrivals: 900,
  // Statistics - 1 hour
  stats: 3600,
};

