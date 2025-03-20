import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import FazendaGeolocation from '@/components/map/FazendaGeolocation';
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
  area_hectare: number;
  coordenadas: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  user_id: string;
  created_at: string;
};

const FazendaCard = ({ 
  fazenda, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  fazenda: Fazenda;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  return (
    <Glass hover={true} className="p-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <i className="fa-solid fa-tractor text-primary text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-mono-900">{fazenda.nome}</h3>
            <p className="text-mono-600">{fazenda.area_hectare} hectares</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onView(fazenda.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Visualizar"
          >
            <i className="fa-solid fa-eye"></i>
          </button>
          <button 
            onClick={() => onEdit(fazenda.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={() => onDelete(fazenda.id)}
            className="p-2 text-mono-600 hover:text-red-500 transition-colors"
            title="Excluir"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-mono-500">Cidade</div>
          <div className="font-medium">{fazenda.cidade || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Estado</div>
          <div className="font-medium">{fazenda.estado || 'Não informado'}</div>
        </div>
      </div>
      
      {fazenda.coordenadas && (
        <div className="mb-4">
          <MapViewer 
            geoJSON={fazenda.coordenadas} 
            height="150px" 
            className="mt-3"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-mono-200">
        <div>
          <div className="text-sm text-mono-500">País</div>
          <div className="font-medium">{fazenda.pais || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-sm text-mono-500">Criada em</div>
          <div className="font-medium">
            {new Date(fazenda.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    </Glass>
  );
};

const FazendaDetailView = ({ 
  fazenda, 
  onClose, 
  onEdit
}: { 
  fazenda: Fazenda | null; 
  onClose: () => void; 
  onEdit: (id: string) => void;
}) => {
  if (!fazenda) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fa-solid fa-tractor text-primary"></i>
              <span>{fazenda.nome}</span>
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
                        <div className="font-medium">{fazenda.nome}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Área</div>
                        <div className="font-medium">{fazenda.area_hectare} hectares</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-mono-500">Cidade</div>
                        <div className="font-medium">{fazenda.cidade || 'Não informado'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-mono-500">Estado</div>
                        <div className="font-medium">{fazenda.estado || 'Não informado'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informações Adicionais</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-mono-500">País</div>
                      <div className="font-medium">{fazenda.pais || 'Não informado'}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-mono-500">Data de Criação</div>
                      <div className="font-medium">
                        {new Date(fazenda.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-mono-500">Proprietário</div>
                      <div className="font-medium">{fazenda.user_id}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Área e Localização</h3>
                {fazenda?.coordenadas ? (
                  <MapViewer geoJSON={fazenda.coordenadas} height="400px" />
                ) : (
                  <div className="text-mono-500 text-center py-8">
                    <i className="fa-solid fa-map-location-dot text-3xl mb-2"></i>
                    <p>Nenhuma área desenhada para esta fazenda</p>
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
              onClick={() => onEdit(fazenda.id)}
              className="button-primary"
            >
              Editar Fazenda
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

type FazendaFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  fazendaData?: any;
};

const FazendaFormModal: React.FC<FazendaFormModalProps> = ({
  isOpen,
  onClose,
  isEditing = false,
  fazendaData = {
    id: '',
    nome: '',
    area_hectare: '',
    coordenadas: '',
    cidade: '',
    estado: '',
    pais: '',
    user_id: '',
    created_at: '',
  },
}) => {
  const [formData, setFormData] = useState(fazendaData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setFormData(fazendaData);
  }, [fazendaData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordinatesChange = (coordinates: string) => {
    setFormData(prev => ({ ...prev, coordenadas: coordinates }));
  };

  const handleAreaChange = (area: number) => {
    setFormData(prev => ({ 
      ...prev, 
      area_hectare: area > 0 ? area.toFixed(2) : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      const fazendaParams = {
        nome: formData.nome,
        area_hectare: formData.area_hectare ? parseFloat(formData.area_hectare) : null,
        coordenadas: formData.coordenadas || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || null,
        user_id: user.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('fazendas')
          .update({
            ...fazendaParams,
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
          descricao: `Fazenda ${formData.nome} foi atualizada`,
          entidade_tipo: 'fazenda',
          entidade_id: formData.id
        });

        toast.success('Fazenda atualizada com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('fazendas')
          .insert(fazendaParams)
          .select('id')
          .single();

        if (error) {
          throw error;
        }

        // Registrar atividade
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'criacao',
          descricao: `Fazenda ${formData.nome} foi adicionada`,
          entidade_tipo: 'fazenda',
          entidade_id: data.id
        });

        toast.success('Fazenda adicionada com sucesso!');
      }

      onClose();
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} fazenda: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <Glass intensity="high" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar Fazenda' : 'Adicionar Nova Fazenda'}
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
                <label htmlFor="nome" className="block text-sm font-medium text-mono-700 mb-1">
                  Nome da Fazenda
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  className="input-field"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="area_hectare" className="block text-sm font-medium text-mono-700 mb-1">
                  Área (hectares)
                </label>
                <input
                  type="number"
                  id="area_hectare"
                  name="area_hectare"
                  className="input-field"
                  value={formData.area_hectare}
                  onChange={handleChange}
                  placeholder="Ex: 100.5"
                />
                <p className="text-sm text-mono-500 mt-1">
                  A área é calculada automaticamente ao desenhar no mapa.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-mono-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  className="input-field"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-mono-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  className="input-field"
                  value={formData.estado}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="pais" className="block text-sm font-medium text-mono-700 mb-1">
                País
              </label>
              <input
                type="text"
                id="pais"
                name="pais"
                className="input-field"
                value={formData.pais}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <FazendaGeolocation
                value={formData.coordenadas}
                onCoordinatesChange={handleCoordinatesChange}
                onAreaChange={handleAreaChange}
                initialArea={formData.area_hectare}
                readOnly={false}
              />
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
                  isEditing ? 'Salvar Alterações' : 'Adicionar Fazenda'
                )}
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  );
};

const Fazendas = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<string | null>(null);
  const [deletingFazenda, setDeletingFazenda] = useState<string | null>(null);
  const [viewingFazenda, setViewingFazenda] = useState<Fazenda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('fazendas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setFazendas(data || []);
      } catch (error) {
        console.error('Erro ao buscar fazendas:', error);
        toast.error('Erro ao carregar fazendas');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleEdit = (id: string) => {
    setEditingFazenda(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setDeletingFazenda(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleView = (id: string) => {
    const fazenda = fazendas.find(f => f.id === id) || null;
    setViewingFazenda(fazenda);
  };
  
  const confirmDelete = async () => {
    if (!deletingFazenda || !user) return;
    
    try {
      const fazenda = fazendas.find(f => f.id === deletingFazenda);
      
      const { error } = await supabase
        .from('fazendas')
        .delete()
        .eq('id', deletingFazenda);
        
      if (error) throw error;
      
      // Registrar atividade
      if (fazenda) {
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'exclusao',
          descricao: `Fazenda ${fazenda.nome} foi excluída`,
          entidade_tipo: 'fazenda',
          entidade_id: deletingFazenda
        });
      }
      
      setFazendas(prev => prev.filter(f => f.id !== deletingFazenda));
      toast.success('Fazenda excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir fazenda:', error);
      toast.error(`Erro ao excluir fazenda: ${error.message}`);
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingFazenda(null);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFazenda(null);
  };
  
  const filteredFazendas = fazendas.filter(fazenda => {
    return fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Fazendas" 
          subtitle="Gerencie suas propriedades rurais"
          icon="fa-solid fa-tractor"
          action={
            <button 
              onClick={() => setIsModalOpen(true)}
              className="button-primary"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Nova Fazenda
            </button>
          }
        />
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar fazendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mono-500">
              <i className="fa-solid fa-search"></i>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
          </div>
        ) : filteredFazendas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFazendas.map(fazenda => (
              <FazendaCard 
                key={fazenda.id} 
                fazenda={fazenda} 
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
            <h3 className="text-xl font-medium mb-1">Nenhuma fazenda encontrada</h3>
            <p className="text-mono-500">
              {searchTerm ? 
                `Não encontramos resultados para sua busca` : 
                "Você ainda não cadastrou nenhuma fazenda"
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="button-primary mt-4"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Adicionar Fazenda
              </button>
            )}
          </Glass>
        )}
        
        {/* Modal para adicionar/editar fazenda */}
        <FazendaFormModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingFazenda}
          fazendaData={
            editingFazenda 
              ? fazendas.find(f => f.id === editingFazenda)
              : { 
                id: '', 
                nome: '', 
                area_hectare: '', 
                coordenadas: '', 
                cidade: '', 
                estado: '', 
                pais: '', 
                user_id: '', 
                created_at: '' 
              }
          }
        />
        
        {/* Modal de confirmação de exclusão */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
            <div className="animate-scale-in w-full max-w-md">
              <Glass intensity="high" className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                <p className="text-mono-700 mb-6">
                  Tem certeza que deseja excluir esta fazenda? Esta ação não pode ser desfeita.
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
        {viewingFazenda && (
          <FazendaDetailView 
            fazenda={viewingFazenda} 
            onClose={() => setViewingFazenda(null)}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Layout>
  );
};

export default Fazendas;
