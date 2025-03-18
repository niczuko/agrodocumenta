import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Fazenda = {
  id: string;
  nome: string;
};

type Maquinario = {
  id: string;
  fazenda_id: string;
  nome: string;
  tipo: string;
  modelo: string;
  ano: number;
  fabricante: string;
  numero_serie: string;
  status: string;
  ultima_manutencao: string;
  proxima_manutencao: string;
  notas: string;
  created_at: string;
};

const MaquinarioCard = ({ 
  maquinario,
  fazendaNome,
  onEdit, 
  onDelete, 
  onView 
}: { 
  maquinario: Maquinario;
  fazendaNome: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  // Calcular dias até próxima manutenção
  const diasAteManutencao = maquinario.proxima_manutencao 
    ? Math.floor((new Date(maquinario.proxima_manutencao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Definir ícone com base no tipo de maquinário
  let tipoIcone = "fa-solid fa-tractor";
  if (maquinario.tipo.toLowerCase().includes('colheit')) {
    tipoIcone = "fa-solid fa-wheat-awn";
  } else if (maquinario.tipo.toLowerCase().includes('caminhão') || maquinario.tipo.toLowerCase().includes('caminhao')) {
    tipoIcone = "fa-solid fa-truck";
  } else if (maquinario.tipo.toLowerCase().includes('pulverizador')) {
    tipoIcone = "fa-solid fa-spray-can";
  }
  
  return (
    <Glass hover={true} className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className={`${tipoIcone} text-primary text-lg sm:text-xl`}></i>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-mono-900 line-clamp-1">{maquinario.nome}</h3>
            <p className="text-mono-600 text-sm sm:text-base">{maquinario.tipo}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4 sm:mb-0">
          <button 
            onClick={() => onView(maquinario.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Visualizar"
          >
            <i className="fa-solid fa-eye"></i>
          </button>
          <button 
            onClick={() => onEdit(maquinario.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={() => onDelete(maquinario.id)}
            className="p-2 text-mono-600 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Modelo</div>
          <div className="font-medium text-sm sm:text-base truncate">{maquinario.modelo || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Fabricante</div>
          <div className="font-medium text-sm sm:text-base truncate">{maquinario.fabricante || 'Não informado'}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Ano</div>
          <div className="font-medium text-sm sm:text-base">{maquinario.ano || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Nº de Série</div>
          <div className="font-medium text-sm sm:text-base truncate">{maquinario.numero_serie || 'Não informado'}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-xs sm:text-sm text-mono-500">Fazenda</div>
        <div className="font-medium text-sm sm:text-base truncate">{fazendaNome}</div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-4 border-t border-mono-200">
        <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-0 ${
          maquinario.status === 'Ativo' 
            ? 'bg-primary/10 text-primary' 
            : maquinario.status === 'Manutenção' 
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
        }`}>
          {maquinario.status}
        </div>
        
        {diasAteManutencao !== null && (
          <div className={`text-xs sm:text-sm font-medium ${
            diasAteManutencao < 0 
              ? 'text-red-600' 
              : diasAteManutencao <= 30 
                ? 'text-yellow-600'
                : 'text-primary'
          }`}>
            {diasAteManutencao < 0 
              ? `Manutenção atrasada ${Math.abs(diasAteManutencao)} dias` 
              : `Manutenção em ${diasAteManutencao} dias`}
          </div>
        )}
      </div>
    </Glass>
  );
};

const MaquinarioDetailView = ({ 
  maquinario, 
  fazendaNome,
  onClose
}: { 
  maquinario: Maquinario | null;
  fazendaNome: string;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('info');
  
  if (!maquinario) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fa-solid fa-tractor text-primary"></i>
              <span>{maquinario.nome}</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-mono-100"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <Tabs defaultValue="info" className="p-6" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <i className="fa-solid fa-info-circle"></i>
                <span>Informações</span>
              </TabsTrigger>
              <TabsTrigger value="manutencao" className="flex items-center gap-2">
                <i className="fa-solid fa-wrench"></i>
                <span>Manutenção</span>
              </TabsTrigger>
              <TabsTrigger value="talhoes" className="flex items-center gap-2">
                <i className="fa-solid fa-layer-group"></i>
                <span>Talhões</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Dados Gerais</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-mono-500">Nome</div>
                          <div className="font-medium">{maquinario.nome}</div>
                        </div>
                        <div>
                          <div className="text-sm text-mono-500">Tipo</div>
                          <div className="font-medium">{maquinario.tipo}</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-mono-500">Modelo</div>
                          <div className="font-medium">{maquinario.modelo || 'Não informado'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-mono-500">Fabricante</div>
                          <div className="font-medium">{maquinario.fabricante || 'Não informado'}</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-mono-500">Ano</div>
                          <div className="font-medium">{maquinario.ano || 'Não informado'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-mono-500">Nº de Série</div>
                          <div className="font-medium">{maquinario.numero_serie || 'Não informado'}</div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-sm text-mono-500">Fazenda</div>
                        <div className="font-medium">{fazendaNome}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Status Atual</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        maquinario.status === 'Ativo' 
                          ? 'bg-green-100 text-green-700' 
                          : maquinario.status === 'Manutenção' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {maquinario.status}
                      </div>
                    </div>
                    
                    <div className="bg-mono-50 p-4 rounded-lg mb-4">
                      <div className="text-sm text-mono-600 mb-2">Notas</div>
                      <p className="text-mono-800">
                        {maquinario.notas || 'Não há notas sobre este maquinário.'}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Histórico</h4>
                      <div className="text-sm text-mono-600 mb-1">Adicionado em</div>
                      <div className="font-medium mb-3">
                        {new Date(maquinario.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="text-sm text-mono-600 mb-1">Última atualização</div>
                      <div className="font-medium">
                        {new Date(maquinario.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="manutencao">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Manutenção</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-mono-500 mb-1">Última Manutenção</div>
                      <div className="font-medium text-lg">
                        {maquinario.ultima_manutencao 
                          ? new Date(maquinario.ultima_manutencao).toLocaleDateString('pt-BR') 
                          : 'Não registrada'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-mono-500 mb-1">Próxima Manutenção</div>
                      <div className="font-medium text-lg">
                        {maquinario.proxima_manutencao 
                          ? new Date(maquinario.proxima_manutencao).toLocaleDateString('pt-BR') 
                          : 'Não agendada'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-mono-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Registrar Nova Manutenção</h4>
                    <p className="text-sm text-mono-600 mb-4">
                      Registre uma nova manutenção para este maquinário e atualize o status.
                    </p>
                    <button className="button-primary w-full md:w-auto">
                      <i className="fa-solid fa-wrench mr-2"></i>
                      Registrar Manutenção
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Histórico de Manutenções</h4>
                    <div className="text-center py-6 text-mono-500">
                      <i className="fa-solid fa-history text-3xl mb-2"></i>
                      <p>Não há registros de manutenção disponíveis.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="talhoes">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Talhões Alocados</h3>
                  
                  <div className="text-center py-8">
                    <div className="mb-3 text-mono-400">
                      <i className="fa-solid fa-layer-group text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Nenhum talhão alocado</h3>
                    <p className="text-mono-500">
                      Este maquinário não está alocado a nenhum talhão no momento.
                    </p>
                    <button className="button-primary mt-4">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Alocar a um Talhão
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 p-6 border-t border-mono-200">
            <button 
              onClick={onClose}
              className="button-secondary"
            >
              Fechar
            </button>
            <button 
              onClick={() => onClose()}
              className="button-primary"
            >
              Editar Maquinário
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

const MaquinarioFormModal = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  maquinarioData = { 
    id: '', 
    fazenda_id: '', 
    nome: '', 
    tipo: '', 
    modelo: '', 
    ano: '', 
    fabricante: '', 
    numero_serie: '', 
    status: 'Ativo', 
    ultima_manutencao: '', 
    proxima_manutencao: '', 
    notas: '' 
  },
  fazendas = []
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  maquinarioData?: { 
    id: string; 
    fazenda_id: string; 
    nome: string; 
    tipo: string; 
    modelo: string; 
    ano: string; 
    fabricante: string; 
    numero_serie: string; 
    status: string; 
    ultima_manutencao: string; 
    proxima_manutencao: string; 
    notas: string; 
  };
  fazendas: Fazenda[];
}) => {
  const [formData, setFormData] = useState(maquinarioData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    setFormData(maquinarioData);
  }, [maquinarioData]);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const maquinarioParams = {
        fazenda_id: formData.fazenda_id,
        nome: formData.nome,
        tipo: formData.tipo,
        modelo: formData.modelo,
        ano: formData.ano ? parseInt(formData.ano) : null,
        fabricante: formData.fabricante,
        numero_serie: formData.numero_serie,
        status: formData.status,
        ultima_manutencao: formData.ultima_manutencao || null,
        proxima_manutencao: formData.proxima_manutencao || null,
        notas: formData.notas
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('maquinarios')
          .update({
            ...maquinarioParams,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);
          
        if (error) {
          throw error;
        }
        
        // Registrar atividade
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'atualizacao',
          descricao: `Maquinário ${formData.nome} foi atualizado`,
          entidade_tipo: 'maquinario',
          entidade_id: formData.id
        });
        
        toast.success('Maquinário atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('maquinarios')
          .insert(maquinarioParams)
          .select('id, nome, tipo, modelo, ano, fabricante, numero_serie, status, ultima_manutencao, proxima_manutencao, notas, created_at, fazenda_id')
          .single();
          
        if (error) {
          throw error;
        }
        
        // Registrar atividade
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'criacao',
          descricao: `Maquinário ${formData.nome} foi adicionado`,
          entidade_tipo: 'maquinario',
          entidade_id: data.id
        });
        
        // Adiciona o novo maquinário à lista
        setMaquinarios(prev => [data as Maquinario, ...prev]);
        
        toast.success('Maquinário adicionado com sucesso!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} maquinário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-2xl">
        <Glass intensity="high" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar Maquinário' : 'Adicionar Novo Maquinário'}
            </h2>
            <button 
              onClick={onClose}
              className="text-mono-500 hover:text-mono-700"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="fazenda_id" className="block text-sm font-medium text-mono-700 mb-1">
                  Fazenda
                </label>
                <select
                  id="fazenda_id"
                  name="fazenda_id"
                  required
                  className="input-field"
                  value={formData.fazenda_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione uma fazenda</option>
                  {fazendas.map((fazenda) => (
                    <option key={fazenda.id} value={fazenda.id}>
                      {fazenda.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-mono-700 mb-1">
                  Nome do Maquinário
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  className="input-field"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Trator John Deere"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-mono-700 mb-1">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  className="input-field"
                  value={formData.tipo}
                  onChange={handleChange}
                >
                  <option value="">Selecione um tipo</option>
                  <option value="Trator">Trator</option>
                  <option value="Colheitadeira">Colheitadeira</option>
                  <option value="Pulverizador">Pulverizador</option>
                  <option value="Plantadeira">Plantadeira</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-mono-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="input-field"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="modelo" className="block text-sm font-medium text-mono-700 mb-1">
                  Modelo
                </label>
                <input
                  id="modelo"
                  name="modelo"
                  type="text"
                  className="input-field"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Ex: 5075E"
                />
              </div>
              
              <div>
                <label htmlFor="fabricante" className="block text-sm font-medium text-mono-700 mb-1">
                  Fabricante
                </label>
                <input
                  id="fabricante"
                  name="fabricante"
                  type="text"
                  className="input-field"
                  value={formData.fabricante}
                  onChange={handleChange}
                  placeholder="Ex: John Deere"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="ano" className="block text-sm font-medium text-mono-700 mb-1">
                  Ano
                </label>
                <input
                  id="ano"
                  name="ano"
                  type="number"
                  className="input-field"
                  value={formData.ano}
                  onChange={handleChange}
                  placeholder="Ex: 2020"
                />
              </div>
              
              <div>
                <label htmlFor="numero_serie" className="block text-sm font-medium text-mono-700 mb-1">
                  Número de Série
                </label>
                <input
                  id="numero_serie"
                  name="numero_serie"
                  type="text"
                  className="input-field"
                  value={formData.numero_serie}
                  onChange={handleChange}
                  placeholder="Ex: JD5075E123456"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="ultima_manutencao" className="block text-sm font-medium text-mono-700 mb-1">
                  Última Manutenção
                </label>
                <input
                  id="ultima_manutencao"
                  name="ultima_manutencao"
                  type="date"
                  className="input-field"
                  value={formData.ultima_manutencao}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="proxima_manutencao" className="block text-sm font-medium text-mono-700 mb-1">
                  Próxima Manutenção
                </label>
                <input
                  id="proxima_manutencao"
                  name="proxima_manutencao"
                  type="date"
                  className="input-field"
                  value={formData.proxima_manutencao}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="notas" className="block text-sm font-medium text-mono-700 mb-1">
                Notas
              </label>
              <textarea
                id="notas"
                name="notas"
                rows={3}
                className="input-field"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o maquinário"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="button-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    {isEditing ? 'Salvando...' : 'Adicionando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alterações' : 'Adicionar Maquinário'
                )}
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  );
};

const Maquinarios = () => {
  const [maquinarios, setMaquinarios] = useState<Maquinario[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingMaquinario, setEditingMaquinario] = useState<string | null>(null);
  const [deletingMaquinario, setDeletingMaquinario] = useState<string | null>(null);
  const [viewingMaquinario, setViewingMaquinario] = useState<Maquinario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFazenda, setSelectedFazenda] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Buscar fazendas
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('id, nome')
          .eq('user_id', user.id);
          
        if (fazendasError) throw fazendasError;
        setFazendas(fazendasData || []);
        
        // Buscar maquinários
        const { data: maquinariosData, error: maquinariosError } = await supabase
          .from('maquinarios')
          .select(`
            id, 
            fazenda_id, 
            nome, 
            tipo, 
            modelo, 
            ano, 
            fabricante, 
            numero_serie, 
            status, 
            ultima_manutencao, 
            proxima_manutencao, 
            notas, 
            created_at
          `)
          .order('created_at', { ascending: false });
          
        if (maquinariosError) throw maquinariosError;
        setMaquinarios(maquinariosData || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleEdit = (id: string) => {
    setEditingMaquinario(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setDeletingMaquinario(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleView = (id: string) => {
    const maquinario = maquinarios.find(m => m.id === id) || null;
    setViewingMaquinario(maquinario);
  };
  
  const confirmDelete = async () => {
    if (!deletingMaquinario || !user) return;
    
    try {
      const maquinario = maquinarios.find(m => m.id === deletingMaquinario);
      
      const { error } = await supabase
        .from('maquinarios')
        .delete()
        .eq('id', deletingMaquinario);
        
      if (error) throw error;
      
      // Registrar atividade
      if (maquinario) {
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'exclusao',
          descricao: `Maquinário ${maquinario.nome} foi excluído`,
          entidade_tipo: 'maquinario',
          entidade_id: deletingMaquinario
        });
      }
      
      // Atualizar a lista de maquinários sem recarregar
      setMaquinarios(prev => prev.filter(m => m.id !== deletingMaquinario));
      toast.success('Maquinário excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir maquinário:', error);
      toast.error(`Erro ao excluir maquinário: ${error.message}`);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingMaquinario(null);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMaquinario(null);
  };
  
  const filteredMaquinarios = maquinarios.filter(maquinario => {
    const matchesSearch = 
      maquinario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      maquinario.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (maquinario.modelo && maquinario.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (maquinario.fabricante && maquinario.fabricante.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFazenda = selectedFazenda === 'all' || maquinario.fazenda_id === selectedFazenda;
    const matchesStatus = selectedStatus === 'all' || maquinario.status === selectedStatus;
    return matchesSearch && matchesFazenda && matchesStatus;
  });
  
  const getFazendaNome = (fazendaId: string) => {
    const fazenda = fazendas.find(f => f.id === fazendaId);
    return fazenda ? fazenda.nome : 'Fazenda não encontrada';
  };
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Maquinários" 
          subtitle="Gerencie seus equipamentos agrícolas"
          icon="fa-solid fa-tractor"
          action={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="button-primary"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Novo Maquinário
            </button>
          }
        />
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar maquinários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-500">
                <i className="fa-solid fa-search"></i>
              </div>
            </div>
          </div>
          
          <div>
            <select
              value={selectedFazenda}
              onChange={(e) => setSelectedFazenda(e.target.value)}
              className="input-field"
            >
              <option value="all">Todas as Fazendas</option>
              {fazendas.map((fazenda) => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : filteredMaquinarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaquinarios.map(maquinario => (
              <MaquinarioCard 
                key={maquinario.id} 
                maquinario={maquinario}
                fazendaNome={getFazendaNome(maquinario.fazenda_id)}
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <Glass className="p-8 text-center">
            <div className="text-mono-600 mb-3">
              <i className="fa-solid fa-search text-3xl"></i>
            </div>
            <h3 className="text-xl font-medium mb-1">Nenhum maquinário encontrado</h3>
            <p className="text-mono-500">
              {searchTerm || selectedFazenda !== 'all' || selectedStatus !== 'all' ? 
                `Não encontramos resultados para sua busca` : 
                "Você ainda não cadastrou nenhum maquinário"
              }
            </p>
            {!searchTerm && selectedFazenda === 'all' && selectedStatus === 'all' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="button-primary mt-4"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Adicionar Maquinário
              </button>
            )}
          </Glass>
        )}
        
        {/* Modal para adicionar/editar maquinário */}
        <MaquinarioFormModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingMaquinario}
          maquinarioData={
            editingMaquinario 
              ? {
                  id: editingMaquinario,
                  fazenda_id: maquinarios.find(m => m.id === editingMaquinario)?.fazenda_id || '',
                  nome: maquinarios.find(m => m.id === editingMaquinario)?.nome || '',
                  tipo: maquinarios.find(m => m.id === editingMaquinario)?.tipo || '',
                  modelo: maquinarios.find(m => m.id === editingMaquinario)?.modelo || '',
                  ano: maquinarios.find(m => m.id === editingMaquinario)?.ano.toString() || '',
                  fabricante: maquinarios.find(m => m.id === editingMaquinario)?.fabricante || '',
                  numero_serie: maquinarios.find(m => m.id === editingMaquinario)?.numero_serie || '',
                  status: maquinarios.find(m => m.id === editingMaquinario)?.status || 'Ativo',
                  ultima_manutencao: maquinarios.find(m => m.id === editingMaquinario)?.ultima_manutencao || '',
                  proxima_manutencao: maquinarios.find(m => m.id === editingMaquinario)?.proxima_manutencao || '',
                  notas: maquinarios.find(m => m.id === editingMaquinario)?.notas || ''
                }
              : { 
                id: '', fazenda_id: '', nome: '', tipo: '', modelo: '', ano: '', fabricante: '', 
                numero_serie: '', status: 'Ativo', ultima_manutencao: '', proxima_manutencao: '', notas: '' 
              }
          }
          fazendas={fazendas}
        />
        
        {/* Modal de confirmação de exclusão */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
            <div className="animate-scale-in w-full max-w-md">
              <Glass intensity="high" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                <p className="text-mono-700 mb-6">
                  Tem certeza que deseja excluir este maquinário? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="button-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="button-destructive"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Excluir
                  </button>
                </div>
              </Glass>
            </div>
          </div>
        )}
        
        {/* Modal de visualização detalhada */}
        {viewingMaquinario && (
          <MaquinarioDetailView 
            maquinario={viewingMaquinario}
            fazendaNome={getFazendaNome(viewingMaquinario.fazenda_id)} 
            onClose={() => setViewingMaquinario(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Maquinarios;
