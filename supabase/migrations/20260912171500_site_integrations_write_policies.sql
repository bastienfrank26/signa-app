-- Correctif : admin_create_site/admin_rotate_site_key/admin_set_site_status
-- s'exécutent en tant qu'invoker (le personnel Signa authentifié), pas en
-- security definer — il manquait les policies INSERT/UPDATE sur sites et
-- api_keys pour ce rôle (seul SELECT avait été ajouté).

create policy sites_insert_staff_admin on public.sites for insert to authenticated
  with check (public.is_internal_admin());

create policy sites_update_staff_admin on public.sites for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());

create policy api_keys_insert_staff_admin on public.api_keys for insert to authenticated
  with check (public.is_internal_admin());

create policy api_keys_update_staff_admin on public.api_keys for update to authenticated
  using (public.is_internal_admin())
  with check (public.is_internal_admin());
