import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from '@/components/ui/sonner';
import { Glass } from '@/components/ui/Glass';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres.",
  }),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Glass className="p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Entrar
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seuemail@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Link to="/cadastro" className="text-sm text-gray-600 hover:text-gray-800">
            Não tem uma conta? Cadastre-se
          </Link>
        </div>
      </Glass>
    </div>
  );
};

export default Login;
