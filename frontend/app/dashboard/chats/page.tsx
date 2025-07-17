"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { whatsappApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, truncateText, formatDateTime } from "@/lib/utils";
import { subscribeToNewMessages, WhatsAppMessage } from "@/lib/socket";

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

const {
  data: chatsData,
  isLoading: isLoadingChats,
  refetch: refetchChats,
} = useQuery({
  queryKey: ["whatsapp-chats"],
  queryFn: async () => {
    const response = await whatsappApi.getChats();
    return response.data;
  },
});


  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["whatsapp-messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      try {
        const response = await whatsappApi.getMessages(selectedChat);
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        return [];
      }
    },
    enabled: !!selectedChat,
  });

  useEffect(() => {
    if (chatsData) {
      setChats(chatsData);
      setIsLoading(false);
    }
  }, [chatsData]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    const unsubscribe = subscribeToNewMessages((message) => {
      if (selectedChat === message.from || selectedChat === message.to) {
        setMessages((prev) => [...prev, message]);
      }
      refetchChats();
    });

    return () => unsubscribe();
  }, [selectedChat, refetchChats]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      await whatsappApi.sendMessage(selectedChat, newMessage);
      setNewMessage("");
      refetchMessages();
    } catch {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 md:h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversas</h1>
        <Button variant="outline" onClick={() => refetchChats()}>
          Atualizar
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="w-full border-r md:w-1/3">
          <div className="flex h-14 items-center border-b px-4">
            <input
              type="text"
              placeholder="Buscar conversa..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
            {isLoadingChats ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              <div>
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`cursor-pointer border-b p-4 hover:bg-accent ${selectedChat === chat.id ? "bg-accent" : ""}`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {chat.name || formatPhoneNumber(chat.phone)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(new Date(chat.timestamp))}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {truncateText(chat.lastMessage, 30)}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-2/3 flex-col md:flex">
          {!selectedChat ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Selecione uma conversa para ver as mensagens.</p>
            </div>
          ) : (
            <>
              <div className="flex h-14 items-center border-b px-4">
                <h2 className="font-medium">
                  {chats.find((chat) => chat.id === selectedChat)?.name ||
                    formatPhoneNumber(chats.find((chat) => chat.id === selectedChat)?.phone || "")}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma mensagem encontrada.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from === selectedChat ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.from === selectedChat
                              ? "bg-accent"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p>{message.body}</p>
                          <p className="mt-1 text-right text-xs opacity-70">
                            {formatDateTime(new Date(message.timestamp))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center border-t p-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button className="ml-2" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Enviar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
