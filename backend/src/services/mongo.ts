import mongoose from 'mongoose';
import dns from 'node:dns';

/**
 * Force IPv4 resolution first.
 * This fixes the 'querySrv ECONNREFUSED' error common on ISP networks (like Jio/Reliance) 
 * where IPv6 resolution for MongoDB SRV records fails in Node.js.
 */
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function connectDB() {
  if (!MONGODB_URI) {
    console.error('[MongoDB] Error: MONGODB_URI is not defined in .env');
    return;
  }

  try {
    // Increase timeout for slower connections
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[MongoDB] Connected successfully');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // Don't exit process, let it retry via tsx watch if .env changes
  }
}

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected');
});
