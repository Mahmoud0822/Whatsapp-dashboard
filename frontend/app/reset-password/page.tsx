"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

// Schema de validação
const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verifica se o token está presente
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast({
        title: "Token inválido",
        description: "O link de redefinição de senha é inválido ou expirou.",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setIsLoading(true);

    try {
      await authApi.resetPassword(token, data.password);
      
      setResetSuccess(true);
      
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi redefinida com sucesso.",
      });
      
      // Redireciona para a página de login após um breve delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.response?.data?.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      
      // Se o token for inválido ou expirado
      if (error.response?.status === 400) {
        setTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Redefinir Senha
          </h2>
        </div>

        {!tokenValid ? (
          <div className="rounded-md bg-destructive/10 p-4 text-center">
            <h3 className="text-lg font-medium text-destructive">Link inválido</h3>
            <p className="mt-2 text-sm">
              O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.
            </p>
            <div className="mt-4">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                Solicitar novo link
              </Link>
            </div>
          </div>
        ) : resetSuccess ? (
          <div className="rounded-md bg-primary/10 p-4 text-center">
            <h3 className="text-lg font-medium text-primary">Senha redefinida!</h3>
            <p className="mt-2 text-sm">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em instantes.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Ir para o login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Nova Senha
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="******"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="******"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}