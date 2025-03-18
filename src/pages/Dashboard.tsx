import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type DashboardStats = {
  fazendas: number;
  talhoes: number;
  maquinarios: number;
  trabalhadores: number;
};

type Atividade = {
  id: string;
  descricao: string;
  created_at: string;
  tipo: string;
  entidade_tipo: string;
};

type Fazenda = {
  id: string;
  nome: string;
  localizacao: string;
  talhoes: number;
  maquinarios: number;
  trabalhadores: number;
};

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  link 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  change?: { value: string; isPositive: boolean }; 
  link?: string;
}) => {
  const content = (
    <Glass hover={true} className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-mono-600 font-medium">{title}</h3>
          <p className="text-2xl font-semibold mt-2">{value}</p>
          
          {change && (
            <div className={`mt-2 text-sm flex items-center ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fa-solid ${change.isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
              <span>{change.value}</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </Glass>
  );
  
  if (link) {
    return <Link to={link} className="block transition-transform hover:scale-[1.01]">{content}</Link>;
  }
  
  return content;
};

const RecentActivity = ({ atividades }: { atividades: Atividade[] }) => {
  const iconMapping: Record<string, { icon: string; iconClass: string }> = {
    talhao: { icon: 'fa-solid fa-layer-group', iconClass: 'bg-blue-100 text-blue-600' },
    maquinario: { icon: 'fa-solid fa-tractor', iconClass: 'bg-green-100 text-green-600' },
    trabalhador: { icon: 'fa-solid fa-user', iconClass: 'bg-yellow-100 text-yellow-600' },
    fazenda: { icon: 'fa-solid fa-wheat-awn', iconClass: 'bg-purple-100 text-purple-600' }
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMin < 60) return `${diffMin}m atrás`;
    if (diffHrs < 24) return `${diffHrs}h atrás`;
    return `${diffDays}d atrás`;
  };
  
  return (
    <Glass className="p-6">
      <h3 className="text-mono-800 font-semibold mb-4">Atividade Recente</h3>
      {atividades.length > 0 ? (
        <ul className="space-y-4">
          {atividades.map((atividade) => {
            const entityType = atividade.entidade_tipo;
            const { icon, iconClass } = iconMapping[entityType] || { 
              icon: 'fa-solid fa-circle', 
              iconClass: 'bg-mono-100 text-mono-600' 
            };
            
            return (
              <li key={atividade.id} className="flex items-start gap-3">
                <div className={`${iconClass} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <i className={icon}></i>
                </div>
                <div>
                  <p className="text-mono-800">{atividade.descricao}</p>
                  <span className="text-mono-500 text-sm">{getTimeAgo(atividade.created_at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-6 text-mono-600">
          <i className="fa-solid fa-calendar-day text-3xl mb-2"></i>
          <p>Nenhuma atividade recente</p>
        </div>
      )}
      <Link to="/atividades" className="mt-4 inline-block text-primary hover:underline text-sm">
        Ver todas as atividades
      </Link>
    </Glass>
  );
};

const FazendaPreview = ({ fazendas }: { fazendas: Fazenda[] }) => {
  return (
    <Glass className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-mono-800 font-semibold">Suas Fazendas</h3>
        <Link to="/fazendas" className="text-primary hover:underline text-sm">
          Ver todas
        </Link>
      </div>
      
      {fazendas.length > 0 ? (
        <div className="space-y-3">
          {fazendas.map((fazenda, i) => (
            <Link to={`/fazendas/${fazenda.id}`} key={fazenda.id} className="block">
              <div className="p-3 border border-mono-200 rounded-lg hover:bg-mono-100 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <i className="fa-solid fa-wheat-awn"></i>
                    </div>
                    <div>
                      <h4 className="font-medium">{fazenda.nome}</h4>
                      <p className="text-sm text-mono-500">
                        {fazenda.talhoes} talhões • {fazenda.maquinarios} maquinários
                      </p>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-mono-400"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-mono-600">
          <i className="fa-solid fa-wheat-awn text-3xl mb-2"></i>
          <p>Nenhuma fazenda cadastrada</p>
        </div>
      )}
      
      <button 
        onClick={() => window.location.href="/fazendas"}
        className="mt-4 w-full py-2 border border-dashed border-mono-300 rounded-lg flex items-center justify-center gap-2 text-mono-600 hover:text-primary hover:border-primary transition-colors"
      >
        <i className="fa-solid fa-plus"></i>
        <span>Adicionar Fazenda</span>
      </button>
    </Glass>
  );
};

const Dashboard = () => {
  const { accentColor } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    fazendas: 0,
    talhoes: 0,
    maquinarios: 0,
    trabalhadores: 0
  });
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Buscar contagem de fazendas
        const { count: fazendasCount, error: fazendasError } = await supabase
          .from('fazendas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (fazendasError) throw fazendasError;
        
        // Need to get the fazenda IDs to use in subsequent queries
        const { data: fazendaIds, error: fazendaIdsError } = await supabase
          .from('fazendas')
          .select('id')
          .eq('user_id', user.id);
          
        if (fazendaIdsError) throw fazendaIdsError;
        
        // Create a proper array of IDs
        const fazendaIdArray = fazendaIds ? fazendaIds.map(f => f.id) : [];
        
        // Buscar contagem de talhões
        const { count: talhoesCount, error: talhoesError } = await supabase
          .from('talhoes')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIdArray.length > 0 ? fazendaIdArray : ['no-results']);
          
        if (talhoesError) throw talhoesError;
        
        // Buscar contagem de maquinários
        const { count: maquinariosCount, error: maquinariosError } = await supabase
          .from('maquinarios')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIdArray.length > 0 ? fazendaIdArray : ['no-results']);
          
        if (maquinariosError) throw maquinariosError;
        
        // Buscar contagem de trabalhadores
        const { count: trabalhadoresCount, error: trabalhadoresError } = await supabase
          .from('trabalhadores')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIdArray.length > 0 ? fazendaIdArray : ['no-results']);
          
        if (trabalhadoresError) throw trabalhadoresError;
        
        // Atualizar estatísticas
        setStats({
          fazendas: fazendasCount || 0,
          talhoes: talhoesCount || 0,
          maquinarios: maquinariosCount || 0,
          trabalhadores: trabalhadoresCount || 0
        });
        
        // Buscar atividades recentes
        const { data: atividadesData, error: atividadesError } = await supabase
          .from('atividades')
          .select('id, tipo, descricao, entidade_tipo, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (atividadesError) throw atividadesError;
        setAtividades(atividadesData || []);
        
        // Buscar fazendas com contagens
        if (fazendasCount && fazendasCount > 0) {
          const { data: fazendasData, error: fazendasListError } = await supabase
            .from('fazendas')
            .select('id, nome, localizacao')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (fazendasListError) throw fazendasListError;
          
          // Para cada fazenda, buscar contagem de talhões, maquinários e trabalhadores
          const fazendasCompletas = await Promise.all((fazendasData || []).map(async (fazenda) => {
            const [talhoesRes, maquinariosRes, trabalhadoresRes] = await Promise.all([
              supabase.from('talhoes').select('id', { count: 'exact', head: true }).eq('fazenda_id', fazenda.id),
              supabase.from('maquinarios').select('id', { count: 'exact', head: true }).eq('fazenda_id', fazenda.id),
              supabase.from('trabalhadores').select('id', { count: 'exact', head: true }).eq('fazenda_id', fazenda.id)
            ]);
            
            return {
              ...fazenda,
              talhoes: talhoesRes.count || 0,
              maquinarios: maquinariosRes.count || 0,
              trabalhadores: trabalhadoresRes.count || 0
            };
          }));
          
          setFazendas(fazendasCompletas);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar informações do dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Dashboard" 
          subtitle="Visão geral da sua gestão agrícola"
          icon="fa-solid fa-gauge-high"
          action={
            <Link to="/relatorios" className="button-secondary">
              <i className="fa-solid fa-chart-line mr-2"></i>
              Relatórios
            </Link>
          }
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard 
                title="Fazendas"
                value={stats.fazendas}
                icon="fa-solid fa-wheat-awn"
                link="/fazendas"
              />
              <DashboardCard 
                title="Talhões"
                value={stats.talhoes}
                icon="fa-solid fa-layer-group"
                link="/talhoes"
              />
              <DashboardCard 
                title="Maquinários"
                value={stats.maquinarios}
                icon="fa-solid fa-tractor"
                link="/maquinarios"
              />
              <DashboardCard 
                title="Trabalhadores"
                value={stats.trabalhadores}
                icon="fa-solid fa-users"
                link="/trabalhadores"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity atividades={atividades} />
              </div>
              <div>
                <FazendaPreview fazendas={fazendas} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
