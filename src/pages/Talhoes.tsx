
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import MapDrawer from '@/components/map/MapDrawer';
import MapViewer from '@/components/map/MapViewer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Fazenda = {
  id: string;
  nome: string;
};

type Talhao = {
  id: string;
  fazenda_id: string;
  nome: string;
  area_hectare: number;
  cultivo_atual: string | null;
  data_plantio: string | null;
  previsao_colheita: string | null;
  tipo_solo: string | null;
  sistema_irrigacao: string | null;
  coordenadas: string | null;  // This field will store GeoJSON now
  created_at: string;
};

const TalhaoCard = ({ 
  talhao, 
  fazendaNome,
  onEdit, 
  onDelete, 
  onView 
}: { 
  talhao: Talhao;
  fazendaNome: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  return (
    <Glass hover={true} className="p-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <i className="fa-solid fa-layer-group text-primary text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-mono-900">{talhao.nome}</h3>
            <p className="text-mono-600">{talhao.area_hectare} hectares</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onView(talhao.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Visualizar"
          >
            <i className="fa-solid fa-eye"></i>
          </button>
          <button 
            onClick={() => onEdit(talhao.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={() => onDelete(talhao.id)}
            className="p-2 text-mono-600 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-mono-500">Cultivo Atual</div>
          <div className="font-medium">{talhao.cultivo_atual || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Tipo de Solo</div>
          <div className="font-medium">{talhao.tipo_solo || 'Não informado'}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-mono-500">Fazenda</div>
        <div className="font-medium">{fazendaNome}</div>
      </div>
      
      {talhao.coordenadas && (
        <div className="mb-4">
          <MapViewer 
            geoJSON={talhao.coordenadas} 
            height="150px" 
            className="mt-3"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-mono-200">
        <div>
          <div className="text-sm text-mono-500">Plantio</div>
          <div className="font-medium">
            {talhao.data_plantio 
              ? new Date(talhao.data_plantio).toLocaleDateString('pt-BR') 
              : 'Não informado'}
          </div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Colheita</div>
          <div className="font-medium">
            {talhao.previsao_colheita 
              ? new Date(talhao.previsao_colheita).toLocaleDateString('pt-BR') 
              : 'Não informado'}
          </div>
        </div>
      </div>
    </Glass>
  );
};

const TalhaoDetailView = ({ 
  talhao, 
  fazendaNome,
  onClose
}: { 
  talhao: Talhao | null;
  fazendaNome: string;
  onClose: () => void;
}) => {
  if (!talhao) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-primary"></i>
              <span>{talhao.nome}</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-mono-100"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Dados Gerais</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-mono-500">Nome</div>
                        <div className="font-medium">{talhao.nome}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Área</div>
                        <div className="font-medium">{talhao.area_hectare} hectares</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-mono-500">Fazenda</div>
                      <div className="font-medium">{fazendaNome}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-mono-500">Cultivo Atual</div>
                        <div className="font-medium">{talhao.cultivo_atual || 'Não informado'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Tipo de Solo</div>
                        <div className="font-medium">{talhao.tipo_solo || 'Não informado'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Datas Importantes</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-mono-500">Data de Plantio</div>
                      <div className="font-medium">
                        {talhao.data_plantio 
                          ? new Date(talhao.data_plantio).toLocaleDateString('pt-BR') 
                          : 'Não informada'}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-mono-500">Previsão de Colheita</div>
                      <div className="font-medium">
                        {talhao.previsao_colheita 
                          ? new Date(talhao.previsao_colheita).toLocaleDateString('pt-BR') 
                          : 'Não informada'}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-mono-500">Sistema de Irrigação</div>
                      <div className="font-medium">{talhao.sistema_irrigacao || 'Não informado'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Área e Localização</h3>
                {talhao.coordenadas ? (
                  <MapViewer geoJSON={talhao.coordenadas} height="400px" />
                ) : (
                  <div className="text-mono-500 text-center py-8">
                    <i className="fa-solid fa-map-location-dot text-3xl mb-2"></i>
                    <p>Nenhuma área desenhada para este talhão</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
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
              Editar Talhão
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
    data_plantio: '', 
    previsao_colheita: '', 
    tipo_solo: '', 
    sistema_irrigacao: '', 
    coordenadas: '' 
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
    data_plantio: string; 
    previsao_colheita: string; 
    tipo_solo: string; 
    sistema_irrigacao: string; 
    coordenadas: string; 
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

  const handleMapChange = (geoJSON: string) => {
    setFormData(prev => ({ ...prev, coordenadas: geoJSON }));
  };

  // Handle area calculation from the map
  const handleAreaChange = (areaHectares: number) => {
    setFormData(prev => ({ 
      ...prev, 
      area_hectare: areaHectares > 0 ? areaHectares.toFixed(2) : '' 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const talhaoParams = {
        fazenda_id: formData.fazenda_id,
        nome: formData.nome,
        area_hectare: formData.area_hectare ? parseFloat(formData.area_hectare) : null,
        cultivo_atual: formData.cultivo_atual || null,
        data_plantio: formData.data_plantio || null,
        previsao_colheita: formData.previsao_colheita || null,
        tipo_solo: formData.tipo_solo || null,
        sistema_irrigacao: formData.sistema_irrigacao || null,
        coordenadas: formData.coordenadas || null
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
          descricao: `Talhão ${formData.nome} foi adicionado`,
          entidade_tipo: 'talhao',
          entidade_id: data.id
        });
        
        toast.success('Talhão adicionado com sucesso!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} talhão: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl overflow-y-auto max-h-[90vh]">
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
                  required
                  className="input-field"
                  value={formData.area_hectare}
                  onChange={handleChange}
                  placeholder="Ex: 10.5"
                />
                <p className="text-sm text-mono-500 mt-1">
                  A área é calculada automaticamente ao desenhar no mapa.
                </p>
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
                  placeholder="Ex: Soja"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  placeholder="Ex: Argiloso"
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
                  placeholder="Ex: Gotejamento"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-mono-700 mb-1">
                Área do Talhão (Desenhe no mapa)
              </label>
              <div className="mt-2">
                <MapDrawer 
                  value={formData.coordenadas}
                  onChange={handleMapChange}
                  onAreaChange={handleAreaChange}
                  height="500px"
                />
              </div>
              <p className="text-sm text-mono-500 mt-2">
                Desenhe o polígono do talhão clicando no mapa para adicionar pontos. Para finalizar, clique no ponto inicial.
              </p>
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
                  isEditing ? 'Salvar Alterações' : 'Adicionar Talhão'
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
            data_plantio, 
            previsao_colheita, 
            tipo_solo, 
            sistema_irrigacao, 
            coordenadas, 
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
    const matchesSearch = 
      talhao.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (talhao.cultivo_atual && talhao.cultivo_atual.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (talhao.tipo_solo && talhao.tipo_solo.toLowerCase().includes(searchTerm.toLowerCase()));
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
          subtitle="Gerencie seus campos de cultivo"
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
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
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
                fazendaNome={getFazendaNome(talhao.fazenda_id)}
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
                  area_hectare: talhoes.find(t => t.id === editingTalhao)?.area_hectare?.toString() || '',
                  cultivo_atual: talhoes.find(t => t.id === editingTalhao)?.cultivo_atual || '',
                  data_plantio: talhoes.find(t => t.id === editingTalhao)?.data_plantio || '',
                  previsao_colheita: talhoes.find(t => t.id === editingTalhao)?.previsao_colheita || '',
                  tipo_solo: talhoes.find(t => t.id === editingTalhao)?.tipo_solo || '',
                  sistema_irrigacao: talhoes.find(t => t.id === editingTalhao)?.sistema_irrigacao || '',
                  coordenadas: talhoes.find(t => t.id === editingTalhao)?.coordenadas || ''
                }
              : { 
                id: '', fazenda_id: '', nome: '', area_hectare: '', cultivo_atual: '', 
                data_plantio: '', previsao_colheita: '', tipo_solo: '', sistema_irrigacao: '', coordenadas: '' 
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
            fazendaNome={getFazendaNome(viewingTalhao.fazenda_id)} 
            onClose={() => setViewingTalhao(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Talhoes;
