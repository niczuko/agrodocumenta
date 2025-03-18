import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Glass } from '@/components/ui/Glass';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ProfileType = {
  id: string;
  nome: string;
  cargo: string;
  avatar_url: string | null;
};

const Perfil = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          toast.error('Não foi possível carregar seu perfil');
        } else if (data) {
          setProfile(data);
          setFormData({
            nome: data.nome || '',
            cargo: data.cargo || '',
          });
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          cargo: formData.cargo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Erro ao atualizar perfil: ' + error.message);
      } else {
        setProfile((prev) => 
          prev ? { ...prev, ...formData } : null
        );
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao salvar o perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-transition">
        <PageTitle 
          title="Perfil" 
          subtitle="Gerencie suas informações pessoais"
          icon="fa-solid fa-user"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Glass className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.nome} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <i className="fa-solid fa-user text-primary text-4xl"></i>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{profile?.nome || user?.email}</h3>
                <p className="text-mono-600">{profile?.cargo || 'Sem cargo definido'}</p>
                
                <button className="mt-4 button-secondary text-sm">
                  <i className="fa-solid fa-camera mr-2"></i>
                  Alterar foto
                </button>
              </div>
              
              <div className="border-t border-mono-200 mt-6 pt-6">
                <div className="text-mono-700 mb-2">
                  <i className="fa-solid fa-envelope mr-2 text-mono-500"></i> {user?.email}
                </div>
                <div className="text-mono-700">
                  <i className="fa-solid fa-calendar mr-2 text-mono-500"></i> 
                  Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
            </Glass>
          </div>
          
          <div className="lg:col-span-2">
            <Glass className="p-6">
              <h3 className="text-xl font-semibold mb-6">Informações Pessoais</h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <i className="fa-solid fa-circle-notch fa-spin text-primary text-xl"></i>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-mono-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        className="input-field"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cargo" className="block text-sm font-medium text-mono-700 mb-1">
                        Cargo/Função
                      </label>
                      <input
                        id="cargo"
                        name="cargo"
                        type="text"
                        className="input-field"
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Ex: Administrador, Gerente, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-mono-200 pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="button-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </Glass>
            
            <Glass className="p-6 mt-6">
              <h3 className="text-xl font-semibold mb-6">Segurança</h3>
              
              <div className="mb-6">
                <button className="button-secondary w-full md:w-auto">
                  <i className="fa-solid fa-lock mr-2"></i>
                  Alterar Senha
                </button>
              </div>
              
              <div className="border-t border-mono-200 pt-6">
                <h4 className="font-medium text-mono-800 mb-2">Sessões ativas</h4>
                <p className="text-mono-600 mb-4">Gerencie onde você está conectado.</p>
                
                <div className="bg-mono-100 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i className="fa-solid fa-laptop text-primary"></i>
                      </div>
                      <div>
                        <div className="font-medium">Este dispositivo</div>
                        <div className="text-sm text-mono-500">Último acesso: Agora</div>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium flex items-center">
                      <i className="fa-solid fa-circle text-xs mr-1"></i> Ativo
                    </div>
                  </div>
                </div>
              </div>
            </Glass>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Perfil;
