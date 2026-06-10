import { useEffect } from 'react';

export default function SchemaOrgEvent({ event = {} }) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.name || "Fashionist'ART 2026",
      "description": event.description || "Une fusion unique entre mode et art au Centre Sportif d'Élouges (Dour). Une expérience immersive mêlant performances, ateliers et expositions. Entrée gratuite !",
      "startDate": event.startDate || "2026-04-18T10:00:00+02:00",
      "endDate": event.endDate || "2026-04-18T22:00:00+02:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": event.locationName || "Centre Sportif d'Élouges",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": event.streetAddress || "Rue du Stade",
          "addressLocality": event.city || "Élouges",
          "postalCode": event.postalCode || "7370",
          "addressRegion": event.region || "Hainaut",
          "addressCountry": event.country || "BE"
        }
      },
      "offers": {
        "@type": "Offer",
        "url": event.offerUrl || "https://fashionistart.base44.app",
        "price": event.price || "0",
        "priceCurrency": event.currency || "EUR",
        "availability": "https://schema.org/InStock",
        "validFrom": event.validFrom || "2026-01-01"
      },
      "organizer": {
        "@type": "Organization",
        "name": event.organizerName || "Fashionist'ART",
        "url": event.organizerUrl || "https://fashionistart.base44.app",
        "logo": event.organizerLogo || "https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png"
      },
      "image": [
        event.image || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg"
      ],
      "url": event.url || "https://fashionistart.base44.app"
    };

    // Ajouter les artistes si fournis
    if (event.performers && event.performers.length > 0) {
      schema.performer = event.performers.map(artist => ({
        "@type": "Person",
        "name": artist.name,
        "description": artist.discipline,
        "image": artist.photo_url,
        "url": artist.url || `https://fashionistart.base44.app/artist-detail?id=${artist.id}`
      }));
    }

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.innerHTML = JSON.stringify(schema);
    scriptEl.setAttribute('data-schema-type', 'event');
    document.head.appendChild(scriptEl);

    return () => {
      const existing = document.querySelector('script[data-schema-type="event"]');
      if (existing) existing.remove();
    };
  }, [event]);

  return null;
}