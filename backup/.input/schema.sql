-- ============================================================
-- SIGNA — Schéma de base de données (PostgreSQL / Supabase)
-- Modèle : modernisation à PRIX FIXE, paiement unique 100 % à l'achat,
-- facture générée automatiquement. Forfaits récurrents = phase future.
-- ============================================================
-- Convention : tout en snake_case, en français pour les libellés métier
-- exposés, en anglais pour les noms techniques de tables/colonnes.
-- Les montants sont stockés en CENTS (entier) pour éviter les erreurs
-- de virgule flottante. 240000 = 2 400,00 $.
-- ============================================================

-- Extensions utiles (Supabase les fournit)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS — statuts et types contrôlés
-- ------------------------------------------------------------

-- Rôles applicatifs (brief §3)
create type user_role as enum ('client', 'employee', 'admin');

-- Statuts du dossier (brief §9 — flux réel)
create type project_status as enum (
  'nouveau',
  'attente_questionnaire',
  'questionnaire_recu',
  'en_cours',
  'envoye',
  'en_attente',
  'revision',
  'accepte',
  'preparation',
  'domaine',
  'en_ligne',
  'termine',
  'archive'
);

-- Types de billets (brief §8)
create type ticket_type as enum (
  'proposition',
  'modification_demandee',
  'commentaire_client',
  'note_interne',
  'fichier_livre',
  'question_signa',
  'reponse_client',
  'validation',
  'domaine',
  'hebergement',
  'mise_en_ligne'
);

-- Visibilité d'un billet
create type ticket_visibility as enum ('client', 'interne');

-- Statut de paiement (Stripe)
create type payment_status as enum ('en_attente', 'paye', 'echoue', 'rembourse');

-- Statut de contrat (MVP : PDF téléversé)
create type contract_status as enum ('non_signe', 'signe');

-- Statut de facture
create type invoice_status as enum ('emise', 'payee', 'annulee');

-- Priorité de dossier
create type priority_level as enum ('basse', 'normale', 'haute');

-- ------------------------------------------------------------
-- USERS — comptes (clients, employés, admins)
-- Sur Supabase, auth.users gère l'authentification ; cette table
-- "profiles" étend chaque utilisateur avec son rôle et ses infos.
-- ------------------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'client',
  full_name     text,
  email         text not null,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COMPANIES — entreprise rattachée à un client
-- ------------------------------------------------------------
create table companies (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  name          text not null,
  sector        text,
  city          text,
  website_url   text,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCTS — services vendus à prix fixe (brief §4)
-- price_cents = prix HORS taxes. Les taxes sont calculées à la commande.
-- ------------------------------------------------------------
create table products (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,          -- 'modernisation-site', 'logo', 'combo'...
  name          text not null,
  description   text,
  price_cents   integer not null,              -- ex : 240000 = 2 400,00 $
  is_active     boolean not null default true,
  -- Champ prévu pour la phase future (forfaits mensuels) :
  is_recurring  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROJECTS — le dossier client (cœur de l'app)
-- ------------------------------------------------------------
create table projects (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references profiles(id) on delete restrict,
  company_id       uuid references companies(id) on delete set null,
  product_id       uuid not null references products(id) on delete restrict,
  assigned_to      uuid references profiles(id) on delete set null, -- employé
  status           project_status not null default 'nouveau',
  priority         priority_level not null default 'normale',
  title            text not null default 'Modernisation de site web',
  -- Prix figé au moment de l'achat (le produit peut changer ensuite)
  price_cents      integer not null,
  purchased_at     timestamptz not null default now(),
  estimated_delivery date,
  closed_at        timestamptz,                -- rempli au passage en 'termine'
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_projects_client on projects(client_id);
create index idx_projects_status on projects(status);
create index idx_projects_assigned on projects(assigned_to);

-- ------------------------------------------------------------
-- QUESTIONNAIRES — réponses du client (brief §5)
-- On stocke les réponses en JSONB pour rester flexible : les sections
-- et champs peuvent évoluer sans migration de schéma.
-- ------------------------------------------------------------
create table questionnaires (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null unique references projects(id) on delete cascade,
  answers       jsonb not null default '{}'::jsonb,  -- { "section": { "champ": "réponse" } }
  is_submitted  boolean not null default false,
  submitted_at  timestamptz,
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TICKETS — billets et propositions (brief §8)
-- ------------------------------------------------------------
create table tickets (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references projects(id) on delete cascade,
  author_id         uuid not null references profiles(id) on delete restrict,
  type              ticket_type not null,
  visibility        ticket_visibility not null default 'interne',
  title             text not null,
  body              text,
  needs_client_reply boolean not null default false,
  -- Pour une proposition acceptée, on la verrouille (brief §10) :
  is_locked         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_tickets_project on tickets(project_id);

-- ------------------------------------------------------------
-- FILES — fichiers téléversés (questionnaire, livrables, billets)
-- Stockés via Supabase Storage ; ici on garde la métadonnée + le chemin.
-- ------------------------------------------------------------
create table files (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects(id) on delete cascade,
  ticket_id     uuid references tickets(id) on delete set null,
  uploaded_by   uuid not null references profiles(id) on delete restrict,
  storage_path  text not null,                 -- chemin dans Supabase Storage
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint,
  is_deliverable boolean not null default false, -- livrable final vs source client
  created_at    timestamptz not null default now()
);

create index idx_files_project on files(project_id);

-- ------------------------------------------------------------
-- PAYMENTS — paiement unique 100 % à l'achat (via Stripe)
-- ------------------------------------------------------------
create table payments (
  id                    uuid primary key default uuid_generate_v4(),
  project_id            uuid not null references projects(id) on delete restrict,
  client_id             uuid not null references profiles(id) on delete restrict,
  amount_cents          integer not null,       -- montant hors taxes
  gst_cents             integer not null,        -- TPS 5 %
  qst_cents             integer not null,        -- TVQ 9,975 %
  total_cents           integer not null,        -- amount + gst + qst
  currency              text not null default 'cad',
  status                payment_status not null default 'en_attente',
  stripe_payment_intent text unique,             -- id Stripe pour réconciliation
  stripe_checkout_session text,
  paid_at               timestamptz,
  created_at            timestamptz not null default now()
);

create index idx_payments_project on payments(project_id);
create index idx_payments_status on payments(status);

-- ------------------------------------------------------------
-- INVOICES — facture générée automatiquement (conforme Québec)
-- ------------------------------------------------------------
create table invoices (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references projects(id) on delete restrict,
  payment_id        uuid references payments(id) on delete set null,
  client_id         uuid not null references profiles(id) on delete restrict,
  -- Numéro séquentiel lisible (ex : SIGNA-2026-0001). Voir séquence ci-dessous.
  invoice_number    text unique not null,
  amount_cents      integer not null,
  gst_cents         integer not null,
  qst_cents         integer not null,
  total_cents       integer not null,
  status            invoice_status not null default 'emise',
  pdf_path          text,                       -- PDF généré dans Supabase Storage
  issued_at         timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Séquence pour la numérotation des factures (obligation légale : séquentiel)
create sequence if not exists invoice_seq start 1;

-- ------------------------------------------------------------
-- CONTRACTS — PDF téléversé manuellement au MVP (brief §11)
-- ------------------------------------------------------------
create table contracts (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects(id) on delete cascade,
  client_id     uuid not null references profiles(id) on delete restrict,
  storage_path  text not null,                 -- PDF dans Supabase Storage
  status        contract_status not null default 'non_signe',
  uploaded_by   uuid not null references profiles(id) on delete restrict,
  signed_at     timestamptz,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- STATUS_HISTORY — journal des changements de statut (brief §10)
-- ------------------------------------------------------------
create table status_history (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references projects(id) on delete cascade,
  from_status   project_status,
  to_status     project_status not null,
  changed_by    uuid references profiles(id) on delete set null, -- null = système
  note          text,
  created_at    timestamptz not null default now()
);

create index idx_status_history_project on status_history(project_id);

-- ------------------------------------------------------------
-- PHASE FUTURE (créées maintenant, vides) — abonnements & hébergement
-- On les prévoit dès le schéma pour ne pas avoir à tout migrer plus tard.
-- ------------------------------------------------------------
create table subscriptions_future (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references profiles(id) on delete cascade,
  product_id            uuid references products(id),
  stripe_subscription_id text,
  monthly_price_cents   integer,
  status                text default 'inactif',
  started_at            timestamptz,
  created_at            timestamptz not null default now()
);

create table hosting_future (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references profiles(id) on delete cascade,
  domain        text,
  registrar     text,
  server_info   jsonb default '{}'::jsonb,
  status        text default 'inactif',
  created_at    timestamptz not null default now()
);

-- ============================================================
-- SÉCURITÉ — Row Level Security (RLS)
-- Principe : un client ne voit QUE ses propres données ; les employés
-- et admins voient tout. À activer sur toutes les tables sensibles.
-- (Exemple pour projects ; à décliner sur les autres tables.)
-- ============================================================
alter table projects enable row level security;

-- Helper : rôle de l'utilisateur courant
create or replace function current_user_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable;

-- Un client voit ses dossiers ; staff voit tout
create policy "projects_select" on projects for select
  using (
    client_id = auth.uid()
    or current_user_role() in ('employee', 'admin')
  );

-- Seul le staff modifie les dossiers
create policy "projects_update" on projects for update
  using (current_user_role() in ('employee', 'admin'));

-- (Répéter des politiques analogues sur questionnaires, tickets, files,
--  payments, invoices, contracts, status_history.)
