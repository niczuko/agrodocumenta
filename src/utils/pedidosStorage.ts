
import { Pedido } from '@/types/pedidos';
import { supabase } from '@/integrations/supabase/client';

// Função para salvar um pedido no armazenamento
export const salvarPedido = async (conteudo: string): Promise<boolean> => {
  try {
    const pedido: Pedido = {
      data: new Date().toISOString(),
      conteudo
    };
    
    // Carregar pedidos existentes
    const pedidosAntigos = await carregarPedidos();
    
    // Adicionar novo pedido
    const pedidosAtualizados = [...pedidosAntigos, pedido];
    
    // Salvar no localStorage como fallback
    localStorage.setItem('agroterra_pedidos', JSON.stringify(pedidosAtualizados));
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    return false;
  }
};

// Função para carregar todos os pedidos do armazenamento
export const carregarPedidos = async (): Promise<Pedido[]> => {
  try {
    // Tentar carregar do localStorage
    const pedidosString = localStorage.getItem('agroterra_pedidos');
    if (pedidosString) {
      return JSON.parse(pedidosString);
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    return [];
  }
};

// Função para carregar o último pedido do armazenamento
export const carregarUltimoPedido = async (): Promise<Pedido | null> => {
  try {
    const pedidos = await carregarPedidos();
    
    if (pedidos.length > 0) {
      return pedidos[pedidos.length - 1];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao carregar último pedido:', error);
    return null;
  }
};
