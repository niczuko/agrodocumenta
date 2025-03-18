
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Glass } from "@/components/ui/Glass";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mono-50 to-mono-100 p-4">
      <Glass className="max-w-md w-full p-8 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
          <i className="fa-solid fa-compass text-3xl"></i>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-mono-900">404</h1>
        <p className="text-xl text-mono-700 mb-6">Página não encontrada</p>
        
        <p className="text-mono-600 mb-8">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>
        
        <Link 
          to="/" 
          className="button-primary inline-flex items-center"
        >
          <i className="fa-solid fa-home mr-2"></i>
          Voltar para o Início
        </Link>
      </Glass>
    </div>
  );
};

export default NotFound;
