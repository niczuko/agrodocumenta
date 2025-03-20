
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tarefa, TarefaStatus } from '@/integrations/supabase/client';

interface TaskListProps {
  tasks: Tarefa[];
  onTaskStatusToggle: (taskId: string, currentStatus: TarefaStatus) => void;
  onCreateTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskStatusToggle, onCreateTask }) => {
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const getTaskPriorityClass = (priority: string) => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Pendentes</CardTitle>
        <CardDescription>
          Tarefas que precisam de sua atenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border border-mono-200 rounded-md">
                <div 
                  className="w-6 h-6 rounded-full border border-mono-300 flex items-center justify-center cursor-pointer" 
                  onClick={() => onTaskStatusToggle(task.id, task.status)}
                >
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-mono-500">
            <i className="fa-solid fa-clipboard-check text-4xl mb-3"></i>
            <p className="text-lg mb-1">Nenhuma tarefa pendente</p>
            <p className="text-sm">Você está em dia com suas atividades</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full text-primary border-primary hover:bg-primary/10" 
          onClick={onCreateTask}
        >
          Criar nova tarefa
        </Button>
      </CardFooter>
    </Card>
  );
};
