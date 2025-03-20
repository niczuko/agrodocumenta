
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  tipo: string;
  descricao: string;
  created_at: string;
}

interface ActivityListProps {
  recentActivities: Activity[];
  allActivities: Activity[];
}

export const ActivityList: React.FC<ActivityListProps> = ({ recentActivities, allActivities }) => {
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  const toggleAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };
  
  const formatActivity = (activity: Activity) => {
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
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <i className={`${icon} text-primary`}></i>
        </div>
        <div className="flex-1">
          <p className="text-mono-800">{activity.descricao}</p>
          <p className="text-mono-500 text-sm">{formattedDate}</p>
        </div>
      </div>
    );
  };
  
  const activitiesToDisplay = showAllActivities ? allActivities : recentActivities;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Últimas ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {activitiesToDisplay.length > 0 ? (
          <div className="space-y-1">
            {activitiesToDisplay.map((activity) => formatActivity(activity))}
          </div>
        ) : (
          <div className="text-center py-6 text-mono-500">
            <i className="fa-solid fa-history text-3xl mb-2"></i>
            <p>Nenhuma atividade {showAllActivities ? 'registrada' : 'recente'}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="py-[1.5rem]">
        <Button variant="activity" className="w-full text-mono-800 hover:text-mono-800" onClick={toggleAllActivities}>
          {showAllActivities ? 'Mostrar apenas recentes' : 'Ver todas as atividades'}
        </Button>
      </CardFooter>
    </Card>
  );
};
