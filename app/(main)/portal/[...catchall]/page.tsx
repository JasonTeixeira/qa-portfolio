import { notFound } from 'next/navigation';

// Belt-and-suspenders fallback. The request proxy rewrites unknown /portal/*
// routes to /portal/__not_found__ with status: 404 — but if that ever
// fails to fire (e.g. local dev with the proxy disabled), this
// page surfaces the not-found UI rather than a blank screen.
export default function PortalCatchAll() {
  notFound();
}
