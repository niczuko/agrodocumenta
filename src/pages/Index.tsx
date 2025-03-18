
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Glass } from '@/components/ui/Glass';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Componente para o indicador de animação
const AnimatedIndicator = ({ active = false }: { active?: boolean }) => {
  return (
    <div className={cn(
      "w-2 h-2 rounded-full transition-all duration-300",
      active ? "bg-primary scale-110" : "bg-mono-300"
    )}></div>
  );
};

// Componente de seção para a landing page
interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

const Section = ({ id, className, children }: SectionProps) => (
  <section id={id} className={cn("py-20 px-4", className)}>
    <div className="container mx-auto max-w-6xl">
      {children}
    </div>
  </section>
);

const Index = () => {
  const { accentColor, setAccentColor } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  // Demo login
  const handleDemoLogin = () => {
    navigate('/dashboard');
  };
  
  // Efeitos de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Rotação automática dos slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Features
  const features = [
    {
      icon: "fa-solid fa-wheat-awn",
      title: "Gestão de Fazendas",
      description: "Cadastre e organize todas as suas propriedades em um só lugar."
    },
    {
      icon: "fa-solid fa-layer-group",
      title: "Controle de Talhões",
      description: "Divida sua terra em talhões para melhor gerenciamento do cultivo."
    },
    {
      icon: "fa-solid fa-tractor",
      title: "Maquinários",
      description: "Registre todos os equipamentos utilizados em suas operações."
    },
    {
      icon: "fa-solid fa-users",
      title: "Trabalhadores",
      description: "Gerencie sua equipe e atribua tarefas de forma eficiente."
    },
    {
      icon: "fa-solid fa-chart-line",
      title: "Análise de Dados",
      description: "Visualize relatórios detalhados sobre sua produção."
    },
    {
      icon: "fa-solid fa-cloud",
      title: "Acesso na Nuvem",
      description: "Acesse suas informações de qualquer lugar, a qualquer momento."
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-mono-50 to-mono-100">
      {/* Header fixo */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 px-4",
        scrolled ? "bg-white/70 backdrop-blur-md shadow-subtle" : "bg-transparent"
      )}>
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <i className="fa-solid fa-seedling"></i>
            </div>
            <span className="font-semibold text-xl">AgroTerra</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#inicio" className="text-mono-700 hover:text-primary transition-colors">Início</a>
            <a href="#recursos" className="text-mono-700 hover:text-primary transition-colors">Recursos</a>
            <a href="#sobre" className="text-mono-700 hover:text-primary transition-colors">Sobre</a>
            <a href="#contato" className="text-mono-700 hover:text-primary transition-colors">Contato</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-primary hover:text-primary-foreground hover:bg-primary/10 rounded-lg transition-colors"
            >
              Entrar
            </Link>
            <Link 
              to="/cadastro" 
              className="hidden md:block button-primary"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <Section id="inicio" className="pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 animate-fade-in">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
              <span className="text-sm font-medium">Gestão agrícola simplificada</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-mono-900 mb-6">
              Transforme sua fazenda com tecnologia inteligente
            </h1>
            <p className="text-lg text-mono-600 mb-8">
              Gerencie fazendas, talhões, maquinários e trabalhadores em uma única plataforma intuitiva. 
              Maximize sua produtividade e tome decisões baseadas em dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleDemoLogin}
                className="button-primary"
              >
                Explorar Demo
              </button>
              <a 
                href="#recursos" 
                className="button-secondary"
              >
                Conhecer recursos
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-xs"
                  >
                    <i className="fa-solid fa-user"></i>
                  </div>
                ))}
              </div>
              <p className="text-mono-600 text-sm">
                Mais de <span className="font-semibold text-mono-800">500+ fazendeiros</span> já usam nossa plataforma
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="relative overflow-hidden rounded-xl shadow-glass w-full max-w-lg mx-auto animate-scale-in">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Fazenda gerenciada com AgroTerra" 
                className="w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"></div>
              
              {/* Elementos decorativos */}
              <div className="absolute top-4 right-4 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <AnimatedIndicator key={i} active={currentSlide === i} />
                ))}
              </div>
              
              <Glass 
                className="absolute bottom-4 left-4 right-4 p-4"
                intensity="high"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Fazenda Esperança</h3>
                    <p className="text-sm text-mono-600">5 talhões • 8 trabalhadores</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                </div>
              </Glass>
            </div>
            
            {/* Dot pattern */}
            <div className="absolute -z-10 top-20 -right-10 w-32 h-32 grid grid-cols-6 gap-1">
              {[...Array(36)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 h-1 rounded-full bg-primary/20"
                ></div>
              ))}
            </div>
            
            {/* Colored blobs */}
            <div className="absolute -z-10 -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary/10 filter blur-3xl opacity-60"></div>
          </div>
        </div>
      </Section>
      
      {/* Features section */}
      <Section id="recursos" className="bg-mono-50 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
            <span className="text-sm font-medium">Recursos poderosos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-mono-900 mb-4">
            Tudo que você precisa para gerenciar sua fazenda
          </h2>
          <p className="text-mono-600">
            Projetado para atender às necessidades específicas do agronegócio, 
            com ferramentas intuitivas que simplificam sua gestão diária.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Glass 
              key={index} 
              hover={true}
              className="p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <i className={`${feature.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-mono-900 mb-2">{feature.title}</h3>
              <p className="text-mono-600">{feature.description}</p>
            </Glass>
          ))}
        </div>
      </Section>
      
      {/* Testimonials / About section */}
      <Section id="sobre" className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full mb-4">
              <span className="text-sm font-medium">Sobre nós</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-mono-900 mb-6">
              Transformando o agronegócio com tecnologia
            </h2>
            <p className="text-mono-600 mb-6">
              Criamos o AgroTerra com uma missão clara: tornar a gestão agrícola mais simples e eficiente. 
              Nossa plataforma nasceu da colaboração com produtores rurais que enfrentavam desafios diários 
              no gerenciamento de suas operações.
            </p>
            <p className="text-mono-600 mb-8">
              Combinamos experiência em agricultura com tecnologia de ponta para oferecer um sistema que realmente entende 
              e atende às necessidades do campo, permitindo decisões mais inteligentes e resultados melhores.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="button-primary">
                <i className="fa-solid fa-phone-alt mr-2"></i>
                Fale Conosco
              </button>
              <button className="button-secondary">
                <i className="fa-solid fa-envelope mr-2"></i>
                Solicitar Demo
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <Glass className="p-6">
              <div className="flex gap-4 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="fa-solid fa-star text-yellow-500"></i>
                ))}
              </div>
              <p className="text-mono-700 mb-4">
                "O AgroTerra transformou a maneira como gerencio minha fazenda. 
                Agora tenho controle total sobre cada talhão e equipamento, 
                o que nos ajudou a aumentar a produtividade em mais de 30%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fa-solid fa-user text-primary"></i>
                </div>
                <div>
                  <div className="font-medium">João Silva</div>
                  <div className="text-sm text-mono-500">Fazenda Esperança, SP</div>
                </div>
              </div>
            </Glass>
            
            <Glass className="p-6">
              <div className="flex gap-4 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="fa-solid fa-star text-yellow-500"></i>
                ))}
              </div>
              <p className="text-mono-700 mb-4">
                "A facilidade de uso é impressionante. Mesmo funcionários com pouca experiência 
                em tecnologia conseguiram se adaptar rapidamente. A integração entre todas as 
                funções economiza horas do nosso tempo diariamente."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <i className="fa-solid fa-user text-primary"></i>
                </div>
                <div>
                  <div className="font-medium">Maria Oliveira</div>
                  <div className="text-sm text-mono-500">Estância Nova Era, MG</div>
                </div>
              </div>
            </Glass>
          </div>
        </div>
      </Section>
      
      {/* CTA section */}
      <Section id="contato" className="bg-mono-50 py-24">
        <Glass intensity="high" className="px-6 py-16 text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <span className="text-sm font-medium">Comece agora mesmo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-mono-900 mb-6">
            Pronto para revolucionar sua gestão agrícola?
          </h2>
          <p className="text-mono-600 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de produtores que já estão usando o AgroTerra para 
            transformar suas operações e aumentar a eficiência.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/cadastro" className="button-primary">
              <i className="fa-solid fa-user-plus mr-2"></i>
              Criar Conta Gratuita
            </Link>
            <Link to="/login" className="button-secondary">
              <i className="fa-solid fa-sign-in-alt mr-2"></i>
              Fazer Login
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-mono-500">
            Não precisa de cartão de crédito • Teste gratuito por 14 dias
          </div>
        </Glass>
      </Section>
      
      {/* Footer */}
      <footer className="bg-mono-900 text-mono-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="fa-solid fa-seedling text-primary"></i>
                </div>
                <span className="font-semibold text-white text-xl">AgroTerra</span>
              </div>
              <p className="mb-4 text-mono-400">
                Transformando a gestão agrícola com tecnologia inteligente.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#inicio" className="hover:text-primary transition-colors">Início</a></li>
                <li><a href="#recursos" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#sobre" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#contato" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary transition-colors">Gestão de Fazendas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Controle de Talhões</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Maquinários</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Trabalhadores</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-envelope w-5"></i>
                  <span>contato@agroterra.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-phone w-5"></i>
                  <span>(11) 3456-7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot w-5"></i>
                  <span>São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-mono-800 text-center text-mono-500 text-sm">
            &copy; {new Date().getFullYear()} AgroTerra. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      
      {/* Escolhedor de tema fixo (apenas para demonstração) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Glass className="p-3 shadow-glass-hover">
          <div className="flex gap-2">
            <button 
              onClick={() => setAccentColor('green')}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-300",
                accentColor === 'green' ? "ring-2 ring-mono-300 scale-110" : ""
              )}
              style={{ backgroundColor: '#588157' }}
              title="Verde"
            />
            <button 
              onClick={() => setAccentColor('blue')}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-300",
                accentColor === 'blue' ? "ring-2 ring-mono-300 scale-110" : ""
              )}
              style={{ backgroundColor: '#457b9d' }}
              title="Azul"
            />
            <button 
              onClick={() => setAccentColor('brown')}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-300",
                accentColor === 'brown' ? "ring-2 ring-mono-300 scale-110" : ""
              )}
              style={{ backgroundColor: '#6c584c' }}
              title="Marrom"
            />
          </div>
        </Glass>
      </div>
    </div>
  );
};

export default Index;
