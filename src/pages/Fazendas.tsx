
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
  localizacao: string;
  area_total: number;
  descricao: string;
  data_aquisicao: string | null;
  talhoes_count?: number;
  maquinarios_count?: number;
  trabalhadores_count?: number;
};

// FazendaCard component
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
        <h3 className="text-xl font-semibold text-mono-900">{fazenda.nome}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(fazenda.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button 
            onClick={() => onView(fazenda.id)}
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Ver detalhes"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
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
      
      <p className="text-mono-600 mt-1">
        <i className="fa-solid fa-location-dot mr-1"></i> {fazenda.localizacao || 'Localização não informada'}
      </p>
      
      <div className="mt-4 flex items-center text-mono-700">
        <i className="fa-solid fa-ruler mr-1"></i>
        <span>{fazenda.area_total || 0} hectares</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-mono-200">
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.talhoes_count || 0}</div>
          <div className="text-mono-600 text-sm">Talhões</div>
        </div>
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.maquinarios_count || 0}</div>
          <div className="text-mono-600 text-sm">Maquinários</div>
        </div>
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.trabalhadores_count || 0}</div>
          <div className="text-mono-600 text-sm">Trabalhadores</div>
        </div>
      </div>
    </Glass>
  );
};

// Modal for adding/editing farms
const FazendaFormModal = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  fazendaData = { id: '', nome: '', localizacao: '', area_total: '', descricao: '', data_aquisicao: '' } 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  fazendaData?: { id: string; nome: string; localizacao: string; area_total: string; descricao: string; data_aquisicao: string; };
}) => {
  const [formData, setFormData] = useState(fazendaData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    setFormData(fazendaData);
  }, [fazendaData]);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const fazendaParams = {
        nome: formData.nome,
        localizacao: formData.localizacao || null,
        area_total: formData.area_total ? parseFloat(formData.area_total) : null,
        descricao: formData.descricao || null,
        data_aquisicao: formData.data_aquisicao || null,
        user_id: user.id
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('fazendas')
          .update({
            ...fazendaParams,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);
          
        if (error) throw error;
        
        // Register activity
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
          
        if (error) throw error;
        
        // Register activity
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-lg">
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
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  className="input-field"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Fazenda Esperança"
                />
              </div>
              
              <div>
                <label htmlFor="localizacao" className="block text-sm font-medium text-mono-700 mb-1">
                  Localização
                </label>
                <input
                  id="localizacao"
                  name="localizacao"
                  type="text"
                  className="input-field"
                  value={formData.localizacao}
                  onChange={handleChange}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="area_total" className="block text-sm font-medium text-mono-700 mb-1">
                Área Total (hectares)
              </label>
              <input
                id="area_total"
                name="area_total"
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={formData.area_total}
                onChange={handleChange}
                placeholder="Ex: 50.5"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="data_aquisicao" className="block text-sm font-medium text-mono-700 mb-1">
                Data de Aquisição
              </label>
              <input
                id="data_aquisicao"
                name="data_aquisicao"
                type="date"
                className="input-field"
                value={formData.data_aquisicao}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="descricao" className="block text-sm font-medium text-mono-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                className="input-field"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Informações adicionais sobre a fazenda"
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

// Confirmation modal for deleting farms
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  itemName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => Promise<void>;
  itemName: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md">
        <Glass intensity="high" className="p-6">
          <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
          <p className="text-mono-700 mb-6">
            Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="button-secondary"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="button-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Excluindo...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-trash mr-2"></i>
                  Excluir
                </>
              )}
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

const Fazendas = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<string | null>(null);
  const [deletingFazenda, setDeletingFazenda] = useState<Fazenda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFazendas = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get farms
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fazendasError) throw fazendasError;
        
        // Get counts for each farm
        const fazendaIds = (fazendasData || []).map(f => f.id);
        
        if (fazendaIds.length > 0) {
          // Get talhoes counts
          const { data: talhoesData, error: talhoesError } = await supabase
            .from('talhoes')
            .select('fazenda_id, count')
            .in('fazenda_id', fazendaIds)
            .group('fazenda_id');
            
          if (talhoesError) throw talhoesError;
          
          // Get maquinarios counts
          const { data: maquinariosData, error: maquinariosError } = await supabase
            .from('maquinarios')
            .select('fazenda_id, count')
            .in('fazenda_id', fazendaIds)
            .group('fazenda_id');
            
          if (maquinariosError) throw maquinariosError;
          
          // Get trabalhadores counts
          const { data: trabalhadoresData, error: trabalhadoresError } = await supabase
            .from('trabalhadores')
            .select('fazenda_id, count')
            .in('fazenda_id', fazendaIds)
            .group('fazenda_id');
            
          if (trabalhadoresError) throw trabalhadoresError;
          
          // Map counts to farms
          const fazendasWithCounts = (fazendasData || []).map(fazenda => {
            const talhoesCounts = talhoesData?.find(t => t.fazenda_id === fazenda.id);
            const maquinariosCounts = maquinariosData?.find(m => m.fazenda_id === fazenda.id);
            const trabalhadoresCounts = trabalhadoresData?.find(t => t.fazenda_id === fazenda.id);
            
            return {
              ...fazenda,
              talhoes_count: talhoesCounts ? parseInt(talhoesCounts.count) : 0,
              maquinarios_count: maquinariosCounts ? parseInt(maquinariosCounts.count) : 0,
              trabalhadores_count: trabalhadoresCounts ? parseInt(trabalhadoresCounts.count) : 0,
            };
          });
          
          setFazendas(fazendasWithCounts);
        } else {
          setFazendas([]);
        }
      } catch (error) {
        console.error('Erro ao buscar fazendas:', error);
        toast.error('Erro ao carregar fazendas');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFazendas();
  }, [user]);
  
  const handleEdit = (id: string) => {
    setEditingFazenda(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    const fazenda = fazendas.find(f => f.id === id);
    if (fazenda) {
      setDeletingFazenda(fazenda);
      setIsDeleteModalOpen(true);
    }
  };
  
  const handleView = (id: string) => {
    // For now, just redirect to talhoes with filter
    window.location.href = `/talhoes?fazenda=${id}`;
  };
  
  const confirmDelete = async () => {
    if (!deletingFazenda || !user) return;
    
    try {
      const { error } = await supabase
        .from('fazendas')
        .delete()
        .eq('id', deletingFazenda.id);
        
      if (error) throw error;
      
      // Register activity
      await supabase.from('atividades').insert({
        user_id: user.id,
        tipo: 'exclusao',
        descricao: `Fazenda ${deletingFazenda.nome} foi excluída`,
        entidade_tipo: 'fazenda',
        entidade_id: deletingFazenda.id
      });
      
      setFazendas(prev => prev.filter(f => f.id !== deletingFazenda.id));
      toast.success('Fazenda excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir fazenda:', error);
      toast.error(`Erro ao excluir fazenda: ${error.message}`);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFazenda(null);
  };
  
  const filteredFazendas = fazendas.filter(fazenda => 
    fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fazenda.localizacao && fazenda.localizacao.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Fazendas" 
          subtitle="Gerencie suas propriedades"
          icon="fa-solid fa-wheat-awn"
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
                `Não encontramos resultados para "${searchTerm}"` : 
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
        
        {/* Add/Edit Farm Modal */}
        <FazendaFormModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingFazenda}
          fazendaData={
            editingFazenda 
              ? {
                  id: editingFazenda,
                  nome: fazendas.find(f => f.id === editingFazenda)?.nome || '',
                  localizacao: fazendas.find(f => f.id === editingFazenda)?.localizacao || '',
                  area_total: fazendas.find(f => f.id === editingFazenda)?.area_total?.toString() || '',
                  descricao: fazendas.find(f => f.id === editingFazenda)?.descricao || '',
                  data_aquisicao: fazendas.find(f => f.id === editingFazenda)?.data_aquisicao || '',
                }
              : { id: '', nome: '', localizacao: '', area_total: '', descricao: '', data_aquisicao: '' }
          }
        />
        
        {/* Delete Confirmation Modal */}
        {deletingFazenda && (
          <DeleteConfirmModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => {
              setIsDeleteModalOpen(false);
              setDeletingFazenda(null);
            }}
            onConfirm={confirmDelete}
            itemName={deletingFazenda.nome}
          />
        )}
      </div>
    </Layout>
  );
};

export default Fazendas;
