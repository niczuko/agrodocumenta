
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Tarefa } from '@/integrations/supabase/client';

export interface DashboardData {
  fazendas: number;
  talhoes: number;
  maquinarios: number;
  trabalhadores: number;
  atividades: any[];
  allActivities: any[];
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardData = (userId: string | undefined) => {
  const [data, setData] = useState<DashboardData>({
    fazendas: 0,
    talhoes: 0,
    maquinarios: 0,
    trabalhadores: 0,
    atividades: [],
    allActivities: [],
    isLoading: true,
    error: null,
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      try {
        // Fetch summary counts
        const { data: fazendasData, error: fazendasError } = await supabase
          .from('fazendas')
          .select('id')
          .eq('user_id', userId);
          
        if (fazendasError) throw fazendasError;

        // Extract all farm IDs
        const fazendaIds = fazendasData.map(fazenda => fazenda.id);
        if (fazendaIds.length === 0) {
          setData({
            fazendas: 0,
            talhoes: 0,
            maquinarios: 0,
            trabalhadores: 0,
            atividades: [],
            allActivities: [],
            isLoading: false,
            error: null
          });
          return;
        }

        // Fetch talhoes count
        const { count: talhoesCount, error: talhoesError } = await supabase
          .from('talhoes')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (talhoesError) throw talhoesError;

        // Fetch maquinarios count
        const { count: maquinariosCount, error: maquinariosError } = await supabase
          .from('maquinarios')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (maquinariosError) throw maquinariosError;

        // Fetch trabalhadores count
        const { count: trabalhadoresCount, error: trabalhadoresError } = await supabase
          .from('trabalhadores')
          .select('id', { count: 'exact', head: true })
          .in('fazenda_id', fazendaIds);
          
        if (trabalhadoresError) throw trabalhadoresError;

        // Fetch recent activities
        const { data: atividades, error: atividadesError } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (atividadesError) throw atividadesError;

        // Fetch all activities
        const { data: allAtividades, error: allAtividadesError } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (allAtividadesError) throw allAtividadesError;

        setData({
          fazendas: fazendasData.length,
          talhoes: talhoesCount || 0,
          maquinarios: maquinariosCount || 0,
          trabalhadores: trabalhadoresCount || 0,
          atividades: atividades || [],
          allActivities: allAtividades || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Erro ao carregar dados do dashboard');
        setData(prev => ({ ...prev, isLoading: false, error: error as Error }));
      }
    };

    fetchDashboardData();
  }, [userId]);
  
  return data;
};
