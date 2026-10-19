-- SOCOCUP V34 — risposte automatiche della community virtuale
-- Eseguire su Supabase SQL Editor. Non cancella post, commenti o profili.
-- Richiede la tabella public.sococup_bot_comments già presente nel progetto.
-- Se manca, interrompe con errore esplicito, senza cambiare la bacheca.
DO $$ BEGIN
 IF to_regclass('public.sococup_bot_comments') IS NULL THEN
   RAISE EXCEPTION 'Manca public.sococup_bot_comments: controllare prima lo schema esistente';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.sococup_v34_auto_reply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  bots text[] := ARRAY['Marco Rossetti','Giulia Moretti','Alessandro Ferri','Davide Conti','Luca Romano','Sara Bellini','Pietro Mancini','Elena Costa','Simone Vitale','Chiara Greco','Andrea Rizzo','Valentina Serra','Matteo Caruso','Francesca De Luca','Riccardo Gallo','Giorgio Fontana','Beatrice Leone','Stefano Messina','Marta Orlando','Nicola Ferrara','Tommaso Villa','Federica Bruno','Lorenzo Sala','Irene Romano','Alessia Marino'];
  i integer;
  j integer;
  body_text text;
  reply_text text;
  bot text;
BEGIN
  -- Il contenuto rimane sempre un commento fittizio, non una notizia verificata.
  body_text := lower(coalesce(NEW.content,''));
  IF length(trim(body_text)) < 3 THEN RETURN NEW; END IF;
  -- Due profili diversi per post; scelta stabile in base all'ID.
  FOR j IN 1..2 LOOP
    i := (abs(hashtext(NEW.id::text || ':' || j::text)::bigint) % 25)::integer + 1;
    bot := bots[i];
    IF body_text ~ '(vittori|vinto|vinci|tre punti|campion)' THEN
      reply_text := CASE (i % 4) WHEN 0 THEN 'Tre punti pesanti! Ma il campionato è ancora lungo 👀' WHEN 1 THEN 'Festeggiare ci sta, adesso serve continuità ⚽' WHEN 2 THEN 'La classifica inizia a farsi interessante!' ELSE 'Aspetto già il prossimo turno per vedere se vi confermate 😄' END;
    ELSIF body_text ~ '(perso|sconfitt|disastr|ultimo|perdent)' THEN
      reply_text := CASE (i % 4) WHEN 0 THEN 'Giornata difficile, ma la prossima può cambiare tutto.' WHEN 1 THEN 'Il fantacalcio sa essere spietato 😅' WHEN 2 THEN 'Serve una reazione nel prossimo turno!' ELSE 'Qui si prepara già la rivincita ⚽' END;
    ELSIF body_text ~ '(scambi|mercato|acquist|vendut|asta)' THEN
      reply_text := CASE (i % 4) WHEN 0 THEN 'Mossa interessante: vediamo se paga sul campo.' WHEN 1 THEN 'Questo mercato farà discutere 👀' WHEN 2 THEN 'La rosa cambia, le aspettative salgono!' ELSE 'Segno questa operazione e ne riparliamo fra qualche giornata.' END;
    ELSIF body_text ~ '(gol|assist|bonus|formazion|capitan)' THEN
      reply_text := CASE (i % 4) WHEN 0 THEN 'Qui i dettagli di formazione fanno la differenza.' WHEN 1 THEN 'Un bonus può cambiare tutta la giornata!' WHEN 2 THEN 'Scelta coraggiosa, vedremo il risultato.' ELSE 'Questo sì che è materiale da discussione fantacalcistica ⚽' END;
    ELSE
      reply_text := CASE (i % 5) WHEN 0 THEN 'Questa discussione promette bene 👀' WHEN 1 THEN 'Sono curioso di leggere le altre opinioni!' WHEN 2 THEN 'SocoCup non si ferma mai 😄' WHEN 3 THEN 'Ne riparliamo dopo la prossima giornata ⚽' ELSE 'La community ha già qualcosa di cui discutere!' END;
    END IF;
    -- Lock e verifica per evitare duplicazioni sullo stesso post e stesso bot.
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(NEW.id::text),i);
    IF NOT EXISTS (SELECT 1 FROM public.sococup_bot_comments WHERE post_id=NEW.id AND bot_name=bot) THEN
      INSERT INTO public.sococup_bot_comments (post_id,bot_name,content) VALUES (NEW.id,bot,reply_text);
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS sococup_v34_bot_reply ON public.sococup_posts;
CREATE TRIGGER sococup_v34_bot_reply
AFTER INSERT ON public.sococup_posts
FOR EACH ROW EXECUTE FUNCTION public.sococup_v34_auto_reply();

-- I bot rispondono ai NUOVI post, non riempiono retroattivamente quelli vecchi.
-- Risposte basate su categorie di parole, non su un modello IA.
