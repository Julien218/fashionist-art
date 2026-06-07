import { supabase } from './supabaseClient';

// Helper qui crée un objet-entité avec les mêmes méthodes que base44.entities.*
function createEntity(tableName) {
  return {
    async list(sortField = 'created_at') {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(sortField, { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async filter(filters = {}, sortField = 'created_at', ascending = true) {
      let query = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      query = query.order(sortField, { ascending });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert([record])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, record) {
      const { data, error } = await supabase
        .from(tableName)
        .update(record)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

// Toutes les entités du projet
export const entities = {
  Artist:                createEntity('artists'),
  ArtistWork:            createEntity('artist_works'),
  ArtistBioGenerated:    createEntity('artist_bio_generated'),
  ArtistDailySpotlight:  createEntity('artist_daily_spotlights'),
  BlogPost:              createEntity('blog_posts'),
  ContactMessage:        createEntity('contact_messages'),
  GalleryMedia:          createEntity('gallery_media'),
  HistoryDraft:          createEntity('history_drafts'),
  HistoryPage:           createEntity('history_pages'),
  HomePageConfig:        createEntity('homepage_configs'),
  MissMisterReservation: createEntity('miss_mister_reservations'),
  NewsletterCampaign:    createEntity('newsletter_campaigns'),
  NewsletterSubscriber:  createEntity('newsletter_subscribers'),
  Organizer:             createEntity('organizers'),
  ParticipantForm:       createEntity('participant_forms'),
  Partner:               createEntity('partners'),
  PlatformFeeRule:       createEntity('platform_fee_rules'),
  ProgramEvent:          createEntity('program_events'),
  Registration:          createEntity('registrations'),
  Sale:                  createEntity('sales'),
  SiteNews:              createEntity('site_news'),
  SocialPostDraft:       createEntity('social_post_drafts'),
  Testimonial:           createEntity('testimonials'),
  User:                  createEntity('users'),
};

export default entities;
