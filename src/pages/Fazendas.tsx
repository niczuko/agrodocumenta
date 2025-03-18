
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Glass } from '@/components/ui/Glass';
import { PageTitle } from '@/components/ui/PageTitle';
import { cn } from '@/lib/utils';

// Componente para o modal de adicionar/editar fazenda
const FazendaModal = ({ 
  isOpen, 
  onClose, 
  isEditing = false, 
  fazendaData = { nome: '', localizacao: '', area: '', descricao: '' } 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isEditing?: boolean; 
  fazendaData?: { nome: string; localizacao: string; area: string; descricao: string; };
}) => {
  const [formData, setFormData] = useState(fazendaData);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados da fazenda:", formData);
    // Aqui seria feita a chamada para API/Supabase
    onClose();
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
                  required
                  className="input-field"
                  value={formData.localizacao}
                  onChange={handleChange}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="area" className="block text-sm font-medium text-mono-700 mb-1">
                Área Total (hectares)
              </label>
              <input
                id="area"
                name="area"
                type="number"
                min="0"
                step="0.01"
                required
                className="input-field"
                value={formData.area}
                onChange={handleChange}
                placeholder="Ex: 50.5"
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
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button-primary"
              >
                {isEditing ? 'Salvar Alterações' : 'Adicionar Fazenda'}
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  );
};

// Card de fazenda
const FazendaCard = ({ 
  fazenda, 
  onEdit 
}: { 
  fazenda: { 
    id: string; 
    nome: string; 
    localizacao: string; 
    area: number; 
    talhoes: number; 
    maquinarios: number;
    trabalhadores: number;
  }; 
  onEdit: (id: string) => void; 
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
            className="p-2 text-mono-600 hover:text-primary transition-colors"
            title="Ver detalhes"
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </button>
        </div>
      </div>
      
      <p className="text-mono-600 mt-1">
        <i className="fa-solid fa-location-dot mr-1"></i> {fazenda.localizacao}
      </p>
      
      <div className="mt-4 flex items-center text-mono-700">
        <i className="fa-solid fa-ruler mr-1"></i>
        <span>{fazenda.area} hectares</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-mono-200">
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.talhoes}</div>
          <div className="text-mono-600 text-sm">Talhões</div>
        </div>
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.maquinarios}</div>
          <div className="text-mono-600 text-sm">Maquinários</div>
        </div>
        <div className="text-center">
          <div className="text-mono-900 font-semibold">{fazenda.trabalhadores}</div>
          <div className="text-mono-600 text-sm">Trabalhadores</div>
        </div>
      </div>
    </Glass>
  );
};

// Dados de exemplo
const fazendasMock = [
  { id: '1', nome: 'Fazenda Esperança', localizacao: 'Ribeirão Preto, SP', area: 120, talhoes: 5, maquinarios: 3, trabalhadores: 8 },
  { id: '2', nome: 'Estância Nova Era', localizacao: 'Campinas, SP', area: 75, talhoes: 4, maquinarios: 2, trabalhadores: 6 },
  { id: '3', nome: 'Fazenda Sul', localizacao: 'Jundiaí, SP', area: 95, talhoes: 3, maquinarios: 2, trabalhadores: 4 },
];

const Fazendas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleEdit = (id: string) => {
    setEditingFazenda(id);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFazenda(null);
  };
  
  const filteredFazendas = fazendasMock.filter(fazenda => 
    fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fazenda.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        {filteredFazendas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFazendas.map(fazenda => (
              <FazendaCard 
                key={fazenda.id} 
                fazenda={fazenda} 
                onEdit={handleEdit} 
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
        
        {/* Modal */}
        <FazendaModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          isEditing={!!editingFazenda}
          fazendaData={
            editingFazenda 
              ? {
                  nome: fazendasMock.find(f => f.id === editingFazenda)?.nome || '',
                  localizacao: fazendasMock.find(f => f.id === editingFazenda)?.localizacao || '',
                  area: fazendasMock.find(f => f.id === editingFazenda)?.area.toString() || '',
                  descricao: ''
                }
              : { nome: '', localizacao: '', area: '', descricao: '' }
          }
        />
      </div>
    </Layout>
  );
};

export default Fazendas;
