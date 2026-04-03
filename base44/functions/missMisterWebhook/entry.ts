import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Génère l'URL du QR code via api.qrserver.com
function getQRCodeUrl(content) {
  const encoded = encodeURIComponent(content);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}

// Email HTML pour le client
function buildClientEmail(reservation, qrCode) {
  const qrUrl = getQRCodeUrl(qrCode);
  const totalEuros = (reservation.amount_cents / 100).toFixed(2);
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0A0A0F;">
    <!-- Header -->
    <div style="text-align:center;padding:40px 20px 20px;background:linear-gradient(135deg,#1a1a2e,#0A0A0F);">
      <img src="https://media.base44.com/images/public/69a460cb984c65f748b49e7d/2db995f80_454009299_122112677468384538_2558620218814362312_n.jpg"
        alt="Miss &amp; Mister Dour" style="width:180px;border-radius:12px;margin-bottom:20px;" />
      <h1 style="color:#D4AF37;font-size:26px;margin:0;font-weight:700;letter-spacing:1px;">🎉 Réservation confirmée !</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:8px 0 0;">Votre place est réservée pour Miss &amp; Mister Dour 2026</p>
    </div>

    <!-- Divider -->
    <div style="height:2px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);margin:0 20px;"></div>

    <!-- Content -->
    <div style="padding:30px 30px 10px;">
      <p style="color:rgba(255,255,255,0.85);font-size:16px;line-height:1.6;margin:0 0 20px;">
        Bonjour <strong style="color:#D4AF37;">${reservation.first_name} ${reservation.last_name}</strong>,<br><br>
        Votre paiement a bien été reçu. Voici le récapitulatif de votre réservation :
      </p>

      <!-- Recap Box -->
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Événement</td>
            <td style="color:#fff;font-size:13px;font-weight:600;text-align:right;">Miss &amp; Mister Dour 2026</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Nom</td>
            <td style="color:#fff;font-size:13px;font-weight:600;text-align:right;">${reservation.first_name} ${reservation.last_name}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Email</td>
            <td style="color:#fff;font-size:13px;font-weight:600;text-align:right;">${reservation.email}</td>
          </tr>
          ${reservation.phone ? `<tr>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Téléphone</td>
            <td style="color:#fff;font-size:13px;font-weight:600;text-align:right;">${reservation.phone}</td>
          </tr>` : ''}
          <tr>
            <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:6px 0;">Nombre de places</td>
            <td style="color:#D4AF37;font-size:13px;font-weight:700;text-align:right;">${reservation.quantity} place(s)</td>
          </tr>
          <tr style="border-top:1px solid rgba(212,175,55,0.2);">
            <td style="color:#fff;font-size:15px;font-weight:700;padding:10px 0 4px;">Total payé</td>
            <td style="color:#D4AF37;font-size:18px;font-weight:700;text-align:right;padding:10px 0 4px;">${totalEuros} €</td>
          </tr>
        </table>
      </div>

      <!-- QR Code Section -->
      <div style="text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:30px;margin-bottom:24px;">
        <p style="color:#D4AF37;font-size:14px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:2px;">🎟️ Votre QR Code d'entrée</p>
        <img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:8px;background:#fff;padding:8px;" />
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:16px 0 0;">Présentez ce QR code à l'entrée de l'événement</p>
        <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:6px 0 0;word-break:break-all;">Référence : ${qrCode}</p>
      </div>

      <!-- Event Info -->
      <div style="background:rgba(255,45,138,0.06);border:1px solid rgba(255,45,138,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#FF2D8A;font-size:14px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">📍 Informations pratiques</h3>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;line-height:1.8;">
          <strong style="color:#fff;">Date :</strong> À confirmer — 2026<br>
          <strong style="color:#fff;">Lieu :</strong> Centre Sportif d'Élouges, Rue du Stade, 7370 Dour (Élouges), Belgique
        </p>
      </div>

      <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;line-height:1.6;">
        Des questions ? Contactez-nous à <a href="mailto:contact@fashionistart.be" style="color:#D4AF37;">contact@fashionistart.be</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">© 2026 Fashionist'ART — Miss &amp; Mister Dour</p>
    </div>
  </div>
</body>
</html>`;
}

// Email HTML pour l'admin
function buildAdminEmail(reservation, qrCode) {
  const totalEuros = (reservation.amount_cents / 100).toFixed(2);
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;border-left:4px solid #D4AF37;">
    <h2 style="color:#0A0A0F;margin:0 0 20px;">🎟️ Nouvelle réservation Miss &amp; Mister Dour</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="color:#666;padding:5px 0;width:140px;">Nom</td><td style="font-weight:600;">${reservation.first_name} ${reservation.last_name}</td></tr>
      <tr><td style="color:#666;padding:5px 0;">Email</td><td>${reservation.email}</td></tr>
      ${reservation.phone ? `<tr><td style="color:#666;padding:5px 0;">Téléphone</td><td>${reservation.phone}</td></tr>` : ''}
      <tr><td style="color:#666;padding:5px 0;">Places</td><td style="font-weight:700;color:#D4AF37;">${reservation.quantity}</td></tr>
      <tr><td style="color:#666;padding:5px 0;">Montant</td><td style="font-weight:700;color:#22c55e;">${totalEuros} €</td></tr>
      <tr><td style="color:#666;padding:5px 0;">QR Code</td><td style="font-size:11px;color:#888;word-break:break-all;">${qrCode}</td></tr>
    </table>
    <p style="color:#888;font-size:12px;margin:20px 0 0;">Paiement confirmé via Stripe</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature invalid:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata?.reservation_id;

    if (reservationId) {
      const qrCode = generateUUID();

      // 1. Mise à jour de la réservation
      await base44.asServiceRole.entities.MissMisterReservation.update(reservationId, {
        status: 'PAID',
        stripe_payment_intent_id: session.payment_intent,
        qr_code: qrCode,
        paid_at: new Date().toISOString(),
      });
      console.log(`Reservation ${reservationId} PAID — QR: ${qrCode}`);

      // 2. Récupérer les infos de la réservation
      let reservation = null;
      try {
        const allReservations = await base44.asServiceRole.entities.MissMisterReservation.list();
        reservation = allReservations.find(r => r.id === reservationId);
      } catch (err) {
        console.error('Erreur récupération réservation:', err.message);
      }

      if (reservation) {
        // 3. Email de confirmation au client
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: "Miss & Mister Dour",
            to: reservation.email,
            subject: "🎟️ Votre réservation Miss & Mister Dour 2026 est confirmée !",
            body: buildClientEmail(reservation, qrCode),
          });
          console.log(`Email client envoyé à ${reservation.email}`);
        } catch (err) {
          console.error('Erreur envoi email client:', err.message);
        }

        // 4. Notification email aux admins
        const adminEmails = ['contact@fashionistart.be'];
        for (const adminEmail of adminEmails) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              from_name: "Miss & Mister Dour - Système",
              to: adminEmail,
              subject: `🔔 Nouvelle réservation — ${reservation.first_name} ${reservation.last_name} (${reservation.quantity} place${reservation.quantity > 1 ? 's' : ''})`,
              body: buildAdminEmail(reservation, qrCode),
            });
            console.log(`Notification admin envoyée à ${adminEmail}`);
          } catch (err) {
            console.error(`Erreur notification admin ${adminEmail}:`, err.message);
          }
        }

        // 5. Notification push aux admins via base44 users
        try {
          const users = await base44.asServiceRole.entities.User.list();
          const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
          const totalEuros = (reservation.amount_cents / 100).toFixed(2);

          for (const admin of admins) {
            if (admin.email) {
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  from_name: "Miss & Mister Dour - Alerte",
                  to: admin.email,
                  subject: `🔔 [PUSH] Nouvelle réservation — ${reservation.first_name} ${reservation.last_name} — ${totalEuros} €`,
                  body: buildAdminEmail(reservation, qrCode),
                });
                console.log(`Push admin envoyé à ${admin.email}`);
              } catch (e) {
                console.error(`Erreur push admin ${admin.email}:`, e.message);
              }
            }
          }
        } catch (err) {
          console.error('Erreur récupération admins:', err.message);
        }
      }
    }
  }

  return Response.json({ received: true });
});