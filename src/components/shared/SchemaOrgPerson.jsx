import { useEffect } from 'react';

export default function SchemaOrgPerson({ person = {} }) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": person.name,
      "alternateName": person.stage_name || person.name,
      "description": person.discipline,
      "image": person.photo_url,
      "jobTitle": person.discipline,
      "sameAs": [
        person.website,
        person.instagram,
        person.facebook,
        person.tiktok,
        person.youtube,
        person.linkedin
      ].filter(Boolean),
      "url": person.url || `https://fashionistart.base44.app/artist-detail?id=${person.id}`
    };

    if (person.full_bio || person.short_bio) {
      schema.description = person.full_bio || person.short_bio;
    }

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.innerHTML = JSON.stringify(schema);
    scriptEl.setAttribute('data-schema-type', 'person');
    document.head.appendChild(scriptEl);

    return () => {
      const existing = document.querySelector('script[data-schema-type="person"]');
      if (existing) existing.remove();
    };
  }, [person]);

  return null;
}