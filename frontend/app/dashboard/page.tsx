"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { whatsappApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { subscribeToWhatsAppStatus, WhatsAppStatus } from "@/lib/socket";

export default function DashboardPage() {
  const { toast } = useToast();
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);

  // Busca o status do WhatsApp
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: async () => {
      try {
        const response = await whatsappApi.getStatus();
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar status do WhatsApp:", error);
        return null;
      }
    },
  });

  // Atualiza o status local quando os dados são carregados
  useEffect(() => {
    if (statusData) {
      setWhatsappStatus(statusData);
    }
  }, [statusData]);

  // Inscreve-se para atualizações de status em tempo real
  useEffect(() => {
    const unsubscribe = subscribeToWhatsAppStatus((status) => {
      setWhatsappStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Função para desconectar o WhatsApp
  const handleDisconnect = async () => {
    try {
      await whatsappApi.disconnect();
      toast({
        title: "WhatsApp desconectado",
        description: "Sua sessão do WhatsApp foi encerrada com sucesso.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          {whatsappStatus?.connected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              Desconectar WhatsApp
            </Button>
          ) : (
            <Button variant="default" onClick={() => window.location.href = "/dashboard/qrcode"}>
              Conectar WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card de Status */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Status do WhatsApp</h2>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  whatsappStatus?.connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span>
                {whatsappStatus?.connected
                  ? "Conectado"
                  : "Desconectado"}
              </span>
            </div>
          )}
        </div>

        {/* Card de Estatísticas */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Estatísticas</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de conversas:</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mensagens hoje:</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Novos contatos:</span>
              <span className="font-medium">--</span>
            </div>
          </div>
        </div>

        {/* Card de Ações Rápidas */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Ações Rápidas</h2>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = "/dashboard/chats"}
              disabled={!whatsappStatus?.connected}
            >
              Ver conversas
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = "/dashboard/settings"}
            >
              Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Atividade Recente */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Atividade Recente</h2>
        <div className="rounded-md bg-muted p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma atividade recente para exibir.
          </p>
        </div>
      </div>
    </div>
  );
}