
import { useState, useEffect } from 'react';
import { supabase, Tarefa, TarefaPriority, TarefaStatus } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { TaskFormData } from '@/components/dashboard/TaskForm';

export const useTasks = (userId: string | undefined) => {
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validatePriority = (priority: string): TarefaPriority => {
    if (priority === 'low' || priority === 'normal' || priority === 'high') {
      return priority as TarefaPriority;
    }
    // Default fallback
    return 'normal';
  };
  
  const validateStatus = (status: string): TarefaStatus => {
    if (status === 'pending' || status === 'completed') {
      return status as TarefaStatus;
    }
    // Default fallback
    return 'pending';
  };
  
  const fetchTasks = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Try to fetch user tasks - if table doesn't exist yet, we'll handle error
      try {
        const { data, error: tasksError } = await supabase
          .rpc('get_user_tasks', { user_id_param: userId })
          .returns<Tarefa[]>();
        
        if (tasksError) {
          console.error('Error fetching tasks via RPC:', tasksError);
          // Fallback to direct query
          const { data: fallbackTasks, error: fallbackError } = await supabase
            .from('tarefas')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('due_date', { ascending: true });
          
          if (fallbackError) {
            console.error('Error in fallback tasks fetch:', fallbackError);
            // If the query also fails, we'll just set empty tasks
            setTasks([]);
          } else if (fallbackTasks) {
            // Process and validate each task's properties to match Tarefa type
            const typedTasks: Tarefa[] = fallbackTasks.map(task => ({
              ...task,
              priority: validatePriority(task.priority),
              status: validateStatus(task.status)
            }));
            setTasks(typedTasks);
          }
        } else {
          // Process and validate each task's properties to match Tarefa type
          const typedTasks: Tarefa[] = data ? data.map(task => ({
            ...task,
            priority: validatePriority(task.priority),
            status: validateStatus(task.status)
          })) : [];
          setTasks(typedTasks);
        }
      } catch (taskError) {
        console.error('Task fetching error:', taskError);
        // Table might not exist yet, so we'll just continue
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTask = async (formData: TaskFormData) => {
    if (!userId) return;
    
    try {
      setIsSubmitting(true);

      // Insert the new task into the tarefas table
      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          priority: formData.priority,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating task:', error);
        toast.error(`Erro ao criar tarefa: ${error.message}`);
        return null;
      }

      // Ensure the task has the correct types before adding to state
      const newTaskWithCorrectTypes: Tarefa = {
        ...data,
        priority: validatePriority(data.priority),
        status: validateStatus(data.status)
      };
      
      setTasks(prev => [...prev, newTaskWithCorrectTypes]);
      toast.success('Tarefa criada com sucesso!');

      // Register the activity
      await supabase.from('atividades').insert({
        user_id: userId,
        tipo: 'criacao',
        descricao: `Nova tarefa criada: ${formData.title}`,
        entidade_tipo: 'tarefa',
        entidade_id: data.id
      });

      return newTaskWithCorrectTypes;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(`Erro ao criar tarefa: ${(error as Error).message}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateTaskStatus = async (taskId: string, currentStatus: TarefaStatus) => {
    if (!userId) return false;
    
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const { error } = await supabase
        .from('tarefas')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
        
      if (error) throw error;

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as TarefaStatus } : task
      );
      setTasks(updatedTasks);

      // If marked as completed, remove from the pending list
      if (newStatus === 'completed') {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
      
      toast.success(`Tarefa ${newStatus === 'completed' ? 'concluída' : 'reaberta'} com sucesso!`);
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(`Erro ao atualizar status da tarefa: ${(error as Error).message}`);
      return false;
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);
  
  return {
    tasks,
    isLoading,
    isSubmitting,
    createTask,
    updateTaskStatus,
    refreshTasks: fetchTasks
  };
};
