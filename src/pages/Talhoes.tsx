
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Fazenda = {
  id: string;
  nome: string;
};

type Talhao = {
  id: string;
  fazenda_id: string;
  nome: string;
  area_hectare: number;
  cultivo_atual: string;
  tipo_solo: string;
  sistema_irrigacao: string;
  data_plantio: string;
  previsao_colheita: string;
  created_at: string;
};

type Maquinario = {
  id: string;
  nome: string;
  tipo: string;
};

type Trabalhador = {
  id: string;
  nome: string;
  cargo: string;
};

const TalhaoCard = ({ talhao, onEdit, onDelete, onView }: { 
  talhao: Talhao; 
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  const dataPlantio = talhao.data_plantio ? new Date(talhao.data_plantio).toLocaleDateString('pt-BR') : 'Não informado';
  const previsaoColheita = talhao.previsao_colheita ? new Date(talhao.previsao_colheita).toLocaleDateString('pt-BR') : 'Não informado';
  
  // Cálculo de dias até a colheita
  const diasAteColheita = talhao.previsao_colheita 
    ? Math.floor((new Date(talhao.previsao_colheita).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <Glass className="p-0 overflow-hidden">
      <div className="h-36 bg-gradient-to-r from-primary/20 to-primary/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-layer-group text-primary/40 text-6xl"></i>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => onView(talhao.id)}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            title="Visualizar"
          >
            <i className="fa-solid fa-eye text-primary"></i>
          </button>
          <button 
            onClick={() => onEdit(talhao.id)}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square text-primary"></i>
          </button>
          <button 
            onClick={() => onDelete(talhao.id)}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            title="Excluir"
          >
            <i className="fa-solid fa-trash text-red-500"></i>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{talhao.nome}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-mono-500">Área</div>
            <div className="font-medium">{talhao.area_hectare} hectares</div>
          </div>
          <div>
            <div className="text-sm text-mono-500">Cultivo</div>
            <div className="font-medium">{talhao.cultivo_atual || 'Não informado'}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-mono-500">Solo</div>
            <div className="font-medium">{talhao.tipo_solo || 'Não informado'}</div>
          </div>
          <div>
            <div className="text-sm text-mono-500">Irrigação</div>
            <div className="font-medium">{talhao.sistema_irrigacao || 'Não informado'}</div>
          </div>
        </div>
        
        <div className="border-t border-mono-200 pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-mono-500">Plantio</div>
              <div className="font-medium">{dataPlantio}</div>
            </div>
            <div>
              <div className="text-sm text-mono-500">Colheita (prev.)</div>
              <div className="font-medium">{previsaoColheita}</div>
            </div>
          </div>
        </div>
        
        {diasAteColheita !== null && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
            diasAteColheita < 0 
              ? 'bg-red-50 text-red-700' 
              : diasAteColheita <= 30 
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-green-50 text-green-700'
          }`}>
            {diasAteColheita < 0 
              ? `Colheita atrasada em ${Math.abs(diasAteColheita)} dias` 
              : `${diasAteColheita} dias até a colheita`}
          </div>
        )}
      </div>
    </Glass>
  );
};

const TalhaoDetailView = ({ 
  talhao, 
  onClose,
  maquinarios,
  trabalhadores
}: { 
  talhao: Talhao | null;
  onClose: () => void;
  maquinarios: Maquinario[];
  trabalhadores: Trabalhador[];
}) => {
  const [activeTab, setActiveTab] = useState('info');
  
  if (!talhao) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold">Detalhes do Talhão: {talhao.nome}</h2>
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
              <TabsTrigger value="maquinario" className="flex items-center gap-2">
                <i className="fa-solid fa-tractor"></i>
                <span>Maquinários</span>
              </TabsTrigger>
              <TabsTrigger value="trabalhador" className="flex items-center gap-2">
                <i className="fa-solid fa-user-hard-hat"></i>
                <span>Trabalhadores</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-mono-500">Nome</div>
                        <div className="font-medium">{talhao.nome}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Área</div>
                        <div className="font-medium">{talhao.area_hectare} hectares</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Cultivo Atual</div>
                        <div className="font-medium">{talhao.cultivo_atual || 'Não informado'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-mono-500">Tipo de Solo</div>
                        <div className="font-medium">{talhao.tipo_solo || 'Não informado'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Sistema de Irrigação</div>
                        <div className="font-medium">{talhao.sistema_irrigacao || 'Não informado'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Datas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-mono-500">Data de Plantio</div>
                      <div className="font-medium">
                        {talhao.data_plantio 
                          ? new Date(talhao.data_plantio).toLocaleDateString('pt-BR') 
                          : 'Não informado'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-mono-500">Previsão de Colheita</div>
                      <div className="font-medium">
                        {talhao.previsao_colheita 
                          ? new Date(talhao.previsao_colheita).toLocaleDateString('pt-BR') 
                          : 'Não informado'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-mono-500">Criado em</div>
                      <div className="font-medium">
                        {new Date(talhao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="maquinario">
              {maquinarios.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maquinarios.map((maquinario) => (
                      <TableRow key={maquinario.id}>
                        <TableCell className="font-medium">{maquinario.nome}</TableCell>
                        <TableCell>{maquinario.tipo}</TableCell>
                        <TableCell>
                          <button className="text-primary hover:text-primary/80">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-3 text-mono-400">
                    <i className="fa-solid fa-tractor text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Nenhum maquinário alocado</h3>
                  <p className="text-mono-500">
                    Este talhão não possui maquinários alocados
                  </p>
                  <button className="button-primary mt-4">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Adicionar Maquinário
                  </button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trabalhador">
              {trabalhadores.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trabalhadores.map((trabalhador) => (
                      <TableRow key={trabalhador.id}>
                        <TableCell className="font-medium">{trabalhador.nome}</TableCell>
                        <TableCell>{trabalhador.cargo}</TableCell>
                        <TableCell>
                          <button className="text-primary hover:text-primary/80">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-3 text-mono-400">
                    <i className="fa-solid fa-users text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Nenhum trabalhador alocado</h3>
                  <p className="text-mono-500">
                    Este talhão não possui trabalhadores alocados
                  </p>
                  <button className="button-primary mt-4">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Adicionar Trabalhador
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 p-6 border-t border-mono-200">
            <button 
              onClick={onClose}
              className="button-secondary"
            >
              Fechar
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

const TalhaoFormModal = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  talhaoData = { 
    id: '', 
    fazenda_id: '', 
    nome: '', 
    area_hectare: '', 
    cultivo_atual: '', 
    tipo_solo: '', 
    sistema_irrigacao: '', 
    data_plantio: '', 
    previsao_colheita: '' 
  },
  fazendas = []
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  talhaoData?: { 
    id: string; 
    fazenda_id: string; 
    nome: string; 
    area_hectare: string; 
    cultivo_atual: string; 
    tipo_solo: string; 
    sistema_irrigacao: string; 
    data_plantio: string; 
    previsao_colheita: string; 
  };
  fazendas: Fazenda[];
}) => {
  const [formData, setFormData] = useState(talhaoData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    setFormData(talhaoData);
  }, [talhaoData]);
  
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
      
      const talhaoParams = {
        fazenda_id: formData.fazenda_id,
        nome: formData.nome,
        area_hectare: parseFloat(formData.area_hectare),
        cultivo_atual: formData.cultivo_atual,
        tipo_solo: formData.tipo_solo,
        sistema_irrigacao: formData.sistema_irrigacao,
        data_plantio: formData.data_plantio || null,
        previsao_colheita: formData.previsao_colheita || null
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('talhoes')
          .update({
            ...talhaoParams,
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
          descricao: `Talhão ${formData.nome} foi atualizado`,
          entidade_tipo: 'talhao',
          entidade_id: formData.id
        });
        
        toast.success('Talhão atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('talhoes')
          .insert(talhaoParams)
          .select('id')
          .single();
          
        if (error) {
          throw error;
        }
        
        // Registrar atividade
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'criacao',
          descricao: `Talhão ${formData.nome} foi criado`,
          entidade_tipo: 'talhao',
          entidade_id: data.id
        });
        
        toast.success('Talhão criado com sucesso!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} talhão: ${error.message}`);
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
              {isEditing ? 'Editar Talhão' : 'Adicionar Novo Talhão'}
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
                  Nome do Talhão
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  className="input-field"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Talhão A1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="area_hectare" className="block text-sm font-medium text-mono-700 mb-1">
                  Área (hectares)
                </label>
                <input
                  id="area_hectare"
                  name="area_hectare"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input-field"
                  value={formData.area_hectare}
                  onChange={handleChange}
                  placeholder="Ex: 5.5"
                />
              </div>
              
              <div>
                <label htmlFor="cultivo_atual" className="block text-sm font-medium text-mono-700 mb-1">
                  Cultivo Atual
                </label>
                <input
                  id="cultivo_atual"
                  name="cultivo_atual"
                  type="text"
                  className="input-field"
                  value={formData.cultivo_atual}
                  onChange={handleChange}
                  placeholder="Ex: Milho, Soja, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="tipo_solo" className="block text-sm font-medium text-mono-700 mb-1">
                  Tipo de Solo
                </label>
                <input
                  id="tipo_solo"
                  name="tipo_solo"
                  type="text"
                  className="input-field"
                  value={formData.tipo_solo}
                  onChange={handleChange}
                  placeholder="Ex: Argiloso, Arenoso, etc."
                />
              </div>
              
              <div>
                <label htmlFor="sistema_irrigacao" className="block text-sm font-medium text-mono-700 mb-1">
                  Sistema de Irrigação
                </label>
                <input
                  id="sistema_irrigacao"
                  name="sistema_irrigacao"
                  type="text"
                  className="input-field"
                  value={formData.sistema_irrigacao}
                  onChange={handleChange}
                  placeholder="Ex: Aspersão, Gotejamento, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="data_plantio" className="block text-sm font-medium text-mono-700 mb-1">
                  Data de Plantio
                </label>
                <input
                  id="data_plantio"
                  name="data_plantio"
                  type="date"
                  className="input-field"
                  value={formData.data_plantio}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="previsao_colheita" className="block text-sm font-medium text-mono-700 mb-1">
                  Previsão de Colheita
                </label>
                <input
                  id="previsao_colheita"
                  name="previsao_colheita"
                  type="date"
                  className="input-field"
                  value={formData.previsao_colheita}
                  onChange={handleChange}
                />
              </div>
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
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alterações' : 'Criar Talhão'
                )}
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  );
};

const Talhoes = () => {
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingTalhao, setEditingTalhao] = useState<string | null>(null);
  const [deletingTalhao, setDeletingTalhao] = useState<string | null>(null);
  const [viewingTalhao, setViewingTalhao] = useState<Talhao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFazenda, setSelectedFazenda] = useState<string | 'all'>('all');
  
  const { user } = useAuth();
  
  // Dados de exemplo para o modal de detalhes
  const mockMaquinarios: Maquinario[] = [];
  const mockTrabalhadores: Trabalhador[] = [];
  
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
        
        // Buscar talhões
        const { data: talhoesData, error: talhoesError } = await supabase
          .from('talhoes')
          .select(`
            id, 
            fazenda_id, 
            nome, 
            area_hectare, 
            cultivo_atual, 
            tipo_solo, 
            sistema_irrigacao, 
            data_plantio, 
            previsao_colheita, 
            created_at
          `)
          .order('created_at', { ascending: false });
          
        if (talhoesError) throw talhoesError;
        setTalhoes(talhoesData || []);
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
    setEditingTalhao(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setDeletingTalhao(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleView = (id: string) => {
    const talhao = talhoes.find(t => t.id === id) || null;
    setViewingTalhao(talhao);
  };
  
  const confirmDelete = async () => {
    if (!deletingTalhao || !user) return;
    
    try {
      const talhao = talhoes.find(t => t.id === deletingTalhao);
      
      const { error } = await supabase
        .from('talhoes')
        .delete()
        .eq('id', deletingTalhao);
        
      if (error) throw error;
      
      // Registrar atividade
      if (talhao) {
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'exclusao',
          descricao: `Talhão ${talhao.nome} foi excluído`,
          entidade_tipo: 'talhao',
          entidade_id: deletingTalhao
        });
      }
      
      setTalhoes(prev => prev.filter(t => t.id !== deletingTalhao));
      toast.success('Talhão excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir talhão:', error);
      toast.error(`Erro ao excluir talhão: ${error.message}`);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingTalhao(null);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTalhao(null);
  };
  
  const filteredTalhoes = talhoes.filter(talhao => {
    const matchesSearch = talhao.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     (talhao.cultivo_atual && talhao.cultivo_atual.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFazenda = selectedFazenda === 'all' || talhao.fazenda_id === selectedFazenda;
    return matchesSearch && matchesFazenda;
  });
  
  const getFazendaNome = (fazendaId: string) => {
    const fazenda = fazendas.find(f => f.id === fazendaId);
    return fazenda ? fazenda.nome : 'Fazenda não encontrada';
  };
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Talhões" 
          subtitle="Gerencie suas áreas de cultivo"
          icon="fa-solid fa-layer-group"
          action={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="button-primary"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Novo Talhão
            </button>
          }
        />
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar talhões..."
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
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : filteredTalhoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalhoes.map(talhao => (
              <TalhaoCard 
                key={talhao.id} 
                talhao={talhao} 
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
            <h3 className="text-xl font-medium mb-1">Nenhum talhão encontrado</h3>
            <p className="text-mono-500">
              {searchTerm || selectedFazenda !== 'all' ? 
                `Não encontramos resultados para sua busca` : 
                "Você ainda não cadastrou nenhum talhão"
              }
            </p>
            {!searchTerm && selectedFazenda === 'all' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="button-primary mt-4"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Adicionar Talhão
              </button>
            )}
          </Glass>
        )}
        
        {/* Modal para adicionar/editar talhão */}
        <TalhaoFormModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingTalhao}
          talhaoData={
            editingTalhao 
              ? {
                  id: editingTalhao,
                  fazenda_id: talhoes.find(t => t.id === editingTalhao)?.fazenda_id || '',
                  nome: talhoes.find(t => t.id === editingTalhao)?.nome || '',
                  area_hectare: talhoes.find(t => t.id === editingTalhao)?.area_hectare.toString() || '',
                  cultivo_atual: talhoes.find(t => t.id === editingTalhao)?.cultivo_atual || '',
                  tipo_solo: talhoes.find(t => t.id === editingTalhao)?.tipo_solo || '',
                  sistema_irrigacao: talhoes.find(t => t.id === editingTalhao)?.sistema_irrigacao || '',
                  data_plantio: talhoes.find(t => t.id === editingTalhao)?.data_plantio || '',
                  previsao_colheita: talhoes.find(t => t.id === editingTalhao)?.previsao_colheita || ''
                }
              : { id: '', fazenda_id: '', nome: '', area_hectare: '', cultivo_atual: '', tipo_solo: '', sistema_irrigacao: '', data_plantio: '', previsao_colheita: '' }
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
                  Tem certeza que deseja excluir este talhão? Esta ação não pode ser desfeita.
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
        {viewingTalhao && (
          <TalhaoDetailView 
            talhao={viewingTalhao} 
            onClose={() => setViewingTalhao(null)} 
            maquinarios={mockMaquinarios}
            trabalhadores={mockTrabalhadores}
          />
        )}
      </div>
    </Layout>
  );
};

export default Talhoes;
