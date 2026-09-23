-- 2026-09-23 : heure du rendez-vous visio, pour l'agenda de l'admin v2.
-- Additive : le code actuel ne lit pas cette colonne.
alter table public.candidatures add column if not exists visio_starts_at timestamptz;

update public.candidatures c
set visio_starts_at = x.starts
from (
  select distinct on (candidature_id) candidature_id, (data->>'start_time')::timestamptz as starts
  from public.audit_log
  where event = 'visio_booked' and data->>'start_time' is not null
  order by candidature_id, at desc
) x
where c.id = x.candidature_id
  and c.visio_booked_at is not null
  and c.visio_starts_at is null;
