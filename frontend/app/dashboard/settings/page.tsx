"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";

// Schema de validação para atualização de perfil
const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Schema de validação para alteração de senha
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Formulário de perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  // Formulário de senha
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Função para atualizar o perfil
  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);

    try {
      await userApi.updateProfile(data);
      
      // Atualiza a sessão com os novos dados
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
        },
      });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.response?.data?.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Função para alterar a senha
  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);

    try {
      await userApi.changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      resetPassword();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.response?.data?.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <div className="space-y-6">
        {/* Seção de Perfil */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Perfil</h2>
          <p className="mb-4 text-muted-foreground">
            Atualize suas informações pessoais.
          </p>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nome
              </label>
              <input
                id="name"
                type="text"
                {...registerProfile("name")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {profileErrors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...registerProfile("email")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </div>

        {/* Seção de Senha */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Alterar Senha</h2>
          <p className="mb-4 text-muted-foreground">
            Atualize sua senha para manter sua conta segura.
          </p>

          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium">
                Senha Atual
              </label>
              <input
                id="currentPassword"
                type="password"
                {...registerPassword("currentPassword")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium">
                Nova Senha
              </label>
              <input
                id="newPassword"
                type="password"
                {...registerPassword("newPassword")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.newPassword.message}
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
                {...registerPassword("confirmPassword")}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        </div>

        {/* Seção de Preferências */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Preferências</h2>
          <p className="mb-4 text-muted-foreground">
            Personalize sua experiência no dashboard.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Notificações</h3>
                <p className="text-sm text-muted-foreground">
                  Receba notificações de novas mensagens.
                </p>
              </div>
              <div className="flex h-6 items-center">
                <input
                  id="notifications"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sons</h3>
                <p className="text-sm text-muted-foreground">
                  Reproduzir sons ao receber novas mensagens.
                </p>
              </div>
              <div className="flex h-6 items-center">
                <input
                  id="sounds"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}