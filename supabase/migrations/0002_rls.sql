-- Row Level Security — раздел 11 проектного документа.
-- Правило: ученик видит только свои строки, преподаватель — только свои группы (через teacher_groups),
-- админ — всё (сервисная роль обходит RLS полностью, обычная схема Supabase).

alter table students enable row level security;
alter table grades enable row level security;
alter table attendance enable row level security;
alter table behavior_events enable row level security;
alter table assessments enable row level security;

-- ученик: видит только собственную строку в students
create policy student_self_read on students
  for select using (user_id = auth.uid());

-- ученик: видит только свои оценки; преподаватель — оценки учеников своих групп
create policy grades_read on grades
  for select using (
    student_id = auth.uid()
    or exists (
      select 1 from students s
      join teacher_groups tg on tg.group_id = s.group_id
      where s.user_id = grades.student_id and tg.teacher_id = auth.uid()
    )
  );

-- вносить/менять оценки может только преподаватель своей группы
create policy grades_write on grades
  for insert with check (
    exists (
      select 1 from students s
      join teacher_groups tg on tg.group_id = s.group_id
      where s.user_id = grades.student_id and tg.teacher_id = auth.uid()
    )
  );

create policy grades_update on grades
  for update using (
    exists (
      select 1 from students s
      join teacher_groups tg on tg.group_id = s.group_id
      where s.user_id = grades.student_id and tg.teacher_id = auth.uid()
    )
  );

-- та же логика для посещаемости и поведения
create policy attendance_read on attendance
  for select using (
    student_id = auth.uid()
    or exists (select 1 from teacher_groups tg where tg.group_id = attendance.group_id and tg.teacher_id = auth.uid())
  );

create policy attendance_write on attendance
  for all using (exists (select 1 from teacher_groups tg where tg.group_id = attendance.group_id and tg.teacher_id = auth.uid()));

create policy behavior_read on behavior_events
  for select using (
    (student_id = auth.uid() and visible_to_student)
    or exists (
      select 1 from students s join teacher_groups tg on tg.group_id = s.group_id
      where s.user_id = behavior_events.student_id and tg.teacher_id = auth.uid()
    )
  );

create policy assessments_read on assessments
  for select using (
    exists (select 1 from students s where s.group_id = assessments.group_id and s.user_id = auth.uid())
    or exists (select 1 from teacher_groups tg where tg.group_id = assessments.group_id and tg.teacher_id = auth.uid())
  );

-- Примечание: администратор обращается к базе через сервисную роль Supabase (service_role key),
-- которая обходит RLS целиком, поэтому отдельных admin-политик здесь не требуется.
