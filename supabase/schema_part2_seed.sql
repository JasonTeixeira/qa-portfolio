-- Sage Ideas Studio Portal — Part 2: Seed service catalog
-- Run this AFTER part 1.

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('audit', 'Audit', 'Strategic audit of your stack and growth funnel.', 750, false, 'price_1TT4nXEDeyGfkojJZwqYdbmm', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('ship', 'Ship', 'Ship a focused outcome in one sprint.', 2500, false, 'price_1TT4nXEDeyGfkojJzpw9JR4k', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('automate', 'Automate', 'Wire up an internal workflow end-to-end.', 3500, false, 'price_1TT4nWEDeyGfkojJVcCHy76b', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('seo-sprint', 'SEO Sprint', 'On-page and technical SEO in one sprint.', 1500, false, 'price_1TT4nWEDeyGfkojJ0P9NjqEa', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('content-engine', 'Content Engine', 'Monthly content and distribution.', 1500, true, 'price_1TT4nXEDeyGfkojJyGWmKIpw', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('brand-sprint', 'Brand Sprint', 'Brand identity sprint.', 2500, false, 'price_1TT4nXEDeyGfkojJXiZiLhM9', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('scale', 'Scale', 'Monthly growth retainer.', 1200, true, 'price_1TT4nYEDeyGfkojJNH8NUDgJ', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('build', 'Build', 'Custom build engagement.', 9500, false, 'price_1TT4nXEDeyGfkojJrqu9Zrlo', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('operate', 'Operate', 'Monthly operations partner.', 2500, true, 'price_1TT4nXEDeyGfkojJSKzzlZT6', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('app-development', 'App Development', 'Build a custom application.', 6500, false, 'price_1TT5rTEDeyGfkojJojR1ygzw', 'one-time') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('site-care', 'Site Care', 'Monthly site maintenance.', 300, true, 'price_1TT4o0EDeyGfkojJH0Ose7UB', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('brand-care', 'Brand Care', 'Monthly brand consistency.', 400, true, 'price_1TT4o0EDeyGfkojJuXE37BDs', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;

insert into service_catalog (slug, name, description, price, recurring, stripe_price_id, category) values ('content-care', 'Content Care', 'Monthly content production.', 800, true, 'price_1TT4o0EDeyGfkojJNEKyCk1L', 'subscription') on conflict (slug) do update set price = excluded.price, stripe_price_id = excluded.stripe_price_id, description = excluded.description;
