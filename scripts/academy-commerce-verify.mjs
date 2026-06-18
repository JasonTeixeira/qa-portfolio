import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import Stripe from 'stripe';

loadEnvFile('.env.local');

const args = new Set(process.argv.slice(2));
const sessionArg = process.argv.find((arg) => arg.startsWith('--session='));
const trackArg = process.argv.find((arg) => arg.startsWith('--track='));

const trackSlug = trackArg?.split('=')[1] || 'ai-native-product-building';
const sessionId = sessionArg?.split('=')[1] || process.env.STRIPE_CHECKOUT_SESSION_ID;

const required = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const priceEnvByTrack = {
  'ai-native-product-building': 'STRIPE_PRICE_ACADEMY_PRODUCT_BUILDING',
  'premium-conversion-sites': 'STRIPE_PRICE_ACADEMY_CONVERSION_SITES',
  'content-engine': 'STRIPE_PRICE_ACADEMY_CONTENT_ENGINE',
  'ai-automation-systems': 'STRIPE_PRICE_ACADEMY_AUTOMATION_SYSTEMS',
};

if (args.has('--config')) {
  const account = await stripe.accounts.retrieve();
  console.log(`stripe_account=${account.id}`);
  console.log(`charges_enabled=${account.charges_enabled}`);
  for (const [slug, envVar] of Object.entries(priceEnvByTrack)) {
    const priceId = process.env[envVar];
    if (!priceId) {
      console.log(`${slug}: missing ${envVar}`);
      continue;
    }
    const price = await stripe.prices.retrieve(priceId);
    console.log(`${slug}: ${price.id} active=${price.active} amount=${price.unit_amount} currency=${price.currency}`);
  }
  const { error } = await supabase.from('academy_enrollments').select('id', { count: 'exact', head: true });
  if (error) throw new Error(`academy_enrollments check failed: ${error.message}`);
  console.log('supabase_academy_enrollments=reachable');
}

if (args.has('--create-expiring-session')) {
  const priceEnv = priceEnvByTrack[trackSlug];
  const priceId = priceEnv ? process.env[priceEnv] : undefined;
  if (!priceId) throw new Error(`Missing Stripe price env for track: ${trackSlug}`);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://www.sageideas.dev/academy/my-courses?verification=success',
    cancel_url: 'https://www.sageideas.dev/academy?verification=cancelled',
    customer_email: `academy-verification+${Date.now()}@sageideas.dev`,
    metadata: {
      kind: 'academy',
      track_slug: trackSlug,
      product_name: `${trackSlug} verification`,
    },
    payment_intent_data: { metadata: { kind: 'academy', track_slug: trackSlug } },
  });
  console.log(`created_session=${session.id}`);
  console.log(`session_mode=${session.livemode ? 'live' : 'test'}`);
  console.log(`checkout_url_available=${Boolean(session.url)}`);
  await stripe.checkout.sessions.expire(session.id);
  console.log(`expired_session=${session.id}`);
}

if (sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log(`session=${session.id}`);
  console.log(`payment_status=${session.payment_status}`);
  console.log(`livemode=${session.livemode}`);
  console.log(`metadata_kind=${session.metadata?.kind ?? ''}`);
  console.log(`metadata_track=${session.metadata?.track_slug ?? ''}`);

  const { data, error } = await supabase
    .from('academy_enrollments')
    .select('id, email, track_slug, status, created_at, stripe_checkout_session_id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  if (error) throw new Error(`enrollment lookup failed: ${error.message}`);
  if (!data) {
    console.log('enrollment_found=false');
    if (session.payment_status === 'paid') process.exitCode = 2;
  } else {
    console.log('enrollment_found=true');
    console.log(`enrollment_status=${data.status}`);
    console.log(`enrollment_track=${data.track_slug}`);
  }
}

if (!args.size && !sessionId) {
  console.log('Usage:');
  console.log('  npm run verify:academy-commerce -- --config');
  console.log('  npm run verify:academy-commerce -- --create-expiring-session --track=ai-native-product-building');
  console.log('  STRIPE_CHECKOUT_SESSION_ID=cs_... npm run verify:academy-commerce');
}

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const raw = readFileSync(file, 'utf8');
  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    let value = trimmed.slice(index + 1);
    value = value.replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}
