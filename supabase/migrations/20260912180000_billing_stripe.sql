-- Phase 5 — abonnements et paiements (doc 10-ABONNEMENTS-ET-PAIEMENTS.md).
-- plans / plan_prices / subscriptions / billing_events. Stripe reste la
-- source des paiements ; ces tables sont un miroir opérationnel calculé
-- depuis des événements webhook signés, jamais depuis l'interface seule
-- (doc : "L'interface ne décide jamais seule qu'un paiement a réussi").
-- Exclusif au personnel Signa, comme sites/api_keys en Phase 4.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  stripe_product_id text unique,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy plans_select_staff on public.plans for select to authenticated
  using (public.is_internal_staff());

create table public.plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  stripe_price_id text not null unique,
  commitment text not null check (commitment in ('annual', 'none')),
  unit_amount_cents integer not null,
  currency text not null default 'cad',
  interval text not null default 'month',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.plan_prices enable row level security;

create policy plan_prices_select_staff on public.plan_prices for select to authenticated
  using (public.is_internal_staff());

-- subscriptions ---------------------------------------------------------
-- Une ligne par organisation (le MVP n'a qu'un module principal facturé à
-- la fois, doc 10 : "Un module principal dans le forfait Entreprise").

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_price_id uuid references public.plan_prices(id),
  status text not null default 'incomplete' check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'
  )),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

alter table public.subscriptions enable row level security;

create index subscriptions_stripe_customer_id_idx on public.subscriptions (stripe_customer_id);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create policy subscriptions_select_staff on public.subscriptions for select to authenticated
  using (public.is_internal_staff());

-- billing_events ----------------------------------------------------------
-- Journal idempotent des événements Stripe reçus (doc : "stocker
-- l'identifiant unique ... accepter répétitions et désordre").

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;

create policy billing_events_select_staff on public.billing_events for select to authenticated
  using (public.is_internal_staff());

-- Droit d'accès dérivé du statut d'abonnement. `past_due` reste actif
-- (grâce par défaut) en attendant que DEC-013 (durée de grâce) soit
-- tranchée avec l'équipe commerciale — voir memory/tasks.md.

create or replace function public.is_org_billing_active(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select status in ('trialing', 'active', 'past_due') from public.subscriptions where organization_id = target_org_id),
    false
  );
$$;

grant execute on function public.is_org_billing_active(uuid) to authenticated;

-- Plans de départ (doc 10 : 129$/mois engagement annuel ou 149$/mois sans
-- engagement). IDs Stripe réels créés en mode test le 2026-09-12 ; à
-- recréer en mode production avant le lancement commercial.

insert into public.plans (key, name, stripe_product_id) values
  ('entreprise', 'Forfait Entreprise', 'prod_VFOaESoM6OOPUz');

insert into public.plan_prices (plan_id, stripe_price_id, commitment, unit_amount_cents, currency, interval)
select id, 'price_1UEtnV1K3EJMj1F7Sf6HFMTr', 'annual', 12900, 'cad', 'month' from public.plans where key = 'entreprise'
union all
select id, 'price_1UEtnW1K3EJMj1F7ZlwXWHcJ', 'none', 14900, 'cad', 'month' from public.plans where key = 'entreprise';
