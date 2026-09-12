-- RPC d'approbation (transactionnelle, sans security definer : la RLS des
-- deux tables touchées suffit à protéger l'opération) + bucket de stockage
-- pour les fichiers de projet.

create or replace function public.approve_project_version(
  p_project_id uuid,
  p_version_label text,
  p_consent_text text
)
returns void
language plpgsql
as $$
declare
  current_status text;
begin
  select status into current_status from public.web_projects where id = p_project_id;
  if current_status is null then
    raise exception 'Projet introuvable.';
  end if;
  if current_status <> 'private_review' then
    raise exception 'Le projet n''est pas en révision privée.';
  end if;

  insert into public.approvals (web_project_id, approved_by, version_label, consent_text)
  values (p_project_id, auth.uid(), p_version_label, p_consent_text);

  update public.web_projects set status = 'approved' where id = p_project_id;
end;
$$;

grant execute on function public.approve_project_version(uuid, text, text) to authenticated;

-- Stockage : un bucket privé, chemin `{organization_id}/{web_project_id}/{fichier}`.

insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

create policy project_files_storage_select
  on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and public.is_org_member((storage.foldername(name))[1]::uuid));

create policy project_files_storage_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files' and public.is_org_member((storage.foldername(name))[1]::uuid));
