-- Таблица заказов loopenergy.kz
-- Выполнить один раз в SQL Editor проекта pmokxaidvbftzxjinmiz.

create table if not exists public.orders (
  id             text primary key,
  order_number   bigint generated always as identity,
  customer_name  text        not null,
  customer_phone text        not null,
  city           text        not null default '',
  address        text        not null default '',
  comment        text        not null default '',
  carrier        text        not null default 'cdek',
  delivery_option text       not null default 'pvz',
  items          jsonb       not null default '[]'::jsonb,
  total_amount   integer     not null,
  payment_method text        not null default 'kaspi',
  status         text        not null default 'pending'
                 check (status in ('pending','awaiting_review','paid','cancelled')),
  cancel_reason  text,
  locale         text        not null default 'ru',
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  confirmed_at   timestamptz
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_created_idx        on public.orders (created_at desc);

-- К таблице ходит только сервер под service_role, который RLS обходит.
-- Политик нет намеренно: с публичным ключом заказы не читаются вообще.
alter table public.orders enable row level security;
