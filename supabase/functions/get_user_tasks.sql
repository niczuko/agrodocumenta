
CREATE OR REPLACE FUNCTION get_user_tasks(user_id_param UUID)
RETURNS SETOF public.tarefas AS $$
  SELECT * FROM public.tarefas
  WHERE user_id = user_id_param
  AND status = 'pending'
  ORDER BY due_date ASC;
$$ LANGUAGE SQL SECURITY DEFINER;
