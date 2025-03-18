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
import { toast } from '@/components/ui/sonner';

// Fixed for Dashboard.tsx to correctly fetch data and handle queries
const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    fazendas: 0,
    talhoes: 0,
    maquinarios: 0,
    trabalhadores: 0,
    atividades: []
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch summary counts
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('id')
          .eq('user_id', user.id);
          
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
        const { count: talhoesCount, error: talhoesError } = await supabase
          .from('talhoes')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (talhoesError) throw talhoesError;
        
        // Fetch maquinarios count
        const { count: maquinariosCount, error: maquinariosError } = await supabase
          .from('maquinarios')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (maquinariosError) throw maquinariosError;
        
        // Fetch trabalhadores count
        const { count: trabalhadoresCount, error: trabalhadoresError } = await supabase
          .from('trabalhadores')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (trabalhadoresError) throw trabalhadoresError;
        
        // Fetch recent activities
        const { data: atividades, error: atividadesError } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (atividadesError) throw atividadesError;
        
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
  
  // Helper to format activity description
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
    
    return (
      <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-mono-100 last:border-0">
        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
          <i className={`${icon} text-primary`}></i>
        </div>
        <div className="flex-1">
          <p className="text-mono-800">{activity.descricao}</p>
          <p className="text-mono-500 text-sm">{formattedDate}</p>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Dashboard" 
          subtitle="Visão geral da sua fazenda"
          icon="fa-solid fa-gauge"
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
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
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <i className="fa-solid fa-layer-group text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.talhoes}</div>
                    <div className="text-mono-600">Talhões</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/talhoes" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todos</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
              
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <i className="fa-solid fa-tractor text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.maquinarios}</div>
                    <div className="text-mono-600">Maquinários</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/maquinarios" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todos</span>
                    <i className="fa-solid fa-arrow-right ml-1 text-xs"></i>
                  </Link>
                </div>
              </Glass>
              
              <Glass className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                    <i className="fa-solid fa-users text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold">{dashboardData.trabalhadores}</div>
                    <div className="text-mono-600">Trabalhadores</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-mono-100">
                  <Link to="/trabalhadores" className="text-primary hover:underline text-sm flex items-center">
                    <span>Ver todos</span>
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
                      <CardContent>
                        {dashboardData.atividades.length > 0 ? (
                          <div className="space-y-1">
                            {dashboardData.atividades.map((activity: any) => formatActivity(activity))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-mono-500">
                            <i className="fa-solid fa-history text-3xl mb-2"></i>
                            <p>Nenhuma atividade recente</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          Ver todas as atividades
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
                        <div className="text-center py-12 text-mono-500">
                          <i className="fa-solid fa-clipboard-check text-4xl mb-3"></i>
                          <p className="text-lg mb-1">Nenhuma tarefa pendente</p>
                          <p className="text-sm">Você está em dia com suas atividades</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
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
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
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
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
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
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
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
                          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
