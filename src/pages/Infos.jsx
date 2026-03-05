import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Clock, Car, Train, Bus, Loader2, Send, ParkingCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Google Maps embed — Centre Sportif d'Élouges, Dour
const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2524.0!2d3.7760!3d50.3950!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c24b0000000001%3A0x1!2sCentre+Sportif+d%27%C3%89louges%2C+Dour!5e0!3m2!1sfr!2sbe!4v1700000000000!5m2!1sfr!2sbe";

const EVENT_POSITION = [50.3950, 3.7760];

export default function Infos() {
  const [form, setForm] = useState({ name: '', email: '', message: '', consent_rgpd: false });
  const [sending, setSending] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!form.consent_rgpd) { toast.error('Veuillez accepter la politique de confidentialité.'); return; }
    setSending(true);
    await base44.entities.ContactMessage.create(form);
    setSending(false);
    toast.success('Message envoyé !');
    setForm({ name: '', email: '', message: '', consent_rgpd: false });
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="Infos pratiques" subtitle="Tout ce qu'il faut savoir pour votre visite" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="space-y-5">
            {[
              { icon: MapPin, color: 'text-[#FF2D8A]', title: 'Adresse', content: <p>Centre Sportif d'Élouges<br />Dour, Belgique</p> },
              { icon: Clock, color: 'text-[#D4AF37]', title: 'Horaires', content: <p><strong>Samedi 18 avril 2026</strong><br />Ouverture des portes : 10h00<br />Fin de l'événement : 22h00</p> },
              { icon: Car, color: 'text-purple-400', title: 'Accès & Transports', content: (
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2"><Car className="w-4 h-4 mt-0.5 text-[#FF2D8A]/60 flex-shrink-0" /><span><strong className="text-white">En voiture :</strong> Autoroute E19/E42, sortie Dour.</span></p>
                  <p className="flex items-start gap-2"><ParkingCircle className="w-4 h-4 mt-0.5 text-[#FF2D8A]/60 flex-shrink-0" /><span><strong className="text-white">Parking :</strong> Parking gratuit sur place.</span></p>
                  <p className="flex items-start gap-2"><Train className="w-4 h-4 mt-0.5 text-[#FF2D8A]/60 flex-shrink-0" /><span><strong className="text-white">En train :</strong> Gare de Dour (SNCB), puis bus ou 15 min à pied.</span></p>
                  <p className="flex items-start gap-2"><Bus className="w-4 h-4 mt-0.5 text-[#FF2D8A]/60 flex-shrink-0" /><span><strong className="text-white">En bus :</strong> Lignes TEC vers Dour-Élouges.</span></p>
                </div>
              )},
            ].map(({ icon: Icon, color, title, content }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="glass-dark neon-border rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5"><Icon className={`w-5 h-5 ${color}`} /></div>
                  <div>
                    <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                    <div className="text-white/50 text-sm">{content}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-dark neon-border rounded-2xl overflow-hidden h-[400px] lg:h-full min-h-[400px]">
            <MapContainer center={EVENT_POSITION} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={EVENT_POSITION}>
                <Popup><strong>Fashionist'ART</strong><br />Centre Sportif d'Élouges<br />18 avril 2026</Popup>
              </Marker>
            </MapContainer>
          </motion.div>
        </div>

        <div className="divider mb-16" />
        <SectionTitle title="Contactez-nous" />

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mx-auto glass-dark neon-border rounded-3xl p-8">
          <form onSubmit={handleContact} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Votre nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50" />
              <Input type="email" placeholder="Votre e-mail" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50" />
            </div>
            <Textarea placeholder="Votre message..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#FF2D8A]/50 min-h-[120px]" />
            <div className="flex items-start gap-2">
              <Checkbox id="contact-rgpd" checked={form.consent_rgpd} onCheckedChange={(v) => setForm({ ...form, consent_rgpd: v })} className="mt-0.5 border-white/20" />
              <label htmlFor="contact-rgpd" className="text-xs text-white/40 cursor-pointer">
                J'accepte que mes données soient traitées conformément à la <Link to={createPageUrl('Privacy')} className="text-[#FF2D8A] underline">politique de confidentialité</Link>.
              </label>
            </div>
            <Button type="submit" disabled={sending} className="btn-primary w-full h-12 rounded-full border-0">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}