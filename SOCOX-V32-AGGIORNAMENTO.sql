-- SocoCup v32: eseguire UNA VOLTA in Supabase SQL Editor, prima di caricare la pagina v32.
-- I post e i commenti esistenti rimangono della squadra.
ALTER TABLE public.sococup_posts ADD COLUMN IF NOT EXISTS identity_type text NOT NULL DEFAULT 'team';
ALTER TABLE public.sococup_posts ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.sococup_comments ADD COLUMN IF NOT EXISTS identity_type text NOT NULL DEFAULT 'team';
ALTER TABLE public.sococup_comments ADD COLUMN IF NOT EXISTS display_name text;
-- I controlli di accesso esistenti restano attivi; i nuovi campi sono solo attributi del post.
ALTER TABLE public.sococup_posts DROP CONSTRAINT IF EXISTS sococup_posts_identity_type_check;
ALTER TABLE public.sococup_posts ADD CONSTRAINT sococup_posts_identity_type_check CHECK (identity_type IN ('team','personal'));
ALTER TABLE public.sococup_comments DROP CONSTRAINT IF EXISTS sococup_comments_identity_type_check;
ALTER TABLE public.sococup_comments ADD CONSTRAINT sococup_comments_identity_type_check CHECK (identity_type IN ('team','personal'));
ALTER TABLE public.sococup_posts DROP CONSTRAINT IF EXISTS sococup_posts_display_name_length;
ALTER TABLE public.sococup_posts ADD CONSTRAINT sococup_posts_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 60);
ALTER TABLE public.sococup_comments DROP CONSTRAINT IF EXISTS sococup_comments_display_name_length;
ALTER TABLE public.sococup_comments ADD CONSTRAINT sococup_comments_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 60);
