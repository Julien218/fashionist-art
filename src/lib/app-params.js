// Plus de paramètres Base44 — configuration Supabase via variables d'environnement
export const appParams = {
  appId: null,
  token: null,
  functionsVersion: null,
  appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};

export default appParams;
