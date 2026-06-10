import { createClient } from '@supabase/supabase-js';

// Valeurs Supabase — hardcodées pour garantir le build (clé publique anon, sans risque)
const SUPABASE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cnlwenpjamVidmZjaWhpeW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNTYxOTMsImV4cCI6MjAyNDYzMjE5M30.ZJn9YkQBBPxbJWxf5lLmfpqmF7H6E5yVHGgpKAzFbLI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
