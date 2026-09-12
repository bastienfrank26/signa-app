-- Phase 6 — pilote (doc 13-ROADMAP.md : "Indicateurs" à suivre pendant le
-- pilote). RPC d'agrégats pour la console admin, staff seulement.

create or replace function public.admin_pilot_metrics()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case
    when not public.is_internal_staff() then null
    else jsonb_build_object(
      'organizationsTotal', (select count(*) from organizations where deleted_at is null),
      'organizationsActive', (select count(*) from organizations where status = 'active' and deleted_at is null),
      'organizationsSuspended', (select count(*) from organizations where status = 'suspended' and deleted_at is null),
      'projectsByStatus', (
        select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
        from (select status, count(*) as cnt from web_projects where deleted_at is null group by status) s
      ),
      'submissionsLast30d', (select count(*) from form_submissions where created_at > now() - interval '30 days'),
      'orgsWithActivityLast7d', (
        select count(distinct organization_id) from activities where created_at > now() - interval '7 days'
      ),
      'overdueFollowUps', (
        select count(*) from opportunities o
        join pipeline_stages ps on ps.id = o.stage_id
        where o.deleted_at is null and not ps.is_won and not ps.is_lost
          and o.next_follow_up_at is not null and o.next_follow_up_at < current_date
      ),
      'subscriptionsByStatus', (
        select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
        from (select status, count(*) as cnt from subscriptions group by status) s
      ),
      'sitesActive', (select count(*) from sites where status = 'active'),
      'auditEventsLast7d', (select count(*) from audit_events where created_at > now() - interval '7 days')
    )
  end;
$$;

grant execute on function public.admin_pilot_metrics() to authenticated;
