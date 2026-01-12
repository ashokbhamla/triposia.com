import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// Use provided connection string or fall back to environment variable
// Handle empty strings and undefined values
const envUri = process.env.MONGODB_URI;
let baseUri = (envUri && envUri.trim() !== '' && (envUri.startsWith('mongodb://') || envUri.startsWith('mongodb+srv://')))
  ? envUri 
  : 'mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority';

// Validate URI format before using
if (!baseUri.startsWith('mongodb://') && !baseUri.startsWith('mongodb+srv://')) {
  console.error('Invalid MongoDB URI format. Falling back to default.');
  baseUri = 'mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority';
}

// Remove any existing timeout parameters from URI to avoid conflicts
// Use 8s timeouts to stay under Vercel's 10s limit
baseUri = baseUri.split('?')[0] + '?retryWrites=true&w=majority&serverSelectionTimeoutMS=8000&connectTimeoutMS=8000&socketTimeoutMS=8000';

const dbName: string = 'flights';

// Connection options optimized for serverless environments (Vercel Hobby: 10s limit)
// These options will override any URI parameters
const options: MongoClientOptions = {
  // Server selection timeout (8s - must be under Vercel's 10s limit)
  serverSelectionTimeoutMS: 8000,
  // Socket timeout (8s - must be under Vercel's 10s limit)
  socketTimeoutMS: 8000,
  // Connection timeout (8s - must be under Vercel's 10s limit)
  connectTimeoutMS: 8000,
  // Maximum connection pool size (important for serverless - keep small)
  maxPoolSize: 2, // Reduced further for serverless
  // Minimum connection pool size
  minPoolSize: 0,
  // Maximum idle time before closing connection (20s for serverless)
  maxIdleTimeMS: 20000,
  // Retry writes
  retryWrites: true,
  // Retry reads
  retryReads: true,
  // Heartbeat frequency (check connection health - less frequent to reduce overhead)
  heartbeatFrequencyMS: 30000,
  // Direct connection (set to false for replica sets)
  directConnection: false,
  // Read preference (prefer primary, fallback to secondary)
  readPreference: 'primaryPreferred',
  // Compressors (remove zlib to reduce overhead in serverless)
  compressors: [],
  // Monitor connection health
  monitorCommands: false,
  // TLS options for better connection stability
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Additional options for serverless
  maxConnecting: 1, // Limit concurrent connection attempts
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// For serverless environments (like Vercel, AWS Lambda), we need to cache connections globally
// This prevents creating new connections on every function invocation
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(baseUri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection error in development:', error);
      // Clear promise on error to allow retry
      globalWithMongo._mongoClientPromise = undefined;
      // Don't throw here - let getDatabase() handle retries
      return Promise.reject(error);
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production/serverless, also use global variable to cache connection
  // This is critical for serverless environments where functions are reused
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(baseUri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection error:', error);
      // Clear the promise on error so we can retry
      globalWithMongo._mongoClientPromise = undefined;
      // Don't throw here - let getDatabase() handle retries
      // This prevents unhandled promise rejections
      return Promise.reject(error);
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const maxRetries = 0; // No retries - fail fast to stay under Vercel's 10s limit
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      // Use Promise.race to add a timeout wrapper (8s to stay under Vercel's 10s limit)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timeout after 8s')), 8000);
      });
      
      const client = await Promise.race([clientPromise, timeoutPromise]);
      
      // Don't ping - just return the database (ping adds overhead)
      // The connection is already established when clientPromise resolves
      return client.db(dbName);
    } catch (error) {
      retryCount++;
      const isTimeoutError = error instanceof Error && (
        error.message.includes('timed out') ||
        error.message.includes('Server selection timed out') ||
        error.message.includes('MongoServerSelectionError') ||
        error.message.includes('MongoNetworkTimeoutError') ||
        error.message.includes('secureConnect') ||
        error.message.includes('connection timeout')
      );
      
      if (isTimeoutError && retryCount <= maxRetries) {
        console.warn(`MongoDB connection attempt ${retryCount} failed, retrying...`, error instanceof Error ? error.message : 'Unknown error');
        
        // Clear cached connection
        let globalWithMongo = global as typeof globalThis & {
          _mongoClientPromise?: Promise<MongoClient>;
        };
        globalWithMongo._mongoClientPromise = undefined;
        
        // Wait before retry (shorter wait for faster failure)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create new connection with fresh options (8s timeouts)
        const newClient = new MongoClient(baseUri, {
          ...options,
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
          socketTimeoutMS: 8000,
        });
        
        const newPromise = newClient.connect().catch((err) => {
          console.error('MongoDB reconnection failed:', err);
          globalWithMongo._mongoClientPromise = undefined;
          throw err;
        });
        globalWithMongo._mongoClientPromise = newPromise;
        clientPromise = newPromise;
        
        continue; // Retry
      }
      
      // If not a timeout error or max retries reached, throw
      console.error('Error getting database:', error);
      throw error;
    }
  }
  
  throw new Error('MongoDB connection failed after maximum retries');
}

export default clientPromise;

