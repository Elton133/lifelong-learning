import type { Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase';

function getToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice('Bearer '.length).trim();
  // Optional cookie fallbacks if you use them:

  if (req.cookies?.['sb-access-token']) return req.cookies['sb-access-token'];

  if (req.cookies?.['access_token']) return req.cookies['access_token'];
  return null;
}

export async function authenticateRequest(req: Request, res: Response): Promise<User | null> {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return data.user;
}