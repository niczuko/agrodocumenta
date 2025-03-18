
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Glass } from '@/components/ui/Glass';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { accentColor } = useTheme();
  const { signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(email, password);
    
    setIsLoading(false);
    if (error) {
      setError(error.message);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-mono-50 to-mono-100">
      {/* Elementos decorativos no fundo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-[20%] w-64 h-64 rounded-full bg-primary/5 filter blur-[80px]"></div>
        <div className="absolute bottom-20 right-[20%] w-72 h-72 rounded-full bg-primary/10 filter blur-[100px]"></div>
        <div className="absolute top-[40%] right-[30%] w-40 h-40 rounded-full bg-primary/5 filter blur-[60px]"></div>
      </div>
      
      <div className="w-full max-w-md z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <i className="fa-solid fa-seedling text-primary text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-mono-900">AgroTerra</h1>
          <p className="text-mono-600 mt-2">Gestão inteligente para sua fazenda</p>
        </div>
        
        <Glass 
          intensity="high" 
          hover={true} 
          className="p-8"
        >
          <h2 className="text-xl font-semibold mb-6 text-mono-900">Criar Conta</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-mono-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-mono-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-mono-700 mb-1">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "button-primary w-full flex items-center justify-center",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Criando Conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-mono-600">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </div>
        </Glass>
        
        <div className="mt-8 text-center text-sm text-mono-500">
          &copy; {new Date().getFullYear()} AgroTerra. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
