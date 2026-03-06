import { useEffect } from 'react';

export default function SchemaOrgOrganization() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Fashionist'ART",
      "description": "Une fusion unique entre mode et art au Centre Sportif d'Élouges (Dour), Belgique",
      "url": "https://fashionistart.base44.app",
      "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png",
      "sameAs": [
        "https://www.instagram.com/fashionist.art.dour/",
        "https://www.facebook.com/61575203516618/",
        "https://www.tiktok.com/@user6921475292315"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rue du Stade",
        "addressLocality": "Élouges",
        "postalCode": "7370",
        "addressRegion": "Hainaut",
        "addressCountry": "BE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "email": "contact@fashionistart.be"
      }
    };

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.innerHTML = JSON.stringify(schema);
    scriptEl.setAttribute('data-schema-type', 'organization');
    document.head.appendChild(scriptEl);

    return () => {
      const existing = document.querySelector('script[data-schema-type="organization"]');
      if (existing) existing.remove();
    };
  }, []);

  return null;
}