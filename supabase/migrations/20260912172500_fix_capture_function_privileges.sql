-- Correctif de sécurité critique : la migration précédente ne révoquait
-- EXECUTE que sur PUBLIC. Supabase accorde EXECUTE à `anon` et
-- `authenticated` par des privilèges par défaut indépendants de PUBLIC —
-- vérifié : un utilisateur authentifié quelconque pouvait appeler
-- capture_site_submission_v1() directement et créer des prospects dans
-- n'importe quelle organisation, sans jamais fournir la clé secrète du site
-- (qui n'est vérifiée que dans l'Edge Function, pas dans cette fonction).

revoke execute on function public.capture_site_submission_v1(uuid, jsonb) from anon;
revoke execute on function public.capture_site_submission_v1(uuid, jsonb) from authenticated;
