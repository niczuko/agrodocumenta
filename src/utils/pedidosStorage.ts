
import { Pedido, Pedidos } from "@/types/pedidos";

const STORAGE_KEY = "agroterra_pedidos";

// Função para salvar um novo pedido
export const salvarPedido = (conteudo: string): void => {
  const pedidos = obterPedidos();
  const novoPedido: Pedido = {
    data: new Date().toISOString(),
    conteudo
  };
  
  pedidos.push(novoPedido);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
};

// Função para obter todos os pedidos
export const obterPedidos = (): Pedidos => {
  const pedidosJson = localStorage.getItem(STORAGE_KEY);
  return pedidosJson ? JSON.parse(pedidosJson) : [];
};

// Função para limpar todos os pedidos (utilidade para testes)
export const limparPedidos = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
