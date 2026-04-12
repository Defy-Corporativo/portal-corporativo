-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.fcst_client_contacts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  position text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_client_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_client_contacts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fcst_clients(id)
);
CREATE TABLE public.fcst_clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  nickname text,
  document text,
  address text,
  notes text,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_custom_charts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_custom_charts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_custom_fields (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type = ANY (ARRAY['text'::text, 'number'::text, 'percentage'::text, 'currency'::text, 'date'::text, 'select'::text, 'checkbox'::text])),
  is_required boolean DEFAULT false,
  select_options jsonb,
  order_index integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_custom_fields_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_opportunities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_number text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT ''::text,
  client_id uuid,
  client_name text NOT NULL,
  creation_date date NOT NULL DEFAULT CURRENT_DATE,
  stage text NOT NULL,
  responsible text,
  notes text,
  custom_data jsonb DEFAULT '{}'::jsonb,
  is_goal boolean DEFAULT false,
  is_potential boolean DEFAULT false,
  billing_probability text DEFAULT 'baixa'::text CHECK (billing_probability = ANY (ARRAY['alta'::text, 'media'::text, 'baixa'::text])),
  display_priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunities_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunities_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fcst_clients(id)
);
CREATE TABLE public.fcst_opportunity_actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  description text NOT NULL,
  responsible text NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'pendente'::text CHECK (status = ANY (ARRAY['pendente'::text, 'concluida'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_actions_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunity_actions_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.fcst_opportunities(id)
);
CREATE TABLE public.fcst_opportunity_forecasts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  estimated_value numeric NOT NULL,
  invoiced boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_forecasts_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunity_forecasts_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.fcst_opportunities(id)
);
CREATE TABLE public.fcst_opportunity_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  changed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_history_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunity_history_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.fcst_opportunities(id)
);
CREATE TABLE public.fcst_opportunity_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  content text NOT NULL,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_notes_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunity_notes_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.fcst_opportunities(id)
);
CREATE TABLE public.fcst_opportunity_tag_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_tag_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT fcst_opportunity_tag_assignments_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.fcst_opportunities(id),
  CONSTRAINT fcst_opportunity_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.fcst_opportunity_tags(id)
);
CREATE TABLE public.fcst_opportunity_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_opportunity_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_profiles (
  id text NOT NULL,
  email text,
  name text,
  role text DEFAULT 'user'::text,
  last_login timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_stage_definitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  color character varying DEFAULT '#64748B'::character varying,
  allowed_next_stages ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_stage_definitions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fcst_user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  default_view text DEFAULT 'list'::text CHECK (default_view = ANY (ARRAY['list'::text, 'cards'::text])),
  visible_columns jsonb,
  saved_filters jsonb,
  items_per_page integer DEFAULT 20,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT fcst_user_preferences_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flop_frentes_estrategicas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  descricao character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT flop_frentes_estrategicas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flop_notas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL,
  texto text NOT NULL,
  usuario character varying NOT NULL,
  data_hora timestamp with time zone DEFAULT now(),
  CONSTRAINT flop_notas_pkey PRIMARY KEY (id),
  CONSTRAINT flop_notas_tarefa_id_fkey FOREIGN KEY (tarefa_id) REFERENCES public.flop_tarefas(id)
);
CREATE TABLE public.flop_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  descricao character varying,
  responsavel character varying,
  data_expectativa date,
  projeto_id uuid NOT NULL,
  parent_id uuid,
  nivel integer DEFAULT 1,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  titulo character varying NOT NULL,
  data_inicio date,
  CONSTRAINT flop_objetivos_pkey PRIMARY KEY (id),
  CONSTRAINT flop_objetivos_projeto_id_fkey FOREIGN KEY (projeto_id) REFERENCES public.flop_projetos(id),
  CONSTRAINT flop_objetivos_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.flop_objetivos(id)
);
CREATE TABLE public.flop_projetos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  descricao character varying NOT NULL,
  frente_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT flop_projetos_pkey PRIMARY KEY (id),
  CONSTRAINT flop_projetos_frente_id_fkey FOREIGN KEY (frente_id) REFERENCES public.flop_frentes_estrategicas(id)
);
CREATE TABLE public.flop_responsaveis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT flop_responsaveis_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flop_tarefas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo character varying NOT NULL UNIQUE,
  titulo character varying NOT NULL,
  descricao text,
  responsavel character varying,
  data_expectativa date,
  objetivo_id uuid NOT NULL,
  concluida boolean DEFAULT false,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  data_inicio date,
  CONSTRAINT flop_tarefas_pkey PRIMARY KEY (id),
  CONSTRAINT flop_tarefas_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES public.flop_objetivos(id)
);
CREATE TABLE public.pepl_responsibles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  email text,
  CONSTRAINT pepl_responsibles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prtc_portals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description character varying NOT NULL,
  url text NOT NULL,
  icon character varying NOT NULL DEFAULT 'Globe'::character varying,
  custom_icon_url text,
  category character varying NOT NULL DEFAULT 'internal'::character varying CHECK (category::text = ANY (ARRAY['internal'::character varying, 'external'::character varying]::text[])),
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT prtc_portals_pkey PRIMARY KEY (id),
  CONSTRAINT prtc_portals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.prtc_profiles(id)
);
CREATE TABLE public.prtc_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prtc_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT prtc_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
