-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: conclusions
create table if not exists public.conclusions (
  id uuid primary key default uuid_generate_v4(),
  affaire_id text,
  user_id uuid references auth.users(id) on delete cascade not null,
  version integer default 1,
  juridiction text not null,
  n_rg text not null,
  audience date,
  societe_info jsonb default '{}',
  salarie_info jsonb default '{}',
  avocat_adverse jsonb default '{}',
  numero_conclusions integer default 1,
  statut text default 'brouillon' check (statut in ('brouillon', 'en_cours', 'finalise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table: conclusions_chefs
create table if not exists public.conclusions_chefs (
  id uuid primary key default uuid_generate_v4(),
  conclusion_id uuid references public.conclusions(id) on delete cascade not null,
  chef_demande text not null,
  montant_demande numeric,
  strategie text default 'contester' check (strategie in ('contester', 'conceder_partiellement', 'ne_pas_repondre')),
  force_argument text check (force_argument in ('fort', 'moyen', 'faible')),
  montant_propose numeric,
  arguments_adverses text,
  section_droit text,
  section_fait text,
  ordre integer default 1,
  created_at timestamptz default now()
);

-- Table: parties_droit
create table if not exists public.parties_droit (
  id uuid primary key default uuid_generate_v4(),
  theme text not null,
  sous_theme text,
  titre text not null,
  contenu text not null,
  articles_loi text[] default '{}',
  jurisprudences text[] default '{}',
  created_at timestamptz default now()
);

-- Table: conclusions_pieces
create table if not exists public.conclusions_pieces (
  id uuid primary key default uuid_generate_v4(),
  conclusion_id uuid references public.conclusions(id) on delete cascade not null,
  numero integer not null,
  titre text not null,
  type text check (type in ('dossier', 'adverse', 'conclusions_adverses')),
  fichier_url text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.conclusions enable row level security;
alter table public.conclusions_chefs enable row level security;
alter table public.parties_droit enable row level security;
alter table public.conclusions_pieces enable row level security;

create policy "Users can manage their conclusions" on public.conclusions
  for all using (auth.uid() = user_id);

create policy "Users can manage chefs of their conclusions" on public.conclusions_chefs
  for all using (
    exists (select 1 from public.conclusions c where c.id = conclusion_id and c.user_id = auth.uid())
  );

create policy "Parties droit are readable by authenticated users" on public.parties_droit
  for select using (auth.role() = 'authenticated');

create policy "Users can manage pieces of their conclusions" on public.conclusions_pieces
  for all using (
    exists (select 1 from public.conclusions c where c.id = conclusion_id and c.user_id = auth.uid())
  );

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.conclusions
  for each row execute function public.handle_updated_at();
