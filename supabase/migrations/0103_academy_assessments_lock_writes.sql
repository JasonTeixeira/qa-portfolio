-- SECURITY: remove the learner INSERT path on academy_assessments. Scores must be
-- computed server-side against the (hidden) answer key in scoreAndRecord(), which
-- writes via the service role. A direct insert would let a learner self-report
-- score=100 and fake their Hake's g. Reads stay own-row.
drop policy if exists academy_assessments_own_write on academy_assessments;
