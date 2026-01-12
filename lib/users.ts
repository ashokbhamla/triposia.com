/**
 * User management utilities for MongoDB users collection
 */

import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password?: string; // Hashed password, only for manual registration
  image?: string; // Profile image URL (for Google OAuth)
  provider: 'google' | 'credentials'; // Authentication provider
  providerId?: string; // Google ID or null for credentials
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ email });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ _id: new ObjectId(id) });
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Find user by provider ID (Google ID)
 */
export async function findUserByProviderId(providerId: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ providerId });
    return user;
  } catch (error) {
    console.error('Error finding user by provider ID:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  name: string;
  password?: string;
  image?: string;
  provider: 'google' | 'credentials';
  providerId?: string;
}): Promise<User | null> {
  try {
    const db = await getDatabase();
    const now = new Date();
    
    const user: User = {
      ...userData,
      emailVerified: userData.provider === 'google' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<User>('users').insertOne(user);
    
    if (result.insertedId) {
      return await findUserById(result.insertedId.toString());
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date(),
        } 
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/**
 * Verify user email
 */
export async function verifyUserEmail(email: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.collection<User>('users').updateOne(
      { email },
      { 
        $set: { 
          emailVerified: new Date(),
          updatedAt: new Date(),
        } 
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error verifying user email:', error);
    return false;
  }
}

