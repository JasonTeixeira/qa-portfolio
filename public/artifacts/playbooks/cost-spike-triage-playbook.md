# Cost Spike Triage Playbook (AWS)

Cloud bills don’t explode because of one line item — they explode because a system was allowed to scale or misbehave without guardrails.

This is the checklist I use to investigate **sudden AWS spend**.

## 0) First rule: don’t panic — contain

- If spend is actively climbing fast, **disable the thing that’s scaling** (or cap it).
- If you can’t cap it safely: scale down to a known-safe minimum.

## 1) Identify the top cost driver (fast)

In AWS Cost Explorer:

- Filter: **Last 24 hours** / **Daily**
- Group by: **Service**
- Then group by: **Region**

Answer these questions:

- Which service jumped?
- Which region?
- Is it new usage or just higher usage?

## 2) Common culprits (what I check first)

- **NAT Gateway** (data processing costs)
- **ECS/EKS** (unbounded autoscaling)
- **CloudWatch Logs** (runaway log volume)
- **S3** (PUT/GET storms, lifecycle not applied)
- **Lambda** (retry storms, high invocation counts)
- **Data transfer** (cross-AZ/cross-region)

## 3) Confirm with service-native metrics

Match Cost Explorer findings with CloudWatch:

- Request count / bytes transferred
- Errors and retries
- Throttles
- Queue depth

If you see rising errors + rising requests, suspect:

- a retry storm
- a broken downstream dependency
- a misconfigured client

## 4) Fix

Pick the smallest effective fix:

- Add or tighten **rate limiting**
- Reduce retry policy aggressiveness
- Add caching
- Add lifecycle rules (S3)
- Cap autoscaling min/max
- Add budgets + alarms so this never surprises you again

## 5) Prevent recurrence

- Add a budget alarm tied to the *specific* cost driver
- Add an SLO + alert for the underlying behavior (errors/throughput)
- Add guardrails (SCP, policies, quotas) where it makes sense

---

If you want the one-liner: **cost spikes are usually a reliability incident.**

