---
title: "Supabase in Production: What I Wish I Knew Before 185 Tables"
excerpt: "After a year of running Supabase in production with 185 tables, here's the honest review — what's incredible, what's frustrating, and what almost made me switch."
sourceSlug: supabase-in-production-what-i-wish-i-knew-before-185-tables
locale: hi
sourceHash: f14a111c3a6ba881
machineTranslated: true
---

# Supabase in Production: वह सब जो मैं 185 टेबल्स से पहले जानना चाहता था

मैं पिछले एक साल से Supabase को प्रोडक्शन में चला रहा हूँ। 185 टेबल्स। 69 API एंडपॉइंट्स। Stripe वेबहुक्स। रीयल-टाइम सब्सक्रिप्शन्स। Discord बॉट डेटा। ट्रेडिंग एनालिटिक्स।

यह कोई "शुरुआत कैसे करें" ट्यूटोरियल नहीं है। यह स्केल पर इसके साथ रहने के बाद की ईमानदार समीक्षा है।

## जो वास्तव में अविश्वसनीय है

### Row-Level Security सब कुछ बदल देता है

RLS Supabase की सबसे बेहतरीन विशेषता है, और अधिकांश लोग इसका पूरा उपयोग नहीं करते। हर API एंडपॉइंट में अधिकृतता जाँच लिखने के बजाय, डेटाबेस स्वयं एक्सेस को लागू करता है:

\\\
