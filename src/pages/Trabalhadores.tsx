import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

type Fazenda = {
  id: string;
  nome: string;
};

type Trabalhador = {
  id: string;
  fazenda_id: string;
  nome: string;
  cargo: string;
  contato: string;
  data_contratacao: string;
  status: string;
  notas: string;
  created_at: string;
};

const TrabalhadorCard = ({ 
  trabalhador,
  fazendaNome,
  onEdit, 
  onDelete, 
  onView 
}: { 
  trabalhador: Trabalhador;
  fazendaNome: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  const getTempoContratacao = (dataContratacao: string) => {
    if (!dataContratacao) return 'Não informado';
    
    const contratacao = new Date(dataContratacao);
    const hoje = new Date();
    const diferencaMeses = (hoje.getFullYear() - contratacao.getFullYear()) * 12 + hoje.getMonth() - contratacao.getMonth();
    
    if (diferencaMeses < 1) return 'Menos de 1 mês';
    if (diferencaMeses < 12) return `${diferencaMeses} ${diferencaMeses === 1 ? 'mês' : 'meses'}`;
    
    const anos = Math.floor(diferencaMeses / 12);
    const meses = diferencaMeses % 12;
    
    if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  };
  
  const getInitials = (nome: string) => {
    if (!nome) return 'NN';
    
    const nomes = nome.split(' ');
    if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase();
    
    return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <Glass hover={true} className="p-6">
      <div className="flex justify-between">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(trabalhador.nome)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-mono-900">{trabalhador.nome}</h3>
            <p className="text-mono-600">{trabalhador.cargo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onView(trabalhador.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Visualizar"
          >
            <i className="fa-solid fa-eye"></i>
          </button>
          <button 
            onClick={() => onEdit(trabalhador.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={() => onDelete(trabalhador.id)}
            className="p-2 text-mono-600 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-mono-500">Contato</div>
          <div className="font-medium">{trabalhador.contato || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Fazenda</div>
          <div className="font-medium">{fazendaNome}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-mono-500">Data de Contratação</div>
          <div className="font-medium">
            {trabalhador.data_contratacao 
              ? new Date(trabalhador.data_contratacao).toLocaleDateString('pt-BR') 
              : 'Não informado'
            }
          </div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Tempo de Contratação</div>
          <div className="font-medium">
            {trabalhador.data_contratacao ? getTempoContratacao(trabalhador.data_contratacao) : 'Não informado'}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-mono-200">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          trabalhador.status === 'Ativo' 
            ? 'bg-green-100 text-green-700' 
            : trabalhador.status === 'Férias' 
              ? 'bg-blue-100 text-blue-700'
              : trabalhador.status === 'Licença' 
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
        }`}>
          {trabalhador.status}
        </div>
        
        <div className="text-sm font-medium text-mono-600">
          <i className="fa-solid fa-calendar mr-1"></i>
          {new Date(trabalhador.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </Glass>
  );
};

const TrabalhadorDetailView = ({ 
  trabalhador, 
  fazendaNome,
  onClose
}: { 
  trabalhador: Trabalhador | null;
  fazendaNome: string;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('info');
  
  if (!trabalhador) return null;
  
  const getInitials = (nome: string) => {
    if (!nome) return 'NN';
    
    const nomes = nome.split(' ');
    if (nomes.length === 1) return nomes[0].substring(0, 2).toUpperCase();
    
    return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
  };
  
  const getTempoContratacao = (dataContratacao: string) => {
    if (!dataContratacao) return 'Não informado';
    
    const contratacao = new Date(dataContratacao);
    const hoje = new Date();
    const diferencaMeses = (hoje.getFullYear() - contratacao.getFullYear()) * 12 + hoje.getMonth() - contratacao.getMonth();
    
    if (diferencaMeses < 1) return 'Menos de 1 mês';
    if (diferencaMeses < 12) return `${diferencaMeses} ${diferencaMeses === 1 ? 'mês' : 'meses'}`;
    
    const anos = Math.floor(diferencaMeses / 12);
    const meses = diferencaMeses % 12;
    
    if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fa-solid fa-user text-primary"></i>
              <span>{trabalhador.nome}</span>
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
              <TabsTrigger value="talhoes" className="flex items-center gap-2">
                <i className="fa-solid fa-layer-group"></i>
                <span>Talhões</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <i className="fa-solid fa-history"></i>
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-primary/80 flex items-center justify-center text-white font-semibold text-2xl mb-4">
                        {getInitials(trabalhador.nome)}
                      </div>
                      <h3 className="text-xl font-semibold text-center mb-1">{trabalhador.nome}</h3>
                      <p className="text-mono-600 text-center mb-4">{trabalhador.cargo}</p>
                      
                      <div className={`px-4 py-1 rounded-full text-sm font-medium ${
                        trabalhador.status === 'Ativo' 
                          ? 'bg-green-100 text-green-700' 
                          : trabalhador.status === 'Férias' 
                            ? 'bg-blue-100 text-blue-700'
                            : trabalhador.status === 'Licença' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}>
                        {trabalhador.status}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:w-2/3">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-mono-500">Contato</div>
                          <div className="font-medium flex items-center gap-2 mt-1">
                            <i className="fa-solid fa-phone text-primary"></i>
                            {trabalhador.contato || 'Não informado'}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <div className="text-sm text-mono-500">Fazenda</div>
                          <div className="font-medium flex items-center gap-2 mt-1">
                            <i className="fa-solid fa-wheat-awn text-primary"></i>
                            {fazendaNome}
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-mono-500">Data de Contratação</div>
                            <div className="font-medium mt-1">
                              {trabalhador.data_contratacao 
                                ? new Date(trabalhador.data_contratacao).toLocaleDateString('pt-BR') 
                                : 'Não informado'
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-mono-500">Tempo de Contratação</div>
                            <div className="font-medium mt-1">
                              {trabalhador.data_contratacao 
                                ? getTempoContratacao(trabalhador.data_contratacao) 
                                : 'Não informado'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Notas</h3>
                  <div className="bg-mono-50 p-4 rounded-lg">
                    <p className="text-mono-800">
                      {trabalhador.notas || 'Não há notas sobre este trabalhador.'}
                    </p>
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
                      Este trabalhador não está alocado a nenhum talhão no momento.
                    </p>
                    <button className="button-primary mt-4">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Alocar a um Talhão
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="historico">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Histórico</h3>
                  
                  <div className="text-center py-8">
                    <div className="mb-3 text-mono-400">
                      <i className="fa-solid fa-history text-4xl"></i>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Nenhum registro encontrado</h3>
                    <p className="text-mono-500">
                      Não há registros históricos para este trabalhador.
                    </p>
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
              Editar Trabalhador
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

const TrabalhadorFormModal = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  trabalhadorData = { 
    id: '', 
    fazenda_id: '', 
    nome: '', 
    cargo: '', 
    contato: '', 
    data_contratacao: '', 
    status: 'Ativo', 
    notas: '' 
  },
  fazendas = []
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  trabalhadorData?: { 
    id: string; 
    fazenda_id: string; 
    nome: string; 
    cargo: string; 
    contato: string; 
    data_contratacao: string; 
    status: string; 
    notas: string; 
  };
  fazendas: Fazenda[];
}) => {
  const [formData, setFormData] = useState(trabalhadorData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    setFormData(trabalhadorData);
  }, [trabalhadorData]);
  
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
      
      const trabalhadorParams = {
        fazenda_id: formData.fazenda_id,
        nome: formData.nome,
        cargo: formData.cargo,
        contato: formData.contato,
        data_contratacao: formData.data_contratacao || null,
        status: formData.status,
        notas: formData.notas
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('trabalhadores')
          .update({
            ...trabalhadorParams,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);
          
        if (error) {
          throw error;
        }
        
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'atualizacao',
          descricao: `Trabalhador ${formData.nome} foi atualizado`,
          entidade_tipo: 'trabalhador',
          entidade_id: formData.id
        });
        
        toast.success('Trabalhador atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('trabalhadores')
          .insert(trabalhadorParams)
          .select('id')
          .single();
          
        if (error) {
          throw error;
        }
        
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'criacao',
          descricao: `Trabalhador ${formData.nome} foi adicionado`,
          entidade_tipo: 'trabalhador',
          entidade_id: data.id
        });
        
        toast.success('Trabalhador adicionado com sucesso!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} trabalhador: ${error.message}`);
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
              {isEditing ? 'Editar Trabalhador' : 'Adicionar Novo Trabalhador'}
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
                  Nome Completo
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  className="input-field"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-mono-700 mb-1">
                  Cargo
                </label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  required
                  className="input-field"
                  value={formData.cargo}
                  onChange={handleChange}
                  placeholder="Ex: Gerente de Campo"
                />
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
                  <option value="Férias">Férias</option>
                  <option value="Licença">Licença</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contato" className="block text-sm font-medium text-mono-700 mb-1">
                  Contato
                </label>
                <input
                  id="contato"
                  name="contato"
                  type="text"
                  className="input-field"
                  value={formData.contato}
                  onChange={handleChange}
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>
              
              <div>
                <label htmlFor="data_contratacao" className="block text-sm font-medium text-mono-700 mb-1">
                  Data de Contratação
                </label>
                <input
                  id="data_contratacao"
                  name="data_contratacao"
                  type="date"
                  className="input-field"
                  value={formData.data_contratacao}
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
                placeholder="Informações adicionais sobre o trabalhador"
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
                  isEditing ? 'Salvar Alterações' : 'Adicionar Trabalhador'
                )}
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  );
};

const Trabalhadores = () => {
  const [trabalhadores, setTrabalhadores] = useState<Trabalhador[]>([]);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingTrabalhador, setEditingTrabalhador] = useState<string | null>(null);
  const [deletingTrabalhador, setDeletingTrabalhador] = useState<string | null>(null);
  const [viewingTrabalhador, setViewingTrabalhador] = useState<Trabalhador | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFazenda, setSelectedFazenda] = useState<string | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('id, nome')
          .eq('user_id', user.id);
          
        if (fazendasError) throw fazendasError;
        setFazendas(fazendasData || []);
        
        const { data: trabalhadoresData, error: trabalhadoresError } = await supabase
          .from('trabalhadores')
          .select(`
            id, 
            fazenda_id, 
            nome, 
            cargo, 
            contato, 
            data_contratacao, 
            status, 
            notas, 
            created_at
          `)
          .order('created_at', { ascending: false });
          
        if (trabalhadoresError) throw trabalhadoresError;
        setTrabalhadores(trabalhadoresData || []);
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
    setEditingTrabalhador(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setDeletingTrabalhador(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleView = (id: string) => {
    const trabalhador = trabalhadores.find(t => t.id === id) || null;
    setViewingTrabalhador(trabalhador);
  };
  
  const confirmDelete = async () => {
    if (!deletingTrabalhador || !user) return;
    
    try {
      const trabalhador = trabalhadores.find(t => t.id === deletingTrabalhador);
      
      const { error } = await supabase
        .from('trabalhadores')
        .delete()
        .eq('id', deletingTrabalhador);
        
      if (error) throw error;
      
      if (trabalhador) {
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'exclusao',
          descricao: `Trabalhador ${trabalhador.nome} foi excluído`,
          entidade_tipo: 'trabalhador',
          entidade_id: deletingTrabalhador
        });
      }
      
      setTrabalhadores(prev => prev.filter(t => t.id !== deletingTrabalhador));
      toast.success('Trabalhador excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir trabalhador:', error);
      toast.error(`Erro ao excluir trabalhador: ${error.message}`);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingTrabalhador(null);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrabalhador(null);
  };
  
  const filteredTrabalhadores = trabalhadores.filter(trabalhador => {
    const matchesSearch = 
      trabalhador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trabalhador.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trabalhador.contato && trabalhador.contato.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFazenda = selectedFazenda === 'all' || trabalhador.fazenda_id === selectedFazenda;
    const matchesStatus = selectedStatus === 'all' || trabalhador.status === selectedStatus;
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
          title="Trabalhadores" 
          subtitle="Gerencie sua equipe de trabalho"
          icon="fa-solid fa-users"
          action={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="button-primary"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Novo Trabalhador
            </button>
          }
        />
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar trabalhadores..."
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
              <option value="Férias">Férias</option>
              <option value="Licença">Licença</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : filteredTrabalhadores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrabalhadores.map(trabalhador => (
              <TrabalhadorCard 
                key={trabalhador.id} 
                trabalhador={trabalhador}
                fazendaNome={getFazendaNome(trabalhador.fazenda_id)}
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
            <h3 className="text-xl font-medium mb-1">Nenhum trabalhador encontrado</h3>
            <p className="text-mono-500">
              {searchTerm || selectedFazenda !== 'all' || selectedStatus !== 'all' ? 
                `Não encontramos resultados para sua busca` : 
                "Você ainda não cadastrou nenhum trabalhador"
              }
            </p>
            {!searchTerm && selectedFazenda === 'all' && selectedStatus === 'all' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="button-primary mt-4"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Adicionar Trabalhador
              </button>
            )}
          </Glass>
        )}
        
        <TrabalhadorFormModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingTrabalhador}
          trabalhadorData={
            editingTrabalhador 
              ? {
                  id: editingTrabalhador,
                  fazenda_id: trabalhadores.find(t => t.id === editingTrabalhador)?.fazenda_id || '',
                  nome: trabalhadores.find(t => t.id === editingTrabalhador)?.nome || '',
                  cargo: trabalhadores.find(t => t.id === editingTrabalhador)?.cargo || '',
                  contato: trabalhadores.find(t => t.id === editingTrabalhador)?.contato || '',
                  data_contratacao: trabalhadores.find(t => t.id === editingTrabalhador)?.data_contratacao || '',
                  status: trabalhadores.find(t => t.id === editingTrabalhador)?.status || 'Ativo',
                  notas: trabalhadores.find(t => t.id === editingTrabalhador)?.notas || ''
                }
              : { 
                id: '', fazenda_id: '', nome: '', cargo: '', contato: '', 
                data_contratacao: '', status: 'Ativo', notas: '' 
              }
          }
          fazendas={fazendas}
        />
        
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
            <div className="animate-scale-in w-full max-w-md">
              <Glass intensity="high" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                <p className="text-mono-700 mb-6">
                  Tem certeza que deseja excluir este trabalhador? Esta ação não pode ser desfeita.
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
        
        {viewingTrabalhador && (
          <TrabalhadorDetailView 
            trabalhador={viewingTrabalhador}
            fazendaNome={getFazendaNome(viewingTrabalhador.fazenda_id)} 
            onClose={() => setViewingTrabalhador(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Trabalhadores;
