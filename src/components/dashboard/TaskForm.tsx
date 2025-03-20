
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TarefaPriority } from '@/integrations/supabase/client';

interface TaskFormProps {
  isSubmitting: boolean;
  onSubmit: (formData: TaskFormData) => void;
  onCancel: () => void;
}

export interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: TarefaPriority;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isSubmitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    due_date: '',
    priority: 'normal'
  });
  
  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePriorityChange = (value: TarefaPriority) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Tarefa</Label>
          <Input 
            id="title" 
            value={formData.title} 
            onChange={e => handleChange('title', e.target.value)} 
            placeholder="Digite o título da tarefa" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={e => handleChange('description', e.target.value)} 
            placeholder="Descreva detalhes sobre a tarefa" 
            rows={3} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input 
              id="due_date" 
              type="date" 
              value={formData.due_date} 
              onChange={e => handleChange('due_date', e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: TarefaPriority) => handlePriorityChange(value)}
            >
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
              Criando...
            </>
          ) : 'Criar Tarefa'}
        </Button>
      </DialogFooter>
    </form>
  );
};
