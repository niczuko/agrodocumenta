
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';

// Componentes refatorados
import { DashboardSummaryCard } from '@/components/dashboard/DashboardSummaryCard';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { TaskList } from '@/components/dashboard/TaskList';
import { TaskForm, TaskFormData } from '@/components/dashboard/TaskForm';
import { QuickAccessCard } from '@/components/dashboard/QuickAccessCard';

// Hooks personalizados
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTasks } from '@/hooks/useTasks';

const Dashboard = () => {
  const { user } = useAuth();
  const dashboardData = useDashboardData(user?.id);
  const { 
    tasks, 
    isSubmitting, 
    createTask, 
    updateTaskStatus 
  } = useTasks(user?.id);
  
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  const handleCreateTask = async (formData: TaskFormData) => {
    const result = await createTask(formData);
    if (result) {
      setIsTaskDialogOpen(false);
    }
  };
  
  const quickAccessItems = [
    {
      title: "Nova Fazenda",
      description: "Adicionar uma propriedade",
      icon: "fa-solid fa-plus",
      linkTo: "/fazendas"
    },
    {
      title: "Novo Talhão",
      description: "Adicionar área de cultivo",
      icon: "fa-solid fa-layer-group",
      linkTo: "/talhoes"
    },
    {
      title: "Novo Maquinário",
      description: "Adicionar equipamento",
      icon: "fa-solid fa-tractor",
      linkTo: "/maquinarios"
    },
    {
      title: "Novo Trabalhador",
      description: "Adicionar funcionário",
      icon: "fa-solid fa-user-plus",
      linkTo: "/trabalhadores"
    }
  ];
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Dashboard" 
          subtitle="Visão geral da sua fazenda" 
          icon="fa-solid fa-gauge" 
        />
        
        {dashboardData.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <DashboardSummaryCard 
                icon="fa-solid fa-wheat-awn" 
                count={dashboardData.fazendas} 
                title="Fazendas" 
                linkTo="/fazendas" 
              />
              
              <DashboardSummaryCard 
                icon="fa-solid fa-layer-group" 
                count={dashboardData.talhoes} 
                title="Talhões" 
                linkTo="/talhoes" 
              />
              
              <DashboardSummaryCard 
                icon="fa-solid fa-tractor" 
                count={dashboardData.maquinarios} 
                title="Maquinários" 
                linkTo="/maquinarios" 
              />
              
              <DashboardSummaryCard 
                icon="fa-solid fa-users" 
                count={dashboardData.trabalhadores} 
                title="Trabalhadores" 
                linkTo="/trabalhadores" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Tabs defaultValue="atividades" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
                    <TabsTrigger value="tarefas">Tarefas Pendentes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="atividades">
                    <ActivityList 
                      recentActivities={dashboardData.atividades} 
                      allActivities={dashboardData.allActivities} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="tarefas">
                    <TaskList 
                      tasks={tasks} 
                      onTaskStatusToggle={updateTaskStatus} 
                      onCreateTask={() => setIsTaskDialogOpen(true)} 
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <QuickAccessCard items={quickAccessItems} />
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
                
                <TaskForm 
                  isSubmitting={isSubmitting} 
                  onSubmit={handleCreateTask} 
                  onCancel={() => setIsTaskDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
