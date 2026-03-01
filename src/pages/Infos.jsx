import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/shared/SectionTitle';
import FreeBadge from '@/components/shared/FreeBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Clock, Car, Train, Bus, Mail, Phone, Loader2, Send, ParkingCircle } from 'lucide-react';

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
    toast.success('Message envoyé ! Nous vous répondrons rapidement.');
    setForm({ name: '', email: '', message: '', consent_rgpd: false });
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <FreeBadge className="mb-4" />
        <SectionTitle title="Infos pratiques" subtitle="Tout ce qu'il faut savoir pour votre visite" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Info cards */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#C2185B]/10"><MapPin className="w-5 h-5 text-[#C2185B]" /></div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Adresse</h3>
                  <p className="text-sm text-[#2D2024]/70">Centre Sportif d'Élouges<br />Dour, Belgique</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass glow-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#D4AF37]/10"><Clock className="w-5 h-5 text-[#D4AF37]" /></div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Horaires</h3>
                  <p className="text-sm text-[#2D2024]/70">
                    <strong>Samedi 18 avril 2026</strong><br />
                    Ouverture des portes : 10h00<br />
                    Fin de l'événement : 22h00
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass glow-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#6B4C9A]/10"><Car className="w-5 h-5 text-[#6B4C9A]" /></div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-2">Accès & Transports</h3>
                  <div className="space-y-3 text-sm text-[#2D2024]/70">
                    <div className="flex items-start gap-2">
                      <Car className="w-4 h-4 mt-0.5 text-[#C2185B]/60 flex-shrink-0" />
                      <span><strong>En voiture :</strong> Autoroute E19/E42, sortie Dour. Suivre les panneaux « Centre Sportif d'Élouges ».</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ParkingCircle className="w-4 h-4 mt-0.5 text-[#C2185B]/60 flex-shrink-0" />
                      <span><strong>Parking :</strong> Parking gratuit sur place (places limitées).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Train className="w-4 h-4 mt-0.5 text-[#C2185B]/60 flex-shrink-0" />
                      <span><strong>En train :</strong> Gare de Dour (SNCB), puis bus ou 15 min à pied.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Bus className="w-4 h-4 mt-0.5 text-[#C2185B]/60 flex-shrink-0" />
                      <span><strong>En bus :</strong> Lignes TEC vers Dour-Élouges. Arrêt à proximité.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass glow-card rounded-2xl overflow-hidden h-[400px] lg:h-full min-h-[400px]">
            <MapContainer center={EVENT_POSITION} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={EVENT_POSITION}>
                <Popup>
                  <strong>Fashionist'ART</strong><br />
                  Centre Sportif d'Élouges<br />
                  18 avril 2026
                </Popup>
              </Marker>
            </MapContainer>
          </motion.div>
        </div>

        {/* Contact form */}
        <div className="section-divider mb-16" />
        <SectionTitle title="Contactez-nous" subtitle="Une question ? N'hésitez pas à nous écrire" />

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto glass glow-card rounded-3xl p-8">
          <form onSubmit={handleContact} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Votre nom"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border-[#E8A0B4]/40 bg-white/60 h-12"
              />
              <Input
                type="email"
                placeholder="Votre e-mail"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border-[#E8A0B4]/40 bg-white/60 h-12"
              />
            </div>
            <Textarea
              placeholder="Votre message..."
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="rounded-xl border-[#E8A0B4]/40 bg-white/60 min-h-[120px]"
            />
            <div className="flex items-start gap-2">
              <Checkbox
                id="contact-rgpd"
                checked={form.consent_rgpd}
                onCheckedChange={(v) => setForm({ ...form, consent_rgpd: v })}
                className="mt-0.5"
              />
              <label htmlFor="contact-rgpd" className="text-xs text-[#2D2024]/60 cursor-pointer">
                J'accepte que mes données soient traitées conformément à la <a href="/Privacy" className="text-[#C2185B] underline">politique de confidentialité</a> de Fashionist'ART.
              </label>
            </div>
            <Button type="submit" disabled={sending} className="btn-premium w-full h-12 gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}