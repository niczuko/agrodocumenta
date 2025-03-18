// Fix for Fazendas.tsx to properly calculate counts without using .group()
// This replacement approach calculates counts manually after fetching all related records

// Import required components and utilities
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Glass } from '@/components/ui/Glass';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types for data
type Fazenda = {
  id: string;
  nome: string;
  endereco: string;
  area_total: number;
  cidade: string;
  estado: string;
  created_at: string;
  user_id: string;
  stats?: {
    talhoes: number;
    trabalhadores: number;
    maquinarios: number;
  }
};

// Extended type for database response
type FazendaDB = {
  id: string;
  nome: string;
  localizacao: string | null;
  descricao: string | null;
  user_id: string;
  area_total: number | null;
  data_aquisicao: string | null;
  created_at: string;
  updated_at: string;
};

// Fazenda Form component
const FazendaForm = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  fazendaData = { id: '', nome: '', endereco: '', area_total: '', cidade: '', estado: '' },
  onAddFazenda
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  fazendaData?: { id: string; nome: string; endereco: string; area_total: string; cidade: string; estado: string; };
  onAddFazenda: (fazenda: Fazenda) => void;
}) => {
  const [formData, setFormData] = useState(fazendaData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    setFormData(fazendaData);
  }, [fazendaData]);
  
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
      
      const fazendaParams = {
        nome: formData.nome,
        localizacao: formData.endereco,
        descricao: `${formData.cidade}, ${formData.estado}`,
        area_total: formData.area_total ? parseFloat(formData.area_total) : 0,
        user_id: user.id
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('fazendas')
          .update(fazendaParams)
          .eq('id', formData.id);
          
        if (error) {
          throw error;
        }
        
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
          .select('*')
          .single();
          
        if (error) {
          throw error;
        }
        
        // Properly transform the DB data to match our Fazenda type
        const newFazenda: Fazenda = {
          id: data.id,
          nome: data.nome,
          endereco: data.localizacao || '',
          area_total: data.area_total || 0,
          cidade: data.descricao?.split(',')[0]?.trim() || '',
          estado: data.descricao?.split(',')[1]?.trim() || '',
          created_at: data.created_at,
          user_id: data.user_id,
          stats: {
            talhoes: 0,
            trabalhadores: 0,
            maquinarios: 0
          }
        };
        
        // Add the new farm to the state
        onAddFazenda(newFazenda);
        
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
      <div className="animate-scale-in w-full max-w-2xl">
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
                  placeholder="Ex: Fazenda São João"
                />
              </div>
              
              <div>
                <label htmlFor="area_total" className="block text-sm font-medium text-mono-700 mb-1">
                  Área Total (ha)
                </label>
                <input
                  id="area_total"
                  name="area_total"
                  type="number"
                  className="input-field"
                  value={formData.area_total}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="endereco" className="block text-sm font-medium text-mono-700 mb-1">
                Endereço
              </label>
              <input
                id="endereco"
                name="endereco"
                type="text"
                className="input-field"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Estrada Municipal, Km 5"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-mono-700 mb-1">
                  Cidade
                </label>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  className="input-field"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Ex: Ribeirão Preto"
                />
              </div>
              
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-mono-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  className="input-field"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="">Selecione um estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
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

// Fazenda Card component
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
    <Glass hover={true} className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-wheat-awn text-primary text-lg sm:text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-mono-900 line-clamp-1">{fazenda.nome}</h3>
            <p className="text-mono-600 text-sm sm:text-base">{fazenda.cidade}, {fazenda.estado}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4 sm:mb-0">
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
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Endereço</div>
          <div className="font-medium text-sm sm:text-base truncate">{fazenda.endereco || 'Não informado'}</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-mono-500">Área Total</div>
          <div className="font-medium text-sm sm:text-base">{fazenda.area_total ? `${fazenda.area_total.toLocaleString('pt-BR')} ha` : 'Não informado'}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-4 border-t border-mono-200">
        <div className="text-center">
          <div className="text-mono-500 text-xs">Talhões</div>
          <div className="font-semibold text-lg">{fazenda.stats?.talhoes || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-mono-500 text-xs">Maquinários</div>
          <div className="font-semibold text-lg">{fazenda.stats?.maquinarios || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-mono-500 text-xs">Funcionários</div>
          <div className="font-semibold text-lg">{fazenda.stats?.trabalhadores || 0}</div>
        </div>
      </div>
    </Glass>
  );
};

// Fazenda Detail View component
const FazendaDetailView = ({ 
  fazenda, 
  onClose 
}: { 
  fazenda: Fazenda | null; 
  onClose: () => void; 
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [maquinarios, setMaquinarios] = useState<any[]>([]);
  const [trabalhadores, setTrabalhadores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    talhoes: false,
    maquinarios: false,
    trabalhadores: false
  });
  
  useEffect(() => {
    if (!fazenda) return;
    
    const fetchRelatedData = async () => {
      // Fetch talhoes
      setIsLoading(prev => ({ ...prev, talhoes: true }));
      const { data: talhoesData, error: talhoesError } = await supabase
        .from('talhoes')
        .select('*')
        .eq('fazenda_id', fazenda.id);
      
      if (!talhoesError && talhoesData) {
        setTalhoes(talhoesData);
      }
      setIsLoading(prev => ({ ...prev, talhoes: false }));
      
      // Fetch maquinarios
      setIsLoading(prev => ({ ...prev, maquinarios: true }));
      const { data: maquinariosData, error: maquinariosError } = await supabase
        .from('maquinarios')
        .select('*')
        .eq('fazenda_id', fazenda.id);
      
      if (!maquinariosError && maquinariosData) {
        setMaquinarios(maquinariosData);
      }
      setIsLoading(prev => ({ ...prev, maquinarios: false }));
      
      // Fetch trabalhadores
      setIsLoading(prev => ({ ...prev, trabalhadores: true }));
      const { data: trabalhadoresData, error: trabalhadoresError } = await supabase
        .from('trabalhadores')
        .select('*')
        .eq('fazenda_id', fazenda.id);
      
      if (!trabalhadoresError && trabalhadoresData) {
        setTrabalhadores(trabalhadoresData);
      }
      setIsLoading(prev => ({ ...prev, trabalhadores: false }));
    };
    
    fetchRelatedData();
  }, [fazenda]);
  
  if (!fazenda) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Glass intensity="high" className="p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-mono-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <i className="fa-solid fa-wheat-awn text-primary"></i>
              <span>{fazenda.nome}</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-mono-100"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <Tabs defaultValue="info" className="p-6" onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-6 w-full sm:w-auto flex">
                <TabsTrigger value="info" className="flex-1 sm:flex-initial flex items-center gap-2">
                  <i className="fa-solid fa-info-circle"></i>
                  <span className="truncate">Informações</span>
                </TabsTrigger>
                <TabsTrigger value="talhoes" className="flex-1 sm:flex-initial flex items-center gap-2">
                  <i className="fa-solid fa-layer-group"></i>
                  <span className="truncate">Talhões</span>
                </TabsTrigger>
                <TabsTrigger value="maquinarios" className="flex-1 sm:flex-initial flex items-center gap-2">
                  <i className="fa-solid fa-tractor"></i>
                  <span className="truncate">Maquinários</span>
                </TabsTrigger>
                <TabsTrigger value="trabalhadores" className="flex-1 sm:flex-initial flex items-center gap-2">
                  <i className="fa-solid fa-users"></i>
                  <span className="truncate">Trabalhadores</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Dados Gerais</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-mono-500">Nome</div>
                        <div className="font-medium">{fazenda.nome}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-sm text-mono-500">Endereço</div>
                        <div className="font-medium">{fazenda.endereco || 'Não informado'}</div>
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
                      <Separator />
                      <div>
                        <div className="text-sm text-mono-500">Área Total</div>
                        <div className="font-medium">{fazenda.area_total ? `${fazenda.area_total.toLocaleString('pt-BR')} hectares` : 'Não informado'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-mono-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">{talhoes.length || 0}</div>
                        <div className="text-mono-600 text-sm">Talhões</div>
                      </div>
                      <div className="text-center p-4 bg-mono-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">{maquinarios.length || 0}</div>
                        <div className="text-mono-600 text-sm">Maquinários</div>
                      </div>
                      <div className="text-center p-4 bg-mono-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">{trabalhadores.length || 0}</div>
                        <div className="text-mono-600 text-sm">Trabalhadores</div>
                      </div>
                    </div>
                    
                    <div className="bg-mono-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Criado em</h4>
                      <p className="text-mono-600">
                        {new Date(fazenda.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="talhoes">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Talhões</h3>
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Adicionar Talhão
                    </Button>
                  </div>
                  
                  {isLoading.talhoes ? (
                    <div className="flex justify-center py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
                    </div>
                  ) : talhoes.length === 0 ? (
                    <div className="text-center py-12 text-mono-500">
                      <i className="fa-solid fa-layer-group text-4xl mb-2"></i>
                      <p className="text-lg mb-1">Nenhum talhão cadastrado</p>
                      <p className="text-sm">Adicione talhões para gerenciar sua área de cultivo</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {talhoes.map((talhao) => (
                        <div key={talhao.id} className="border rounded-lg p-4">
                          <div className="font-semibold mb-2">{talhao.nome || 'Talhão sem nome'}</div>
                          <div className="text-sm text-mono-500">
                            <div>Área: {talhao.area ? `${talhao.area} ha` : 'N/A'}</div>
                            <div>Cultura: {talhao.cultura || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="maquinarios">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Maquinários</h3>
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Adicionar Maquinário
                    </Button>
                  </div>
                  
                  {isLoading.maquinarios ? (
                    <div className="flex justify-center py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
                    </div>
                  ) : maquinarios.length === 0 ? (
                    <div className="text-center py-12 text-mono-500">
                      <i className="fa-solid fa-tractor text-4xl mb-2"></i>
                      <p className="text-lg mb-1">Nenhum maquinário cadastrado</p>
                      <p className="text-sm">Adicione maquinários para gerenciar seus equipamentos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {maquinarios.map((maquinario) => (
                        <div key={maquinario.id} className="border rounded-lg p-4">
                          <div className="font-semibold mb-2">{maquinario.nome || 'Maquinário sem nome'}</div>
                          <div className="text-sm text-mono-500">
                            <div>Modelo: {maquinario.modelo || 'N/A'}</div>
                            <div>Ano: {maquinario.ano || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trabalhadores">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Trabalhadores</h3>
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                      <i className="fa-solid fa-plus mr-2"></i>
                      Adicionar Trabalhador
                    </Button>
                  </div>
                  
                  {isLoading.trabalhadores ? (
                    <div className="flex justify-center py-12">
                      <i className="fa-solid fa-circle-notch fa-spin text-primary text-2xl"></i>
                    </div>
                  ) : trabalhadores.length === 0 ? (
                    <div className="text-center py-12 text-mono-500">
                      <i className="fa-solid fa-users text-4xl mb-2"></i>
                      <p className="text-lg mb-1">Nenhum trabalhador cadastrado</p>
                      <p className="text-sm">Adicione trabalhadores para gerenciar sua equipe</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {trabalhadores.map((trabalhador) => (
                        <div key={trabalhador.id} className="border rounded-lg p-4">
                          <div className="font-semibold mb-2">{trabalhador.nome || 'Trabalhador sem nome'}</div>
                          <div className="text-sm text-mono-500">
                            <div>Função: {trabalhador.funcao || 'N/A'}</div>
                            <div>Contato: {trabalhador.contato || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

// Delete Confirmation Modal
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-900/50 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md">
        <Glass intensity="high" className="p-6">
          <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
          <p className="text-mono-700 mb-6">
            Tem certeza que deseja excluir esta fazenda? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="button-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="button-destructive"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              Excluir
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

// Main Fazendas component
const Fazendas = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<string | null>(null);
  const [deletingFazenda, setDeletingFazenda] = useState<string | null>(null);
  const [viewingFazenda, setViewingFazenda] = useState<Fazenda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFazendas = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all farms for this user
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (fazendasError) throw fazendasError;
        
        // For each farm, fetch additional statistics
        const enhancedFazendas = await Promise.all((fazendasData as FazendaDB[]).map(async (fazendaDB: FazendaDB) => {
          // Count talhoes
          const { count: talhoesCount, error: talhoesError } = await supabase
            .from('talhoes')
            .select('id', { count: 'exact', head: true })
            .eq('fazenda_id', fazendaDB.id);
            
          if (talhoesError) throw talhoesError;
          
          // Count maquinarios
          const { count: maquinariosCount, error: maquinariosError } = await supabase
            .from('maquinarios')
            .select('id', { count: 'exact', head: true })
            .eq('fazenda_id', fazendaDB.id);
            
          if (maquinariosError) throw maquinariosError;
          
          // Count trabalhadores
          const { count: trabalhadoresCount, error: trabalhadoresError } = await supabase
            .from('trabalhadores')
            .select('id', { count: 'exact', head: true })
            .eq('fazenda_id', fazendaDB.id);
            
          if (trabalhadoresError) throw trabalhadoresError;
          
          // Transform FazendaDB to Fazenda
          const fazenda: Fazenda = {
            id: fazendaDB.id,
            nome: fazendaDB.nome,
            endereco: fazendaDB.localizacao || '',
            area_total: fazendaDB.area_total || 0,
            cidade: fazendaDB.descricao?.split(',')[0]?.trim() || '',
            estado: fazendaDB.descricao?.split(',')[1]?.trim() || '',
            created_at: fazendaDB.created_at,
            user_id: fazendaDB.user_id,
            stats: {
              talhoes: talhoesCount || 0,
              maquinarios: maquinariosCount || 0,
              trabalhadores: trabalhadoresCount || 0
            }
          };
          
          return fazenda;
        }));
        
        setFazendas(enhancedFazendas);
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
  
  const handleAddFazenda = (newFazenda: Fazenda) => {
    setFazendas(prev => [newFazenda, ...prev]);
  };
  
  const handleDelete = (id: string) => {
    setDeletingFazenda(id);
    setIsDeleteModalOpen(true);
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
      
      // Register activity
      if (fazenda) {
        await supabase.from('atividades').insert({
          user_id: user.id,
          tipo: 'exclusao',
          descricao: `Fazenda ${fazenda.nome} foi excluída`,
          entidade_tipo: 'fazenda',
          entidade_id: deletingFazenda
        });
      }
      
      // Update fazendas list without reloading
      setFazendas(prev => prev.filter(f => f.id !== deletingFazenda));
      toast.success('Fazenda excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir fazenda:', error);
      toast.error(`Erro ao excluir fazenda: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingFazenda(null);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFazenda(null);
  };
  
  const filteredFazendas = fazendas.filter(fazenda =>
    fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fazenda.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fazenda.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Fazendas" 
          subtitle="Gerencie suas propriedades rurais"
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
              placeholder="Buscar fazendas por nome, cidade ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full md:w-1/2"
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
        
        {/* Farm Form Modal */}
        <FazendaForm 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingFazenda}
          fazendaData={
            editingFazenda 
              ? {
                  id: editingFazenda,
                  nome: fazendas.find(f => f.id === editingFazenda)?.nome || '',
                  endereco: fazendas.find(f => f.id === editingFazenda)?.endereco || '',
                  area_total: fazendas.find(f => f.id === editingFazenda)?.area_total?.toString() || '',
                  cidade: fazendas.find(f => f.id === editingFazenda)?.cidade || '',
                  estado: fazendas.find(f => f.id === editingFazenda)?.estado || ''
                }
              : { id: '', nome: '', endereco: '', area_total: '', cidade: '', estado: '' }
          }
          onAddFazenda={handleAddFazenda}
        />
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
        
        {/* Farm Detail View */}
        {viewingFazenda && (
          <FazendaDetailView 
            fazenda={viewingFazenda} 
            onClose={() => setViewingFazenda(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Fazendas;

