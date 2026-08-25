-- Таблица заказов loopenergy.kz.
-- Отражает таблицу, которая уже создана в проекте pmokxaidvbftzxjinmiz —
-- держите файл и базу в согласии, если будете пересоздавать.

create table if not exists public.orders (
  id              uuid        primary key default gen_random_uuid(),
  order_number    bigint      generated always as identity,
  customer_name   text        not null,
  customer_phone  text        not null,
  city            text        not null default '',
  address         text        not null default '',
  comment         text        not null default '',
  carrier         text        not null default 'cdek',
  delivery_option text        not null default '',
  items           jsonb       not null default '[]'::jsonb,
  total_amount    integer     not null default 0,
  payment_method  text        not null default 'kaspi',
  status          text        not null default 'pending'
                  check (status in ('pending','awaiting_review','paid','cancelled')),
  cancel_reason   text,
  locale          text        not null default 'ru',
  created_at      timestamptz not null default now(),
  -- Момент, когда клиент нажал «Я оплатил». Не доказательство оплаты.
  paid_at         timestamptz,
  -- Момент, когда магазин принял решение: подтвердил или отменил.
  confirmed_at    timestamptz
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_created_idx        on public.orders (created_at desc);

-- К таблице ходит только сервер под service_role, который RLS обходит.
-- Политик нет намеренно: с публичным ключом заказы не читаются вообще.
alter table public.orders enable row level security;
