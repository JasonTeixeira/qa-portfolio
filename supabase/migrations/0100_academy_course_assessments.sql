-- Each course carries its own pre/post question bank (modular: one course row = one unit).
-- Shape: jsonb array of { id, prompt, options: text[], answer: int (correct index) }.
alter table academy_courses add column if not exists pretest jsonb not null default '[]'::jsonb;
alter table academy_courses add column if not exists posttest jsonb not null default '[]'::jsonb;
