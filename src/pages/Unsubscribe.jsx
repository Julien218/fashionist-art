import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Unsubscribe() {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien invalide ou incomplet.');
      return;
    }

    base44.functions.invoke('unsubscribeNewsletter', { token, email })
      .then((res) => {
        if (res.data?.success) {
          setStatus('success');
          setMessage('Vous avez été désinscrit(e) avec succès. Vous ne recevrez plus de newsletter Fashionist\'ART.');
        } else {
          setStatus('error');
          setMessage(res.data?.error || 'Une erreur est survenue.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Une erreur est survenue. Veuillez réessayer.');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-dark neon-border rounded-3xl p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <><Loader2 className="w-12 h-12 animate-spin text-[#FF2D8A] mx-auto mb-4" />
          <p className="text-white/60">Traitement en cours...</p></>
        )}
        {status === 'success' && (
          <><CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-3">Désinscription confirmée</h2>
          <p className="text-white/50 text-sm">{message}</p></>
        )}
        {status === 'error' && (
          <><AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-3">Erreur</h2>
          <p className="text-white/50 text-sm">{message}</p></>
        )}
        <Link to={createPageUrl('Home')} className="btn-outline inline-flex items-center justify-center mt-8 text-sm">
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}