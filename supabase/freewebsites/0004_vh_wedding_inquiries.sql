-- Wedding redesign (2026-11-23): the inquiry form gains wedding, engagement,
-- save-the-date and planner kinds. Only widens the check; old kinds stay valid.
alter table vh.inquiries drop constraint inquiries_kind_check;
alter table vh.inquiries add constraint inquiries_kind_check check (
  kind = any (array[
    'wedding', 'engagement', 'save_the_date', 'planner',
    'retainer', 'headshots', 'event', 'product', 'mini_session', 'other'
  ])
);
