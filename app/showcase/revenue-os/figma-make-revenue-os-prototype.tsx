'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BarChart2,
  Bell, Building2, ChevronRight, CircleDot, Clock,
  Filter, Inbox, LayoutDashboard, Layers, Mail,
  MessageSquare, Phone, Plus, RefreshCw, Search, Send,
  Settings, Sparkles, Target, User, Users, Zap,
  CheckCircle2, XCircle, Globe, Check, Play, X,
  Calendar, ExternalLink,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Screen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type BadgeVariant = "green" | "cyan" | "amber" | "red" | "default" | "muted";

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
}

function useTypewriter(text: string, speed = 12, active = false) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) { setOut(""); return; }
    let i = 0;
    setOut("");
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return out;
}

// ─── Primitive Components ─────────────────────────────────────────────────────

function Badge({ children, variant = "default" }: { children: ReactNode; variant?: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    green: "bg-primary/15 text-primary border-primary/30",
    cyan: "bg-accent/15 text-accent border-accent/30",
    amber: "bg-amber-400/15 text-amber-400 border-amber-400/30",
    red: "bg-red-400/15 text-red-400 border-red-400/30",
    default: "bg-white/10 text-foreground border-white/10",
    muted: "bg-white/5 text-muted-foreground border-white/8",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider border ${cls[variant]}`}>
      {children}
    </span>
  );
}

function Score({ val }: { val: number }) {
  const c = val >= 90 ? "text-primary" : val >= 80 ? "text-accent" : val >= 70 ? "text-amber-400" : "text-red-400";
  return <span className={`font-mono font-bold text-sm ${c}`}>{val}</span>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">{children}</div>;
}

function Hr() { return <div className="h-px bg-white/5 my-4" />; }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1318] border border-white/12 rounded-lg px-3 py-2.5 shadow-2xl text-xs">
      {label && <div className="font-mono text-muted-foreground mb-2 text-[10px] uppercase tracking-wider">{label}</div>}
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.stroke || p.fill || p.color }} />
            <span className="text-muted-foreground">{p.name || p.dataKey}</span>
            <span className="font-mono text-foreground ml-auto pl-6">
              {typeof p.value === "number" && p.value > 999
                ? `$${(p.value / 1000).toFixed(0)}K`
                : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedMetricCard({ label, value, prefix = "", suffix = "", sub, trend, variant = "default" }: {
  label: string; value: number; prefix?: string; suffix?: string;
  sub?: string; trend?: string; variant?: "default" | "green" | "cyan" | "amber" | "red";
}) {
  const count = useCountUp(value);
  const border = { default: "border-white/8", green: "border-primary/25", cyan: "border-accent/25", amber: "border-amber-400/25", red: "border-red-400/25" };
  const valColor = { default: "text-foreground", green: "text-primary", cyan: "text-accent", amber: "text-amber-400", red: "text-red-400" };
  const formatted = prefix + count.toLocaleString() + suffix;
  return (
    <div className={`bg-card rounded-lg border ${border[variant]} p-4`}>
      <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-mono font-bold ${valColor[variant]}`}>{formatted}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
      {trend && (
        <div className="text-[11px] text-primary mt-1 flex items-center gap-1">
          <ArrowUpRight size={10} />{trend}
        </div>
      )}
    </div>
  );
}

// ─── AI Briefing Drawer ───────────────────────────────────────────────────────

const BRIEFING = `SAGE IDEAS · REVENUE OS
Daily AI Briefing — Mon Jun 22, 2026
────────────────────────────────────

PIPELINE SUMMARY

Your pipeline sits at $84,200 across 184 active opportunities — up 18% from last Monday. LinkedIn outbound continues to outperform all other channels with $52K in attributable pipeline at a $190 CPO.

────────────────────────────────────

TODAY'S PRIORITY ACTIONS

① APEX DENTAL GROUP  [Score: 94]
  They viewed your pricing page twice this week.
  → Book a discovery call today.
  Risk: Every day without contact drops close
  probability by ~8%.

② NORTHSTAR LOGISTICS  [Score: 91]
  Sarah Wren opened your last email 4 times.
  → Send the ops audit template now.

③ 9 UNCLASSIFIED REPLIES
  Revenue at risk: $14,200.
  AI auto-classify confidence: 82% — human
  review recommended before actioning.

────────────────────────────────────

REVENUE AT RISK

$18,400 in pipeline has gone 7+ days without
contact. Beacon Law ($9,600) and Summit Wealth
($11,000) are the highest-value stale accounts.
Both show zero engagement in the last 6 days.

────────────────────────────────────

CAMPAIGN RECOMMENDATION

Scale the Revenue OS Demo campaign immediately.
It is producing revenue at $190/opportunity —
32% below your CPO benchmark. Current budget
can support a 40% volume increase without
compromising message quality.

────────────────────────────────────

End of briefing.
Next update: Tue Jun 23 · 7:00 AM`;

function AiBriefingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const text = useTypewriter(BRIEFING, 8, open);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [text]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-[#0e1217] border-l border-white/8 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">AI Briefing</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-mono text-primary">LIVE</span>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X size={13} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="text-[12px] text-foreground font-mono leading-relaxed whitespace-pre-wrap">
                {text}
                {text.length < BRIEFING.length && (
                  <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
                )}
              </pre>
              <div ref={endRef} />
            </div>
            <div className="border-t border-white/8 p-4 flex gap-2 flex-shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-primary text-[#080A0D] text-xs font-bold hover:bg-primary/90 transition-colors">
                <ArrowRight size={12} />Work Today&apos;s Queue
              </button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Dismiss
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── CTA Modal ────────────────────────────────────────────────────────────────

function CtaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "" });

  const handleSubmit = () => {
    if (form.name && form.email) setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={onClose}
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111418] border border-white/12 rounded-xl w-[480px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {!submitted ? (
                <>
                  <div className="px-6 pt-6 pb-4 border-b border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
                          <Zap size={13} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Book a Revenue OS Build Call</span>
                      </div>
                      <button onClick={onClose} className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <X size={13} className="text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Tell us about your business and we&apos;ll set up a 30-minute call to map out your custom Revenue OS.
                    </p>
                  </div>

                  <div className="p-6 space-y-3">
                    {[
                      { label: "Your Name", key: "name", placeholder: "Jane Smith" },
                      { label: "Company", key: "company", placeholder: "Acme Corp" },
                      { label: "Work Email", key: "email", placeholder: "jane@acme.com" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">{f.label}</label>
                        <input
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-white/8 transition-colors"
                        />
                      </div>
                    ))}

                    <div className="pt-2 space-y-2">
                      <button
                        onClick={handleSubmit}
                        className="w-full py-3 rounded-md bg-primary text-[#080A0D] text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Calendar size={14} />Book My Revenue OS Call
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-md bg-white/5 border border-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Request a demo instead →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 size={24} className="text-primary" />
                  </motion.div>
                  <div className="text-lg font-bold text-foreground mb-2">You&apos;re on the list.</div>
                  <div className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    We&apos;ll reach out to {form.email || "you"} within 24 hours to schedule your Revenue OS build call.
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-md bg-white/8 border border-white/10 text-sm text-foreground hover:bg-white/12 transition-colors"
                  >
                    Back to prototype
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: 1, label: "Command Center", icon: LayoutDashboard },
  { id: 2, label: "Lead Queue", icon: Users },
  { id: 3, label: "Account Detail", icon: Building2 },
  { id: 4, label: "Outreach Composer", icon: Send },
  { id: 5, label: "Reply Inbox", icon: Inbox, badge: 9 },
  { id: 6, label: "Pipeline Analytics", icon: BarChart2 },
  { id: 7, label: "Campaign Perf.", icon: Target },
  { id: 8, label: "Build for My Business", icon: Zap },
] as const;

function Sidebar({ active, setScreen }: { active: Screen; setScreen: (s: Screen) => void }) {
  return (
    <div className="w-[196px] flex-shrink-0 bg-[#0C0F13] border-r border-white/5 flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Zap size={13} className="text-[#080A0D]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground tracking-tight leading-none">REVENUE OS</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Sage Ideas</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <SectionLabel>Navigation</SectionLabel>
        {NAV.map((item) => {
          const Icon = item.icon;
          const on = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5 text-left transition-all group ${
                on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={13} className={`flex-shrink-0 ${on ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span className="text-[11px] font-medium flex-1 truncate">{item.label}</span>
              {"badge" in item && (item as { badge?: number }).badge ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-400/20 text-red-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                >
                  {(item as { badge?: number }).badge}
                </motion.span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User size={11} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-foreground truncate">Sage Ideas</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
          <Settings size={11} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

const TITLES: Record<Screen, string> = {
  1: "Executive Command Center",
  2: "Lead Intelligence Queue",
  3: "Account Detail — Apex Dental Group",
  4: "Outreach Composer",
  5: "Follow-Up & Reply Inbox",
  6: "Pipeline Analytics",
  7: "Campaign Performance",
  8: "Build for My Business",
};

function TopBar({ screen, onBriefing }: { screen: Screen; onBriefing: () => void }) {
  return (
    <div className="h-12 border-b border-white/5 bg-[#0C0F13] flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={screen}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-[13px] font-semibold text-foreground block"
          >
            {TITLES[screen]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono flex-shrink-0">
        <CircleDot size={8} className="text-primary" />
        <span>Live · Jun 22, 2026</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors border border-white/8">
          <RefreshCw size={10} />Sync
        </button>
        <button
          onClick={onBriefing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-[#080A0D] text-[11px] font-bold hover:bg-primary/90 transition-colors"
        >
          <Sparkles size={11} />Run AI Briefing
        </button>
        <div className="relative cursor-pointer">
          <Bell size={14} className="text-muted-foreground hover:text-foreground transition-colors" />
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 1: Executive Command Center ──────────────────────────────────────

function CommandCenter({ setScreen }: { setScreen: (s: Screen) => void }) {
  const queue = [
    { n: 1, text: "Call Apex Dental — viewed pricing page twice this week", badge: "HOT", v: "green" as BadgeVariant },
    { n: 2, text: "Send ops audit to Northstar Logistics — buying signal detected", badge: "INTENT", v: "cyan" as BadgeVariant },
    { n: 3, text: "Follow up with Lumos Agency — no reply in 4 days", badge: "FOLLOW-UP", v: "amber" as BadgeVariant },
    { n: 4, text: "Classify 9 unread replies before Monday momentum is lost", badge: "URGENT", v: "red" as BadgeVariant },
    { n: 5, text: "Review Beacon Law proposal — open 6 days, no response", badge: "AT RISK", v: "amber" as BadgeVariant },
  ];

  const stages = [
    { label: "Hot Leads", count: 37, value: "$31.2K", color: "text-primary" },
    { label: "Outreach Sent", count: 156, value: "$48.6K", color: "text-accent" },
    { label: "Replies", count: 61, value: "$52.1K", color: "text-accent" },
    { label: "Calls Booked", count: 14, value: "$29.4K", color: "text-primary" },
    { label: "Proposals Out", count: 8, value: "$84.2K", color: "text-amber-400" },
    { label: "Won — June", count: 3, value: "$22.8K", color: "text-primary" },
  ];

  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <AnimatedMetricCard label="Pipeline Value" value={84200} prefix="$" sub="184 active opportunities" trend="+22% AI lift" variant="green" />
        <AnimatedMetricCard label="Hot Leads Today" value={37} sub="Fit score 85+" variant="cyan" />
        <AnimatedMetricCard label="Follow-Ups Due" value={14} sub="SLA window: today" variant="amber" />
        <AnimatedMetricCard label="Revenue at Risk" value={18400} prefix="$" sub="Stale 7+ days" variant="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-card rounded-lg border border-white/8 p-4">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>AI Priority Queue — Today</SectionLabel>
              <Badge variant="green">5 actions</Badge>
            </div>
            <div className="space-y-2">
              {queue.map((item, i) => (
                <motion.div
                  key={item.n}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.2 }}
                  className="flex items-center gap-3 p-3 rounded-md bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/5 cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded bg-white/8 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">{item.n}</span>
                  </div>
                  <div className="flex-1 text-xs text-foreground">{item.text}</div>
                  <Badge variant={item.v}>{item.badge}</Badge>
                  <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => setScreen(2)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-[#080A0D] text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Work Today&apos;s Queue <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Pipeline Stage Summary</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {stages.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="p-3 bg-white/[0.03] rounded-md border border-white/5"
                >
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
                  <div className={`text-xl font-mono font-bold ${s.color}`}>{s.count}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-primary/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-primary" />
              <SectionLabel>AI Recommendations</SectionLabel>
            </div>
            <div className="space-y-2.5">
              {[
                { color: "primary", label: "Scale Campaign", text: "LinkedIn outbound producing $52K pipeline at $190 CPO — increase send volume 40%" },
                { color: "accent", label: "Enrich Now", text: "12 leads from last week have no company data — enrichment could uncover 3-4 qualified accounts" },
                { color: "amber", label: "At Risk", text: "Beacon Law proposal open 6 days — send pricing alternative before window closes" },
              ].map((r) => (
                <div key={r.label} className={`p-3 rounded-md ${r.color === "primary" ? "bg-primary/8 border border-primary/15" : r.color === "accent" ? "bg-accent/8 border border-accent/15" : "bg-amber-400/8 border border-amber-400/15"}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${r.color === "primary" ? "text-primary" : r.color === "accent" ? "text-accent" : "text-amber-400"}`}>{r.label}</div>
                  <div className="text-[11px] text-foreground">{r.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Booked Calls — This Week</SectionLabel>
            <div className="space-y-2">
              {[
                { name: "Apex Dental Group", time: "Mon 10:00 AM", type: "Discovery" },
                { name: "Northstar Logistics", time: "Tue 2:30 PM", type: "Demo" },
                { name: "Cascade Partners", time: "Wed 11:00 AM", type: "Proposal" },
                { name: "Ridgeline Media", time: "Thu 3:00 PM", type: "Discovery" },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-2 p-2 rounded bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer">
                  <Phone size={11} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.time}</div>
                  </div>
                  <Badge variant="muted">{c.type}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Replies Needing Action</SectionLabel>
            <div className="text-3xl font-mono font-bold text-red-400 mb-1">
              <span>{useCountUp(9, 800)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mb-3">Unclassified in inbox</div>
            <button
              onClick={() => setScreen(5)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-white/8 text-xs text-foreground hover:bg-white/12 transition-colors border border-white/10"
            >
              <Inbox size={11} />Open Reply Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Lead Intelligence Queue ───────────────────────────────────────

const LEADS = [
  { company: "Apex Dental Group", contact: "Dr. Marcus Cole", role: "CEO / Practice Owner", score: 94, source: "Website", intent: "Requested automation help", touch: "1d ago", action: "Book discovery call", value: "$8,400", tag: "Hot" },
  { company: "Northstar Logistics", contact: "Sarah Wren", role: "VP Operations", score: 91, source: "LinkedIn", intent: "Viewed pricing page twice", touch: "2d ago", action: "Send ops audit", value: "$12,200", tag: "Hot" },
  { company: "Lumos Agency", contact: "Felipe Torres", role: "Founder", score: 88, source: "Referral", intent: "Hiring SDRs — scaling now", touch: "4d ago", action: "Pitch Revenue OS", value: "$6,800", tag: "Follow-Up Due" },
  { company: "Beacon Law", contact: "Amanda Pierce", role: "Managing Partner", score: 84, source: "Newsletter", intent: "Downloaded AI compliance guide", touch: "6d ago", action: "Send compliance workflow", value: "$9,600", tag: "Proposal" },
  { company: "Halcyon Health", contact: "Dr. Priya Sharma", role: "CEO", score: 81, source: "Website", intent: "Booked then canceled — rebook", touch: "5d ago", action: "Re-book discovery", value: "$9,800", tag: "Follow-Up Due" },
  { company: "Ridgeline Media", contact: "Jordan Hartwell", role: "Head of Growth", score: 79, source: "LinkedIn", intent: "Commented on AI automation post", touch: "3d ago", action: "Send cold sequence", value: "$5,200", tag: "Ready to Contact" },
  { company: "Summit Wealth Advisors", contact: "Christine Park", role: "Director, Client Dev", score: 76, source: "Ad Campaign", intent: "Downloaded lead scoring guide", touch: "8d ago", action: "Re-engage with case study", value: "$11,000", tag: "Stale" },
  { company: "Cascade Partners", contact: "Noel Burton", role: "COO", score: 73, source: "Cold List", intent: "No signal — needs research", touch: "12d ago", action: "Enrich & score", value: "$7,400", tag: "Needs Research" },
];

const FILTERS = ["All", "Hot", "Needs Research", "Ready to Contact", "Follow-Up Due", "Stale", "Proposal"];

function tagV(tag: string): BadgeVariant {
  if (tag === "Hot") return "green";
  if (tag === "Follow-Up Due") return "amber";
  if (tag === "Proposal") return "cyan";
  if (tag === "Stale") return "red";
  return "muted";
}

function LeadQueue({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [filter, setFilter] = useState("All");
  const [hovered, setHovered] = useState<number | null>(null);
  const visible = filter === "All" ? LEADS : LEADS.filter((l) => l.tag === filter);

  return (
    <div className="flex-1 overflow-auto p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-card border border-white/8 rounded-md px-3 py-2">
          <Search size={12} className="text-muted-foreground" />
          <input className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none" placeholder="Search leads by company, contact, intent signal..." />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-card border border-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Filter size={11} />Filters
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-[#080A0D] text-xs font-bold hover:bg-primary/90 transition-colors">
          <Plus size={11} />Add Lead
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors border ${
              filter === f ? "bg-primary/12 text-primary border-primary/30" : "bg-card border-white/8 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-3 text-[11px] font-mono text-muted-foreground">{visible.length} leads</div>
      </div>

      {/* Fixed table with horizontal scroll safety */}
      <div className="bg-card rounded-lg border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/8">
                {["Company / Contact", "Role", "Score", "Source", "Intent Signal", "Last Touch", "Rec. Action", "Value", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((l, i) => (
                <motion.tr
                  key={l.company}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setScreen(3)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={`border-b border-white/[0.04] cursor-pointer transition-colors ${
                    i === 0 ? "bg-primary/[0.03]" : ""
                  } ${hovered === i ? "bg-white/[0.04]" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-foreground whitespace-nowrap">{l.company}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{l.contact}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">{l.role}</td>
                  <td className="px-4 py-3"><Score val={l.score} /></td>
                  <td className="px-4 py-3"><Badge variant="muted">{l.source}</Badge></td>
                  <td className="px-4 py-3 text-[11px] text-foreground">{l.intent}</td>
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">{l.touch}</td>
                  <td className="px-4 py-3">
                    {hovered === i ? (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-[#080A0D] text-[10px] font-bold whitespace-nowrap"
                        onClick={(e) => { e.stopPropagation(); setScreen(3); }}
                      >
                        Open <ArrowRight size={9} />
                      </motion.button>
                    ) : (
                      <span className="text-[11px] text-foreground">{l.action}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-primary whitespace-nowrap">{l.value}</td>
                  <td className="px-4 py-3"><Badge variant={tagV(l.tag)}>{l.tag}</Badge></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Account Detail ─────────────────────────────────────────────────

const TIMELINE = [
  { date: "Jun 22", text: "Viewed pricing page — 4m 12s session", type: "signal" },
  { date: "Jun 21", text: "Opened outreach email — 3 times", type: "signal" },
  { date: "Jun 19", text: "Initial cold email sent via LinkedIn", type: "outreach" },
  { date: "Jun 17", text: "Contact added from website form", type: "lead" },
  { date: "Jun 15", text: "Website visit — /services/automation", type: "signal" },
  { date: "Jun 12", text: "LinkedIn connection request accepted", type: "outreach" },
];

const STAGES = ["Captured", "Enriched", "Scored", "Outreach Sent", "Reply", "Call Booked", "Proposal", "Won"];

function AccountDetail({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-white/8 bg-card px-5 py-4 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-sm font-bold text-foreground">Apex Dental Group</h2>
              <Badge variant="green">94 FIT SCORE</Badge>
              <Badge variant="cyan">MULTI-LOCATION</Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              <span>Dr. Marcus Cole, CEO</span><span className="hidden sm:inline">·</span>
              <span>apex-dental.com</span><span className="hidden sm:inline">·</span>
              <span>Nashville, TN</span><span className="hidden sm:inline">·</span>
              <span className="text-accent">3 locations · ~$4M revenue</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Deal Estimate</div>
            <div className="text-2xl font-mono font-bold text-primary">$8,400</div>
            <div className="text-[10px] text-muted-foreground">/year</div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => setScreen(4)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-[#080A0D] text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              <Send size={11} />Generate Outreach
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/8 border border-white/10 text-xs text-foreground hover:bg-white/12 transition-colors">
              <Phone size={11} />Book Discovery
            </button>
          </div>
        </div>

        {/* Stage progress — scrollable */}
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono ${
                  i <= 3 ? "bg-primary/12 text-primary border border-primary/25" : "bg-white/5 text-muted-foreground border border-white/8"
                }`}>
                  {i <= 3 && <Check size={8} />}{s}
                </div>
                {i < STAGES.length - 1 && <ChevronRight size={9} className="text-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-5">
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Business Snapshot</SectionLabel>
            <div className="space-y-2">
              {[
                ["Industry", "Dental / Healthcare"],
                ["Revenue", "~$4M ARR"],
                ["Team", "24 employees"],
                ["Locations", "3 active"],
                ["Tech Stack", "Dentrix, Google Ads"],
                ["Growth Signal", "Hiring front desk staff"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-muted-foreground w-24 flex-shrink-0">{k}</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Pain Signals</SectionLabel>
            <div className="space-y-2">
              {[
                "No automated follow-up for web inquiries",
                "Patient referrals tracked in a spreadsheet",
                "Cannot attribute patient acquisition from ads",
                "Front desk manually calls back web leads",
              ].map((p) => (
                <div key={p} className="flex gap-2 text-[11px]">
                  <AlertTriangle size={10} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Decision Maker Map</SectionLabel>
            <div className="space-y-2">
              {[
                { name: "Dr. Marcus Cole", role: "CEO — Decision Maker", v: "green" as BadgeVariant, label: "Primary" },
                { name: "Rachel Kim", role: "Office Manager", v: "muted" as BadgeVariant, label: "Influencer" },
                { name: "TBD", role: "IT / Operations", v: "muted" as BadgeVariant, label: "Evaluator" },
              ].map((d) => (
                <div key={d.name} className="flex items-center gap-2 p-2 rounded bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={10} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-foreground truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground">{d.role}</div>
                  </div>
                  <Badge variant={d.v}>{d.label}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-white/8 p-4 h-fit">
          <SectionLabel>Engagement Timeline</SectionLabel>
          <div className="space-y-3 mb-4">
            {TIMELINE.map((t, i) => {
              const dot = t.type === "signal" ? "bg-primary" : t.type === "outreach" ? "bg-accent" : "bg-white/30";
              return (
                <motion.div
                  key={t.date + t.text}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-3"
                >
                  <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0 mt-1.5`} />
                  <div className="flex-1 pb-3 border-b border-white/[0.04]">
                    <div className="text-[11px] text-foreground">{t.text}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.date}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <Hr />
          <SectionLabel>Objections to Expect</SectionLabel>
          <div className="space-y-2">
            {["Already using Dentrix CRM", "Unsure ROI applies to dental", "Worried about staff adoption"].map((o) => (
              <div key={o} className="flex gap-2 text-[11px]">
                <XCircle size={10} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{o}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-primary/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-primary" />
              <SectionLabel>AI Research Brief</SectionLabel>
            </div>
            <div className="text-[11px] text-foreground leading-relaxed bg-primary/5 border border-primary/15 rounded-md p-3">
              Apex Dental Group appears to be scaling multi-location operations. Their site emphasizes patient acquisition and appointment volume, but there is no visible automated lead follow-up path. Recommend positioning Revenue OS as a patient inquiry and referral follow-up engine with call tracking, SMS/email routing, and dashboard proof.
            </div>
          </div>

          <div className="bg-card rounded-lg border border-white/8 p-4">
            <SectionLabel>Recommended Offer</SectionLabel>
            <div className="p-3 bg-white/[0.03] rounded-md border border-white/5 mb-3">
              <div className="text-xs font-semibold text-foreground mb-1">Patient Inquiry Automation Bundle</div>
              <div className="text-[11px] text-muted-foreground">Automated follow-up for web inquiries, referral tracking, call attribution, and monthly reporting.</div>
              <div className="mt-2 text-xs font-mono text-primary">$699/mo · 3-month pilot</div>
            </div>
            <SectionLabel>Proof Assets to Use</SectionLabel>
            <div className="space-y-1.5">
              {["Healthcare case study — 3x reply rate", "Multi-location dashboard screenshot", "Referral attribution flow demo"].map((p) => (
                <div key={p} className="flex gap-2 text-[11px]">
                  <CheckCircle2 size={10} className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-accent/15 p-4">
            <SectionLabel>Similar Client Pattern</SectionLabel>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Riverdale Med Spa</span> — Similar multi-location service business. Closed in 14 days after personalized demo. Deal: $9,200/yr.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Outreach Composer ─────────────────────────────────────────────

const EMAIL_BODY = `Hi Marcus,

I noticed Apex Dental has expanded to three locations — congrats on the growth.

Most practices your size share the same challenge: patient inquiries come in through the website, Google Ads, and referrals, but the follow-up is manual and inconsistent. When a prospect doesn't hear back within the hour, they book elsewhere.

We built Revenue OS specifically for growing service businesses. For a dental group like yours, it means:

→ Instant automated follow-up for every web inquiry
→ Referral tracking that shows which patients drive new business
→ A dashboard proving which ads are actually producing bookings

Riverdale Med Spa (similar size, Nashville) went from 11% to 34% web inquiry conversion in 60 days.

Worth a 15-minute look? I can show you exactly what this looks like for a 3-location practice.

— [Your name]
Sage Ideas`;

const LINKEDIN_DM = `Hi Marcus — congrats on the 3rd location.

Quick question: how are you handling patient inquiry follow-up across all three sites right now? Most practices at this stage are still doing it manually, which means missed revenue.

We built an automated follow-up system specifically for multi-location healthcare groups. Happy to show you a quick demo if useful.`;

function OutreachComposer({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [tab, setTab] = useState<"email" | "linkedin">("email");
  const [approved, setApproved] = useState(false);

  const subjects = [
    { label: "Direct", text: "Apex Dental — automated patient follow-up in 30 days" },
    { label: "Curiosity", text: "How 3-location dental practices are recovering $40K in missed revenue" },
    { label: "Proof", text: "Case study: Multi-location dental group · 3x appointment bookings" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Left context — fixed, no overflow issues */}
      <div className="w-[196px] border-r border-white/8 p-4 flex-shrink-0 overflow-y-auto bg-[#0C0F13]">
        <SectionLabel>Composing For</SectionLabel>
        <div className="p-3 bg-card rounded-md border border-white/8 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
              <Building2 size={10} className="text-primary" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-foreground">Apex Dental Group</div>
              <div className="text-[10px] text-muted-foreground">Dr. Marcus Cole</div>
            </div>
          </div>
          <div className="space-y-1">
            {[["Fit Score", "94", "text-primary"], ["Est. Value", "$8,400", "text-primary"], ["Source", "Website", "text-foreground"]].map(([k, v, c]) => (
              <div key={k} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{k}</span>
                <span className={`font-mono ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <SectionLabel>Key Angles</SectionLabel>
        <div className="space-y-1.5 mb-4">
          {["Multi-location scaling", "Patient inquiry automation", "Referral attribution gap", "Manual follow-up cost"].map((a) => (
            <div key={a} className="flex gap-1.5 text-[11px]">
              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-muted-foreground">{a}</span>
            </div>
          ))}
        </div>
        <SectionLabel>Tokens</SectionLabel>
        <div className="space-y-1">
          {[["{{name}}", "Marcus"], ["{{company}}", "Apex Dental"], ["{{locations}}", "3"], ["{{pain}}", "manual follow-up"], ["{{proof}}", "Riverdale"]].map(([t, v]) => (
            <div key={t} className="flex gap-2 text-[10px]">
              <span className="font-mono text-accent">{t}</span>
              <span className="text-muted-foreground">→ {v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center — flex-1 */}
      <div className="flex-1 overflow-y-auto p-5 min-w-0">
        <div className="flex gap-1 mb-4">
          {(["email", "linkedin"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border transition-colors ${
                tab === t ? "bg-primary/12 text-primary border-primary/30" : "bg-card border-white/8 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "email" ? <Mail size={11} /> : <MessageSquare size={11} />}
              {t === "email" ? "Email" : "LinkedIn DM"}
            </button>
          ))}
        </div>

        {tab === "email" && (
          <>
            <div className="mb-4">
              <SectionLabel>Subject Line Variants</SectionLabel>
              <div className="space-y-2">
                {subjects.map((s, i) => (
                  <div key={s.label} className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-all hover:scale-[1.005] ${
                    i === 0 ? "bg-primary/8 border-primary/20" : "bg-card border-white/8 hover:border-white/15"
                  }`}>
                    <Badge variant={i === 0 ? "green" : "muted"}>{s.label}</Badge>
                    <span className={`text-xs ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <SectionLabel>Email Body</SectionLabel>
              <textarea
                defaultValue={EMAIL_BODY}
                className="w-full bg-card border border-white/8 rounded-md p-4 text-xs text-foreground font-sans leading-relaxed resize-none focus:border-primary/40 focus:outline-none transition-colors"
                rows={18}
              />
            </div>
          </>
        )}

        {tab === "linkedin" && (
          <div className="mb-4">
            <SectionLabel>LinkedIn DM</SectionLabel>
            <textarea
              defaultValue={LINKEDIN_DM}
              className="w-full bg-card border border-white/8 rounded-md p-4 text-xs text-foreground font-sans leading-relaxed resize-none focus:border-primary/40 focus:outline-none transition-colors"
              rows={10}
            />
          </div>
        )}

        <SectionLabel>Follow-Up Sequence Preview</SectionLabel>
        <div className="space-y-2">
          {[
            { day: "Day 3", subject: "Quick follow-up — Apex Dental patient inquiry system", preview: "Marcus, just checking in — did you get a chance to look at..." },
            { day: "Day 7", subject: "One more thought — 15-min workflow audit offer", preview: "Happy to run a free 15-minute workflow audit for Apex Dental..." },
          ].map((f) => (
            <div key={f.day} className="p-3 rounded-md bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="muted">{f.day}</Badge>
                <span className="text-[11px] text-foreground">{f.subject}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{f.preview}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right controls — fixed */}
      <div className="w-[180px] border-l border-white/8 p-4 flex-shrink-0 overflow-y-auto bg-[#0C0F13]">
        <SectionLabel>Tone</SectionLabel>
        <div className="space-y-1.5 mb-4">
          {["Consultative", "Direct ROI", "Case Study Led"].map((t, i) => (
            <button key={t} className={`w-full text-left px-2.5 py-2 rounded text-[11px] border transition-colors ${
              i === 0 ? "bg-primary/10 border-primary/25 text-primary" : "bg-white/[0.03] border-white/8 text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
          ))}
        </div>
        <SectionLabel>Compliance</SectionLabel>
        <div className="space-y-1.5 mb-4">
          {["CAN-SPAM compliant", "No spam triggers", "Unsubscribe included", "GDPR opt-in verified"].map((c) => (
            <div key={c} className="flex items-center gap-1.5 text-[10px]">
              <CheckCircle2 size={10} className="text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{c}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-[11px] text-muted-foreground hover:text-foreground transition-colors">Save Draft</button>
          <button className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-[11px] text-muted-foreground hover:text-foreground transition-colors">Add to Sequence</button>
          <button className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-[11px] text-muted-foreground hover:text-foreground transition-colors">Preview Follow-Up</button>
          <button
            onClick={() => { setApproved(true); setTimeout(() => setScreen(5), 700); }}
            className={`w-full px-3 py-2.5 rounded text-[11px] font-bold transition-all ${
              approved ? "bg-primary/50 text-[#080A0D]" : "bg-primary text-[#080A0D] hover:bg-primary/90"
            }`}
          >
            {approved ? "✓ Approved" : "Approve for Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5: Reply Inbox ────────────────────────────────────────────────────

const REPLIES = [
  { company: "Apex Dental Group", contact: "Dr. Marcus Cole", preview: "This sounds interesting. Can you send examples...", time: "2h ago", category: "Interested", cv: "green" as BadgeVariant, unread: true, body: `Hi,\n\nThis sounds interesting. Can you send examples of what this looks like for a service business? Specifically curious how the dashboard handles multiple locations.\n\nAlso — what does implementation look like timeline-wise? We're pretty slammed right now.\n\nThanks,\nMarcus` },
  { company: "Northstar Logistics", contact: "Sarah Wren", preview: "Can you send pricing? We're evaluating a few...", time: "5h ago", category: "Needs Pricing", cv: "cyan" as BadgeVariant, unread: true, body: `Hi,\n\nCan you send pricing? We're evaluating a few vendors right now and want to include you in the comparison.\n\nSarah` },
  { company: "Lumos Agency", contact: "Felipe Torres", preview: "Not the right time — reach out in Q4", time: "1d ago", category: "Not Now", cv: "amber" as BadgeVariant, unread: false, body: `Hey,\n\nNot the right time right now — we're heads down on a rebrand. Reach out in Q4 and let's revisit.\n\nFelipe` },
  { company: "Summit Wealth Advisors", contact: "Christine Park", preview: "Do you work with financial advisors?", time: "2d ago", category: "Interested", cv: "green" as BadgeVariant, unread: false, body: `Hi,\n\nDo you work with financial advisors? We have about 200 prospects in our pipeline with no good follow-up system.\n\nChristine` },
  { company: "Unknown", contact: "user@domain.com", preview: "Please remove me from your list", time: "3d ago", category: "Unsubscribe", cv: "red" as BadgeVariant, unread: false, body: "Please remove me from your list." },
  { company: "Ridgeline Media", contact: "Jordan Hartwell", preview: "Can you clarify how the AI part works?", time: "3d ago", category: "Human Review", cv: "default" as BadgeVariant, unread: false, body: `Hey,\n\nInteresting — can you clarify how the AI part works? We're a bit skeptical of automation tools that overpromise.\n\nJordan` },
];

const DRAFT = `Hi Marcus,

Great question — here are two screenshots of what Revenue OS looks like for a 3-location service business:

[Screenshot 1: Multi-location dashboard overview]
[Screenshot 2: Inquiry follow-up automation flow]

For timeline: we do a lightweight 6-8 week pilot. Setup is mostly on our side — we connect to your existing tools and you start seeing data within the first week.

Worth a 15-minute walkthrough to see it live?

— [Your name]`;

function ReplyInbox({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [sel, setSel] = useState(0);
  const [draft, setDraft] = useState(DRAFT);
  const cur = REPLIES[sel];

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Inbox */}
      <div className="w-[232px] border-r border-white/8 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2 bg-card border border-white/8 rounded-md px-2.5 py-1.5">
            <Search size={11} className="text-muted-foreground" />
            <input className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none" placeholder="Search replies..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {REPLIES.map((r, i) => (
            <div
              key={i}
              onClick={() => { setSel(i); setDraft(DRAFT); }}
              className={`p-3 border-b border-white/[0.04] cursor-pointer transition-colors ${sel === i ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {r.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" />}
                  <span className={`text-[11px] font-semibold truncate ${r.unread ? "text-foreground" : "text-muted-foreground"}`}>{r.company}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{r.time}</span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate mb-1.5">{r.preview}</div>
              <Badge variant={r.cv}>{r.category}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="border-b border-white/8 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-semibold text-foreground">{cur.company}</div>
            <div className="text-xs text-muted-foreground">{cur.contact}</div>
          </div>
          <Badge variant={cur.cv}>{cur.category}</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-muted-foreground" />
            </div>
            <div>
              <div className="bg-white/[0.06] border border-white/8 rounded-lg p-3 mb-1">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{cur.body}</pre>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">{cur.time}</div>
            </div>
          </div>
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="bg-primary/[0.06] border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={10} className="text-primary" />
                  <span className="text-[10px] text-primary font-mono uppercase tracking-wider">AI Draft — click to edit</span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-transparent text-xs text-foreground font-sans leading-relaxed resize-none outline-none min-h-[160px]"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 p-3 flex gap-2 flex-shrink-0">
          <button className="px-3 py-2 rounded bg-white/5 border border-white/8 text-xs text-muted-foreground hover:text-foreground transition-colors">Discard</button>
          <div className="flex-1" />
          <button className="px-4 py-2 rounded bg-white/8 border border-white/10 text-xs text-foreground hover:bg-white/12 transition-colors">Save Draft</button>
          <button className="px-4 py-2 rounded bg-primary text-[#080A0D] text-xs font-bold hover:bg-primary/90 transition-colors">Send Reply</button>
        </div>
      </div>

      {/* AI Panel */}
      <div className="w-[212px] border-l border-white/8 p-4 overflow-y-auto flex-shrink-0 bg-[#0C0F13]">
        <div className="bg-card rounded-lg border border-primary/20 p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={11} className="text-primary" />
            <span className="text-[10px] text-primary font-mono uppercase tracking-wider">AI Rec.</span>
          </div>
          <div className="text-[11px] text-foreground leading-relaxed">
            Send 2-screen service business demo and offer 15-min workflow audit. Highlight multi-location dashboard. Mention Riverdale Med Spa. Timeline: &quot;6-8 week pilot, low-touch.&quot;
          </div>
        </div>
        <SectionLabel>Classification</SectionLabel>
        <div className="space-y-1 mb-4">
          {["Interested", "Needs Pricing", "Not Now", "Referral", "Objection", "Human Review"].map((cat) => (
            <button key={cat} className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] border transition-colors ${
              cat === cur.category ? "bg-primary/10 border-primary/25 text-primary" : "bg-white/[0.03] border-white/8 text-muted-foreground hover:text-foreground"
            }`}>{cat}</button>
          ))}
        </div>
        <SectionLabel>Follow-Up</SectionLabel>
        <div className="space-y-1 mb-4">
          {["In 2 days", "In 5 days", "In 1 week", "Custom"].map((t, i) => (
            <button key={t} className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] border transition-colors ${
              i === 0 ? "bg-accent/10 border-accent/25 text-accent" : "bg-white/[0.03] border-white/8 text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
          ))}
        </div>
        <button
          onClick={() => setScreen(6)}
          className="w-full px-3 py-2.5 rounded bg-primary text-[#080A0D] text-[11px] font-bold hover:bg-primary/90 transition-colors"
        >
          Move to Pipeline →
        </button>
      </div>
    </div>
  );
}

// ─── Screen 6: Pipeline Analytics ────────────────────────────────────────────

const FUNNEL = [
  { stage: "Leads Captured", value: 448, pct: 100, color: "#64D8FF" },
  { stage: "Leads Qualified", value: 184, pct: 41, color: "#9DFF6A" },
  { stage: "Outreach Sent", value: 156, pct: 35, color: "#9DFF6A" },
  { stage: "Replies", value: 61, pct: 14, color: "#9DFF6A" },
  { stage: "Calls Booked", value: 37, pct: 8, color: "#FFB547" },
  { stage: "Proposals Sent", value: 22, pct: 5, color: "#FF8C47" },
  { stage: "Revenue Won", value: 11, pct: 2.5, color: "#9DFF6A" },
];

const TREND = [
  { month: "Jan", pipeline: 41000, won: 8200 },
  { month: "Feb", pipeline: 48000, won: 11400 },
  { month: "Mar", pipeline: 52000, won: 14800 },
  { month: "Apr", pipeline: 61000, won: 18200 },
  { month: "May", pipeline: 71000, won: 16900 },
  { month: "Jun", pipeline: 84200, won: 22800 },
];

const SOURCES = [
  { source: "Website", leads: 142, qualified: 68, calls: 11, pipeline: "$31,200", cpl: "$48", rev: "$22,800" },
  { source: "LinkedIn Outbound", leads: 288, qualified: 84, calls: 19, pipeline: "$52,100", cpl: "$29", rev: "$31,400" },
  { source: "Referral", leads: 18, qualified: 15, calls: 7, pipeline: "$44,000", cpl: "$0", rev: "$44,000" },
  { source: "Newsletter", leads: 44, qualified: 18, calls: 5, pipeline: "$14,800", cpl: "$14", rev: "$8,200" },
  { source: "Ad Campaign", leads: 51, qualified: 9, calls: 2, pipeline: "$7,400", cpl: "$118", rev: "$4,100" },
  { source: "Cold List", leads: 67, qualified: 12, calls: 3, pipeline: "$8,200", cpl: "$62", rev: "$2,400" },
];

function PipelineAnalytics({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <AnimatedMetricCard label="Total Pipeline" value={84200} prefix="$" trend="+18% MoM" variant="green" />
        <AnimatedMetricCard label="Won — June" value={22800} prefix="$" sub="3 deals closed" variant="green" />
        <AnimatedMetricCard label="Avg. Days to Call" value={4} suffix="d" sub="SLA: 5 days" variant="cyan" />
        <AnimatedMetricCard label="Reply Rate" value={14} suffix="%" sub="Benchmark: 8%" variant="cyan" />
        <AnimatedMetricCard label="Stale Deals" value={18400} prefix="$" sub="7+ days no touch" variant="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-white/8 p-4">
          <SectionLabel>Conversion Funnel</SectionLabel>
          <div className="space-y-2.5">
            {FUNNEL.map((d, i) => (
              <div key={d.stage} className="flex items-center gap-3">
                <div className="text-[10px] font-mono text-muted-foreground w-28 text-right flex-shrink-0">{d.stage}</div>
                <div className="flex-1 h-5 bg-white/[0.04] rounded-sm overflow-hidden">
                  <motion.div
                    className="h-full rounded-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                    style={{ backgroundColor: d.color, opacity: 0.75 }}
                  />
                </div>
                <div className="text-[11px] font-mono text-foreground w-8 text-right flex-shrink-0">{d.value}</div>
                <div className="text-[10px] font-mono text-muted-foreground w-9 flex-shrink-0">{d.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-white/8 p-4">
          <SectionLabel>Pipeline vs. Won Revenue — 6 Months</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64D8FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#64D8FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9DFF6A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9DFF6A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#A7ADB7" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A7ADB7" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="pipeline" stroke="#64D8FF" strokeWidth={1.5} fill="url(#gP)" name="Pipeline" />
              <Area type="monotone" dataKey="won" stroke="#9DFF6A" strokeWidth={1.5} fill="url(#gW)" name="Won" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-white/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <SectionLabel>Source-to-Revenue Attribution</SectionLabel>
          <button
            onClick={() => setScreen(7)}
            className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors"
          >
            Campaign Performance <ArrowRight size={11} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Source", "Leads", "Qualified", "Calls", "Pipeline", "CPL", "Revenue"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((r) => (
                <tr key={r.source} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.source}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{r.leads}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{r.qualified}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{r.calls}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-accent">{r.pipeline}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{r.cpl}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-primary font-semibold">{r.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 7: Campaign Performance ──────────────────────────────────────────

const CAMPAIGNS = [
  { name: "AI Automation Audit", status: "Active", sv: "green" as BadgeVariant, traffic: 2840, leads: 142, replies: 31, calls: 11, cpo: "$280", rev: "$31,200", ai: "Scale — top CPO efficiency, increase budget 40%", av: "green" as BadgeVariant, data: [{ w: "W1", l: 28, r: 6 }, { w: "W2", l: 34, r: 8 }, { w: "W3", l: 41, r: 9 }, { w: "W4", l: 39, r: 8 }] },
  { name: "Revenue OS Demo", status: "Active", sv: "green" as BadgeVariant, traffic: 1620, leads: 88, replies: 19, calls: 9, cpo: "$190", rev: "$52,100", ai: "Scale — highest revenue potential, optimize landing page", av: "green" as BadgeVariant, data: [{ w: "W1", l: 18, r: 4 }, { w: "W2", l: 22, r: 5 }, { w: "W3", l: 26, r: 6 }, { w: "W4", l: 22, r: 4 }] },
  { name: "Local Service Follow-Up", status: "Active", sv: "amber" as BadgeVariant, traffic: 980, leads: 67, replies: 14, calls: 6, cpo: "$320", rev: "$18,400", ai: "Hold — optimize message before scaling", av: "amber" as BadgeVariant, data: [{ w: "W1", l: 14, r: 3 }, { w: "W2", l: 18, r: 4 }, { w: "W3", l: 19, r: 4 }, { w: "W4", l: 16, r: 3 }] },
  { name: "Agency Client Portal", status: "Paused", sv: "red" as BadgeVariant, traffic: 540, leads: 51, replies: 9, calls: 4, cpo: "$410", rev: "$22,000", ai: "Pause — CPO too high for current conversion rate", av: "red" as BadgeVariant, data: [{ w: "W1", l: 14, r: 2 }, { w: "W2", l: 13, r: 2 }, { w: "W3", l: 12, r: 3 }, { w: "W4", l: 12, r: 2 }] },
];

function CampaignPerformance({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <div className="flex-1 overflow-auto p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {CAMPAIGNS.map((c, ci) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
            className="bg-card rounded-lg border border-white/8 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-foreground mb-1.5">{c.name}</div>
                <Badge variant={c.sv}>{c.status}</Badge>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono font-bold text-primary">{c.rev}</div>
                <div className="text-[10px] text-muted-foreground">{c.cpo} CPO</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {([["Traffic", c.traffic.toLocaleString()], ["Leads", c.leads], ["Replies", c.replies], ["Calls", c.calls]] as [string, string | number][]).map(([label, val]) => (
                <div key={label} className="text-center p-2 bg-white/[0.03] rounded border border-white/5">
                  <div className="text-sm font-mono font-bold text-foreground">{val}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={52}>
              <BarChart data={c.data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="20%">
                <Bar dataKey="l" fill="#64D8FF" fillOpacity={0.45} radius={[2, 2, 0, 0]} name="Leads" />
                <Bar dataKey="r" fill="#9DFF6A" fillOpacity={0.8} radius={[2, 2, 0, 0]} name="Replies" />
                <Tooltip content={<ChartTooltip />} />
              </BarChart>
            </ResponsiveContainer>
            <div className={`mt-3 p-2 rounded text-[11px] flex items-start gap-1.5 border ${
              c.av === "green" ? "bg-primary/8 border-primary/15" : c.av === "amber" ? "bg-amber-400/8 border-amber-400/15" : "bg-red-400/8 border-red-400/15"
            }`}>
              <Sparkles size={10} className={`mt-0.5 flex-shrink-0 ${c.av === "green" ? "text-primary" : c.av === "amber" ? "text-amber-400" : "text-red-400"}`} />
              <span className={c.av === "green" ? "text-primary" : c.av === "amber" ? "text-amber-400" : "text-red-400"}>{c.ai}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-white/8 p-4">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Winning Message Analysis</SectionLabel>
          <button
            onClick={() => setScreen(8)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-[#080A0D] text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Customize This System <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { angle: "ROI Proof", open: "42%", reply: "18%", sample: `"Riverdale Med Spa went from 11% to 34% web inquiry conversion in 60 days — here's exactly what changed."` },
            { angle: "Pain Identification", open: "38%", reply: "14%", sample: `"Most practices at 3+ locations are still doing patient follow-up manually. That's the bottleneck we fix."` },
            { angle: "Curiosity Hook", open: "31%", reply: "11%", sample: `"What does your missed appointment inquiry follow-up actually look like right now?"` },
          ].map((m) => (
            <div key={m.angle} className="p-3 bg-white/[0.03] rounded-md border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="muted">{m.angle}</Badge>
                <div className="text-[10px] font-mono text-primary">{m.open} open · {m.reply} reply</div>
              </div>
              <div className="text-[11px] text-muted-foreground italic leading-relaxed">{m.sample}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 8: Offer Page ─────────────────────────────────────────────────────

const BUILD_PHASES = [
  { n: "01", title: "Workflow Audit", desc: "Map your lead sources, follow-up process, and revenue gaps" },
  { n: "02", title: "Data & Source Connection", desc: "Connect your CRM, email, ads, and inbound channels to one pipeline" },
  { n: "03", title: "Dashboard Prototype", desc: "Build your custom Revenue OS with real data and your workflows" },
  { n: "04", title: "Automation + AI Layer", desc: "Add AI scoring, outreach generation, reply classification, and scheduling" },
  { n: "05", title: "Pilot Launch", desc: "Run live with a real lead segment and measure outcomes vs. baseline" },
  { n: "06", title: "Measurement & Optimization", desc: "Prove ROI, expand to all sources, optimize campaigns and outreach" },
];

const INTEGRATIONS = ["HubSpot", "Salesforce", "Notion", "Airtable", "Google Ads", "LinkedIn Ads", "Mailchimp", "ActiveCampaign", "Calendly", "Slack", "Zapier", "Make.com", "Twilio", "OpenAI"];

const CUSTOMIZATIONS = [
  "Lead capture forms and source routing",
  "AI scoring model trained on your ICP",
  "Outreach templates in your brand voice",
  "Pipeline stages matching your sales process",
  "Reply classification for your offer types",
  "Custom dashboard metrics and KPIs",
  "Integrations with your existing tools",
  "Reporting cadence and stakeholder views",
];

function OfferPage({ onCta }: { onCta: () => void }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-white/8 bg-[#080A0D] px-8 py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(157,255,106,0.08), transparent)" }} />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono mb-6">
              <Zap size={11} />Sage Ideas · Revenue OS
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">
              Customize this Revenue OS<br />
              <span className="text-primary">for your business.</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              We turn your leads, emails, replies, traffic, and follow-ups into one AI-assisted revenue command center — built around your workflow, your tools, and your goals.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onCta}
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-[#080A0D] font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Phone size={13} />Book a Revenue OS Build Call
              </button>
              <button
                onClick={onCta}
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-white/8 border border-white/12 text-foreground text-sm hover:bg-white/12 transition-colors"
              >
                <Play size={13} />Request a Custom Demo
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              icon: <Layers size={13} className="text-primary" />, iconBg: "bg-primary/15",
              title: "What Gets Customized",
              content: (
                <div className="space-y-2">
                  {CUSTOMIZATIONS.map((c) => (
                    <div key={c} className="flex gap-2 text-[11px]">
                      <Check size={10} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              icon: <Globe size={13} className="text-accent" />, iconBg: "bg-accent/15",
              title: "Integrations",
              content: (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEGRATIONS.map((i) => <Badge key={i} variant="muted">{i}</Badge>)}
                  </div>
                  <div className="mt-3 text-[10px] text-muted-foreground">+ any tool via Zapier, Make, or custom API</div>
                </>
              ),
            },
            {
              icon: <Clock size={13} className="text-amber-400" />, iconBg: "bg-amber-400/15",
              title: "Timeline",
              content: (
                <div className="space-y-3">
                  {[["Week 1–2", "Audit + planning + tool connections"], ["Week 3–4", "Dashboard build + data testing"], ["Week 5–6", "Automation + AI layer activation"], ["Week 7–8", "Pilot launch with real leads"], ["Month 3+", "Measurement, optimization, expansion"]].map(([p, m]) => (
                    <div key={p} className="flex gap-3 text-[11px]">
                      <span className="font-mono text-amber-400 w-16 flex-shrink-0">{p}</span>
                      <span className="text-muted-foreground">{m}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((card) => (
            <div key={card.title} className="bg-card rounded-lg border border-white/8 p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-7 h-7 rounded ${card.iconBg} flex items-center justify-center`}>{card.icon}</div>
                <div className="text-sm font-semibold text-foreground">{card.title}</div>
              </div>
              {card.content}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg border border-white/8 p-5">
          <SectionLabel>Build Phases</SectionLabel>
          <div className="grid grid-cols-3 gap-5">
            {BUILD_PHASES.map((p) => (
              <div key={p.n} className="flex gap-3">
                <div className="text-2xl font-mono font-bold text-white/10 flex-shrink-0 w-8 leading-none pt-0.5">{p.n}</div>
                <div>
                  <div className="text-xs font-semibold text-foreground mb-1">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-white/8 p-5">
          <SectionLabel>Who This Is For</SectionLabel>
          <div className="grid grid-cols-4 gap-4">
            {[
              { type: "Small Business Owners", desc: "Need more clients and a clear view of what's working" },
              { type: "Agencies & Consultants", desc: "Need better lead follow-up and campaign attribution" },
              { type: "SaaS Founders", desc: "Need pipeline discipline and outbound measurement" },
              { type: "Service Businesses", desc: "Need to turn inquiries into booked calls, reliably" },
            ].map((w) => (
              <div key={w.type} className="p-3 bg-white/[0.03] rounded-md border border-white/5">
                <div className="text-xs font-semibold text-foreground mb-1">{w.type}</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-10 border border-primary/20 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(157,255,106,0.05), transparent)" }} />
          <div className="relative">
            <div className="text-2xl font-bold text-foreground mb-2">Ready to build your Revenue OS?</div>
            <div className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              This prototype shows the experience. Your production version connects to your real tools, data, workflows, and goals.
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onCta}
                className="flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-[#080A0D] font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Phone size={13} />Book a Revenue OS Build Call
              </button>
              <button
                onClick={onCta}
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-white/8 border border-white/12 text-foreground text-sm hover:bg-white/12 transition-colors"
              >
                See Implementation Plan <ArrowRight size={13} />
              </button>
            </div>
            <div className="mt-5 text-[11px] text-muted-foreground">
              sageideas.dev · hello@sageideas.dev
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export function FigmaMakeRevenueOsPrototype() {
  const [screen, setScreen] = useState<Screen>(1);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar active={screen} setScreen={setScreen} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar screen={screen} onBriefing={() => setBriefingOpen(true)} />
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              {screen === 1 && <CommandCenter setScreen={setScreen} />}
              {screen === 2 && <LeadQueue setScreen={setScreen} />}
              {screen === 3 && <AccountDetail setScreen={setScreen} />}
              {screen === 4 && <OutreachComposer setScreen={setScreen} />}
              {screen === 5 && <ReplyInbox setScreen={setScreen} />}
              {screen === 6 && <PipelineAnalytics setScreen={setScreen} />}
              {screen === 7 && <CampaignPerformance setScreen={setScreen} />}
              {screen === 8 && <OfferPage onCta={() => setCtaOpen(true)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AiBriefingDrawer open={briefingOpen} onClose={() => setBriefingOpen(false)} />
      <CtaModal open={ctaOpen} onClose={() => setCtaOpen(false)} />
    </div>
  );
}
