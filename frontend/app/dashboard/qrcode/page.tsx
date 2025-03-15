"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { whatsappApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { subscribeToWhatsAppStatus, subscribeToQrCode, WhatsAppStatus } from "@/lib/socket";

export default function QrCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca o status do WhatsApp e o QR code
  const { data: statusData, refetch: refetchStatus } = useQuery({
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
    onSuccess: (data) => {
      setWhatsappStatus(data);
      setIsLoading(false);
    },
  });

  const { data: qrCodeData, refetch: refetchQrCode } = useQuery({
    queryKey: ["whatsapp-qrcode"],
    queryFn: async () => {
      try {
        const response = await whatsappApi.getQrCode();
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar QR code:", error);
        return null;
      }
    },
    onSuccess: (data) => {
      if (data?.qrCode) {
        setQrCode(data.qrCode);
      }
    },
    enabled: !whatsappStatus?.connected,
  });

  // Inscreve-se para atualizações de status em tempo real
  useEffect(() => {
    const unsubscribeStatus = subscribeToWhatsAppStatus((status) => {
      setWhatsappStatus(status);
      
      // Se conectado, redireciona para o dashboard
      if (status.connected) {
        toast({
          title: "WhatsApp conectado",
          description: "Sua sessão do WhatsApp foi iniciada com sucesso.",
        });
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    });

    const unsubscribeQrCode = subscribeToQrCode((code) => {
      setQrCode(code);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeQrCode();
    };
  }, [router, toast]);

  // Atualiza o status local quando os dados são carregados
  useEffect(() => {
    if (statusData) {
      setWhatsappStatus(statusData);
    }
  }, [statusData]);

  // Atualiza o QR code quando os dados são carregados
  useEffect(() => {
    if (qrCodeData?.qrCode) {
      setQrCode(qrCodeData.qrCode);
    }
  }, [qrCodeData]);

  const handleRefresh = () => {
    setIsLoading(true);
    refetchStatus();
    refetchQrCode();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conectar WhatsApp</h1>
        <Button variant="outline" onClick={handleRefresh}>
          Atualizar
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4">Carregando...</p>
          </div>
        ) : whatsappStatus?.connected ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">WhatsApp Conectado</h2>
            <p className="mt-2 text-muted-foreground">
              Seu WhatsApp está conectado e pronto para uso.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/dashboard")}
            >
              Ir para o Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-4 text-xl font-semibold">Escaneie o QR Code</h2>
            <p className="mb-6 text-muted-foreground">
              Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione WhatsApp Web.
              Aponte seu celular para esta tela para capturar o código.
            </p>
            
            {qrCode ? (
              <div className="mb-6 overflow-hidden rounded-lg border p-4">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code para conexão do WhatsApp"
                  className="h-64 w-64"
                />
              </div>
            ) : (
              <div className="mb-6 flex h-64 w-64 items-center justify-center rounded-lg border">
                <p className="text-muted-foreground">QR Code não disponível</p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              O QR code expira após 60 segundos. Se expirar, clique em Atualizar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}