
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./components/Cadastro";
import Dashboard from "./pages/Dashboard";
import Fazendas from "./pages/Fazendas";
import Talhoes from "./pages/Talhoes";
import Maquinarios from "./pages/Maquinarios";
import Trabalhadores from "./pages/Trabalhadores";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/fazendas" element={
                <ProtectedRoute>
                  <Fazendas />
                </ProtectedRoute>
              } />
              <Route path="/talhoes" element={
                <ProtectedRoute>
                  <Talhoes />
                </ProtectedRoute>
              } />
              <Route path="/maquinarios" element={
                <ProtectedRoute>
                  <Maquinarios />
                </ProtectedRoute>
              } />
              <Route path="/trabalhadores" element={
                <ProtectedRoute>
                  <Trabalhadores />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
