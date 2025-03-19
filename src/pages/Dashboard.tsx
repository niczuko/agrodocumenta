import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Glass } from '@/components/ui/Glass';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tarefa } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    fazendas: 0,
    talhoes: 0,
    maquinarios: 0,
    trabalhadores: 0,
    atividades: []
  });
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    status: 'pending' as 'pending' | 'completed'
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [userTasks, setUserTasks] = useState<Tarefa[]>([]);
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);

        // Fetch summary counts
        const {
          data: fazendasData,
          error: fazendasError
        } = await supabase.from('fazendas').select('id').eq('user_id', user.id);
        if (fazendasError) throw fazendasError;

        // Extract all farm IDs
        const fazendaIds = fazendasData.map(fazenda => fazenda.id);
        if (fazendaIds.length === 0) {
          setDashboardData({
            fazendas: 0,
            talhoes: 0,
            maquinarios: 0,
            trabalhadores: 0,
            atividades: []
          });
          setIsLoading(false);
          return;
        }

        // Fetch talhoes count
        const {
          count: talhoesCount,
          error: talhoesError
        } = await supabase.from('talhoes').select('id', {
          count: 'exact',
          head: true
        }).in('fazenda_id', fazendaIds);
        if (talhoesError) throw talhoesError;

        // Fetch maquinarios count
        const {
          count: maquinariosCount,
          error: maquinariosError
        } = await supabase.from('maquinarios').select('id', {
          count: 'exact',
          head: true
        }).in('fazenda_id', fazendaIds);
        if (maquinariosError) throw maquinariosError;

        // Fetch trabalhadores count
        const {
          count: trabalhadoresCount,
          error: trabalhadoresError
        } = await supabase.from('trabalhadores').select('id', {
          count: 'exact',
          head: true
        }).in('fazenda_id', fazendaIds);
        if (trabalhadoresError) throw trabalhadoresError;

        // Fetch recent activities
        const {
          data: atividades,
          error: atividadesError
        } = await supabase.from('atividades').select('*').eq('user_id', user.id).order('created_at', {
          ascending: false
        }).limit(10);
        if (atividadesError) throw atividadesError;

        // Fetch all activities (for when the user clicks "See all")
        const {
          data: allAtividades,
          error: allAtividadesError
        } = await supabase.from('atividades').select('*').eq('user_id', user.id).order('created_at', {
          ascending: false
        });
        if (allAtividadesError) throw allAtividadesError;
        try {
          // Try to fetch user tasks - if table doesn't exist yet, we'll handle error
          const {
            data: tasks,
            error: tasksError
          } = await supabase.rpc('get_user_tasks', {
            user_id_param: user.id
          });
          if (tasksError) {
            console.error('Error fetching tasks via RPC:', tasksError);
            // Fallback to direct query
            const {
              data: fallbackTasks,
              error: fallbackError
            } = await supabase.from('tarefas').select('*').eq('user_id', user.id).eq('status', 'pending').order('due_date', {
              ascending: true
            });
            if (fallbackError) {
              console.error('Error in fallback tasks fetch:', fallbackError);
              // If the query also fails, we'll just set empty tasks
            } else if (fallbackTasks) {
              // Ensure each task has the correct priority type
              const typedTasks = fallbackTasks.map(task => ({
                ...task,
                priority: task.priority as 'low' | 'normal' | 'high',
                status: task.status as 'pending' | 'completed'
              }));
              setUserTasks(typedTasks);
            }
          } else if (tasks) {
            // Ensure each task has the correct priority type
            const typedTasks = tasks.map(task => ({
              ...task,
              priority: task.priority as 'low' | 'normal' | 'high',
              status: task.status as 'pending' | 'completed'
            }));
            setUserTasks(typedTasks);
          }
        } catch (taskError) {
          console.error('Task fetching error:', taskError);
          // Table might not exist yet, so we'll just continue
        }
        setAllActivities(allAtividades || []);
        setDashboardData({
          fazendas: fazendasData.length,
          talhoes: talhoesCount || 0,
          maquinarios: maquinariosCount || 0,
          trabalhadores: trabalhadoresCount || 0,
          atividades: atividades || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);
  const formatActivity = (activity: any) => {
    const date = new Date(activity.created_at);
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    let icon = 'fa-solid fa-circle-info';
    switch (activity.tipo) {
      case 'criacao':
        icon = 'fa-solid fa-plus';
        break;
      case 'atualizacao':
        icon = 'fa-solid fa-pen-to-square';
        break;
      case 'exclusao':
        icon = 'fa-solid fa-trash';
        break;
    }
    return <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-mono-100 last:border-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <i className={`${icon} text-primary`}></i>
        </div>
        <div className="flex-1">
          <p className="text-mono-800">{activity.descricao}</p>
          <p className="text-mono-500 text-sm">{formattedDate}</p>
        </div>
      </div>;
  };
  const toggleAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };
  const formatDueDate = dateString => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  const getTaskPriorityClass = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  const handleCreateTask = async e => {
    e.preventDefault();
    if (!user) return;
    if (!newTask.title.trim()) {
      toast.error('O título da tarefa é obrigatório');
      return;
    }
    if (!newTask.due_date) {
      toast.error('A data de vencimento é obrigatória');
      return;
    }
    try {
      setIsSubmittingTask(true);

      // Insert the new task into the tarefas table
      const {
        data,
        error
      } = await supabase.from('tarefas').insert({
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        priority: newTask.priority,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select().single();
      if (error) {
        console.error('Error creating task:', error);
        toast.error(`Erro ao criar tarefa: ${error.message}`);
        return;
      }

      // Successfully created task
      // Ensure the task has the correct types before adding to state
      const newTaskWithCorrectTypes: Tarefa = {
        ...data,
        priority: data.priority as 'low' | 'normal' | 'high',
        status: data.status as 'pending' | 'completed'
      };
      setUserTasks([...userTasks, newTaskWithCorrectTypes]);
      toast.success('Tarefa criada com sucesso!');

      // Register the activity
      await supabase.from('atividades').insert({
        user_id: user.id,
        tipo: 'criacao',
        descricao: `Nova tarefa criada: ${newTask.title}`,
        entidade_tipo: 'tarefa',
        entidade_id: data.id
      });

      // Reset form and close dialog
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'normal',
        status: 'pending'
      });
      setIsTaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    } finally {
      setIsSubmittingTask(false);
    }
  };
  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    if (!user) return;
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const {
        error
      } = await supabase.from('tarefas').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', taskId);
      if (error) throw error;

      // Update local state
      setUserTasks(userTasks.map(task => task.id === taskId ? {
        ...task,
        status: newStatus as 'pending' | 'completed'
      } : task));

      // If marked as completed, remove from the pending list
      if (newStatus === 'completed') {
        setUserTasks(userTasks.filter(task => task.id !== taskId));
      }
      toast.success(`Tarefa ${newStatus === 'completed' ? 'concluída' : 'reaberta'} com sucesso!`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(`Erro ao atualizar status da tarefa: ${error.message}`);
    }
  };
  return <Layout>
      <div className="page-transition">
        <PageTitle title="Dashboard" subtitle="Visão geral da sua fazenda" icon="fa-solid fa-gauge" />
        
        {isLoading ? <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div> : <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-wheat-awn text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.fazendas}</div>
                    <div className="text-mono-600">Fazendas</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/fazendas" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todas</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
              
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-layer-group text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.talhoes}</div>
                    <div className="text-mono-600">Talhões</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/talhoes" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todas</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
              
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-tractor text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.maquinarios}</div>
                    <div className="text-mono-600">Maquinários</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/maquinarios" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todas</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
              
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-users text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.trabalhadores}</div>
                    <div className="text-mono-600">Trabalhadores</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/trabalhadores" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todas</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Tabs defaultValue="atividades" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
                    <TabsTrigger value="tarefas">Tarefas Pendentes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="atividades">
                    <Card>
                      <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                        <CardDescription>
                          Últimas ações realizadas no sistema
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-96 overflow-y-auto">
                        {showAllActivities ? allActivities.length > 0 ? <div className="space-y-1">
                              {allActivities.map((activity: any) => formatActivity(activity))}
                            </div> : <div className="text-center py-6 text-mono-500">
                              <i className="fa-solid fa-history text-3xl mb-2"></i>
                              <p>Nenhuma atividade registrada</p>
                            </div> : dashboardData.atividades.length > 0 ? <div className="space-y-1">
                              {dashboardData.atividades.map((activity: any) => formatActivity(activity))}
                            </div> : <div className="text-center py-6 text-mono-500">
                              <i className="fa-solid fa-history text-3xl mb-2"></i>
                              <p>Nenhuma atividade recente</p>
                            </div>}
                      </CardContent>
                      <CardFooter className="py-[1.5rem]">
                        <Button variant="activity" className="w-full" onClick={toggleAllActivities}>
                          {showAllActivities ? 'Mostrar apenas recentes' : 'Ver todas as atividades'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="tarefas">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tarefas Pendentes</CardTitle>
                        <CardDescription>
                          Tarefas que precisam de sua atenção
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userTasks.length > 0 ? <div className="space-y-3">
                            {userTasks.map(task => <div key={task.id} className="flex items-start gap-3 p-3 border border-mono-200 rounded-md">
                                <div className="w-6 h-6 rounded-full border border-mono-300 flex items-center justify-center cursor-pointer" onClick={() => handleTaskStatusToggle(task.id, task.status)}>
                                  {task.status === 'completed' && <i className="fa-solid fa-check text-primary text-xs"></i>}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-mono-800">{task.title}</h4>
                                  {task.description && <p className="text-mono-600 text-sm mt-1">{task.description}</p>}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-flex items-center text-xs px-2 py-1 rounded border">
                                      <i className="fa-solid fa-calendar-days mr-1"></i>
                                      {formatDueDate(task.due_date)}
                                    </span>
                                    <span className={`inline-flex items-center text-xs px-2 py-1 rounded border ${getTaskPriorityClass(task.priority)}`}>
                                      <i className="fa-solid fa-flag mr-1"></i>
                                      {task.priority === 'high' ? 'Alta' : task.priority === 'normal' ? 'Normal' : 'Baixa'}
                                    </span>
                                  </div>
                                </div>
                              </div>)}
                          </div> : <div className="text-center py-12 text-mono-500">
                            <i className="fa-solid fa-clipboard-check text-4xl mb-3"></i>
                            <p className="text-lg mb-1">Nenhuma tarefa pendente</p>
                            <p className="text-sm">Você está em dia com suas atividades</p>
                          </div>}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10" onClick={() => setIsTaskDialogOpen(true)}>
                          Criar nova tarefa
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Acesso Rápido</CardTitle>
                    <CardDescription>
                      Ações comuns para gerenciar sua fazenda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link to="/fazendas" className="block">
                      <Glass hover={true} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="fa-solid fa-plus text-primary"></i>
                          </div>
                          <div>
                            <div className="font-medium">Nova Fazenda</div>
                            <div className="text-sm text-mono-500">Adicionar uma propriedade</div>
                          </div>
                        </div>
                      </Glass>
                    </Link>
                    
                    <Link to="/talhoes" className="block">
                      <Glass hover={true} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="fa-solid fa-layer-group text-primary"></i>
                          </div>
                          <div>
                            <div className="font-medium">Novo Talhão</div>
                            <div className="text-sm text-mono-500">Adicionar área de cultivo</div>
                          </div>
                        </div>
                      </Glass>
                    </Link>
                    
                    <Link to="/maquinarios" className="block">
                      <Glass hover={true} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="fa-solid fa-tractor text-primary"></i>
                          </div>
                          <div>
                            <div className="font-medium">Novo Maquinário</div>
                            <div className="text-sm text-mono-500">Adicionar equipamento</div>
                          </div>
                        </div>
                      </Glass>
                    </Link>
                    
                    <Link to="/trabalhadores" className="block">
                      <Glass hover={true} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className="fa-solid fa-user-plus text-primary"></i>
                          </div>
                          <div>
                            <div className="font-medium">Novo Trabalhador</div>
                            <div className="text-sm text-mono-500">Adicionar funcionário</div>
                          </div>
                        </div>
                      </Glass>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da tarefa abaixo
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateTask}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título da Tarefa</Label>
                      <Input id="title" value={newTask.title} onChange={e => setNewTask({
                    ...newTask,
                    title: e.target.value
                  })} placeholder="Digite o título da tarefa" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (opcional)</Label>
                      <Textarea id="description" value={newTask.description} onChange={e => setNewTask({
                    ...newTask,
                    description: e.target.value
                  })} placeholder="Descreva detalhes sobre a tarefa" rows={3} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="due_date">Data de Vencimento</Label>
                        <Input id="due_date" type="date" value={newTask.due_date} onChange={e => setNewTask({
                      ...newTask,
                      due_date: e.target.value
                    })} required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={newTask.priority} onValueChange={value => setNewTask({
                      ...newTask,
                      priority: value
                    })}>
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmittingTask}>
                      {isSubmittingTask ? <>
                          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                          Criando...
                        </> : 'Criar Tarefa'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>}
      </div>
    </Layout>;
};
export default Dashboard;