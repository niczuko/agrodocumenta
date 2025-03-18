
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { useTheme } from '@/contexts/ThemeContext';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  link 
}: { 
  title: string; 
  value: string; 
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

const RecentActivity = () => {
  const activities = [
    { text: 'Talhão A3 foi atualizado', time: '2h atrás', icon: 'fa-solid fa-layer-group', iconClass: 'bg-blue-100 text-blue-600' },
    { text: 'Maquinário Trator A foi adicionado', time: '5h atrás', icon: 'fa-solid fa-tractor', iconClass: 'bg-green-100 text-green-600' },
    { text: 'Nova tarefa atribuída para Carlos Silva', time: '1d atrás', icon: 'fa-solid fa-user', iconClass: 'bg-yellow-100 text-yellow-600' },
    { text: 'Fazenda Sul foi criada', time: '2d atrás', icon: 'fa-solid fa-wheat-awn', iconClass: 'bg-purple-100 text-purple-600' },
  ];
  
  return (
    <Glass className="p-6">
      <h3 className="text-mono-800 font-semibold mb-4">Atividade Recente</h3>
      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`${activity.iconClass} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <i className={activity.icon}></i>
            </div>
            <div>
              <p className="text-mono-800">{activity.text}</p>
              <span className="text-mono-500 text-sm">{activity.time}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/atividades" className="mt-4 inline-block text-primary hover:underline text-sm">
        Ver todas as atividades
      </Link>
    </Glass>
  );
};

const FazendaPreview = () => {
  return (
    <Glass className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-mono-800 font-semibold">Suas Fazendas</h3>
        <Link to="/fazendas" className="text-primary hover:underline text-sm">
          Ver todas
        </Link>
      </div>
      
      <div className="space-y-3">
        {['Fazenda Norte', 'Fazenda Sul', 'Estância Nova Esperança'].map((fazenda, i) => (
          <Link to="/fazendas/1" key={i} className="block">
            <div className="p-3 border border-mono-200 rounded-lg hover:bg-mono-100 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{fazenda}</h4>
                    <p className="text-sm text-mono-500">
                      {3 + i} talhões • {2 + i} maquinários
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-mono-400"></i>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <button className="mt-4 w-full py-2 border border-dashed border-mono-300 rounded-lg flex items-center justify-center gap-2 text-mono-600 hover:text-primary hover:border-primary transition-colors">
        <i className="fa-solid fa-plus"></i>
        <span>Adicionar Fazenda</span>
      </button>
    </Glass>
  );
};

const Dashboard = () => {
  const { accentColor } = useTheme();
  
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Fazendas"
            value="3"
            icon="fa-solid fa-wheat-awn"
            link="/fazendas"
          />
          <DashboardCard 
            title="Talhões"
            value="12"
            icon="fa-solid fa-layer-group"
            link="/talhoes"
          />
          <DashboardCard 
            title="Maquinários"
            value="7"
            icon="fa-solid fa-tractor"
            change={{ value: "+1 este mês", isPositive: true }}
            link="/maquinarios"
          />
          <DashboardCard 
            title="Trabalhadores"
            value="18"
            icon="fa-solid fa-users"
            link="/trabalhadores"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <FazendaPreview />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
