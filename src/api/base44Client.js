// Migration Base44 → Supabase
// Ce fichier est maintenu pour la compatibilité des imports existants
// Tous les appels base44.entities.* sont redirigés vers Supabase

import { entities } from './entities';
import { supabase } from './supabaseClient';

export const base44 = {
  entities,
  auth: {
    // Pas d'auth Base44 — admin via Supabase ou variables d'environnement
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  supabase, // accès direct si besoin
};

export default base44;
