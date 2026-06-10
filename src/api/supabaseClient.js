import { createClient } from '@supabase/supabase-js';

// URL Supabase — définie via variables d'environnement Railway
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Client Supabase avec valeurs de secours pour éviter un crash total
// si les variables d'env ne sont pas encore configurées
const FALLBACK_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cnlwenpjamVidmZjaWhpeW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNTYxOTMsImV4cCI6MjAyNDYzMjE5M30.ZJn9YkQBBPxbJWxf5lLmfpqmF7H6E5yVHGgpKAzFbLI';

const finalUrl = (supabaseUrl && supabaseUrl !== 'https://TONPROJECTID.supabase.co')
  ? supabaseUrl
  : FALLBACK_URL;

const finalKey = (supabaseAnonKey && !supabaseAnonKey.startsWith('VOTRE_ANON'))
  ? supabaseAnonKey
  : FALLBACK_KEY;

if (!supabaseUrl || supabaseUrl === 'https://TONPROJECTID.supabase.co') {
  console.warn('[Supabase] VITE_SUPABASE_URL non configurée — utilisation fallback base44');
}

export const supabase = createClient(finalUrl, finalKey);
