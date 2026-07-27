alter table public.subscriptions drop constraint if exists subscriptions_dose_check;
alter table public.subscriptions add constraint subscriptions_dose_check check (dose = any (array[1, 2, 3]));

alter table public.subscriptions drop constraint if exists subscriptions_product_id_check;