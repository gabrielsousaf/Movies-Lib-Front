"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Heart, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationItem {
  id: string;
  type: "NEW_FOLLOWER" | "REVIEW_LIKE" | "REVIEW_COMMENT";
  title: string | null;
  content: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export function NotificationsDropdown() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!token || !user) return;
    fetchNotifications();

    // Polling a cada 45 segundos para checar novas notificações
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [token, user]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    }
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.read) {
      markAsRead(n.id);
    }
    setIsOpen(false);

    if (n.type === "NEW_FOLLOWER") {
      router.push(`/user/${n.actor.username}`);
    } else {
      router.push("/feed");
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Agora";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const getActorAvatar = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("/")) return `${apiUrl}${url}`;
    return url;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Sino com Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/80 transition-colors focus:outline-none"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-600 rounded-full animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Notificações</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary-500/20 text-primary-400 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-zinc-400 hover:text-primary-400 flex items-center gap-1 transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-800/50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-sm">
                <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              notifications.map((n) => {
                const avatar = getActorAvatar(n.actor.avatarUrl);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 p-4 hover:bg-zinc-800/60 cursor-pointer transition-colors relative ${
                      !n.read ? "bg-zinc-800/25" : ""
                    }`}
                  >
                    {/* Indicador de não lida */}
                    {!n.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}

                    {/* Avatar do Autor */}
                    <div className="relative w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt={n.actor.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-zinc-400 uppercase">
                          {n.actor.username.charAt(0)}
                        </span>
                      )}

                      {/* Ícone do Tipo */}
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                        {n.type === "NEW_FOLLOWER" && <UserPlus className="w-3 h-3 text-blue-400" />}
                        {n.type === "REVIEW_LIKE" && <Heart className="w-3 h-3 text-primary-500 fill-primary-500" />}
                        {n.type === "REVIEW_COMMENT" && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                      </span>
                    </div>

                    {/* Conteúdo da Notificação */}
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="text-zinc-300 leading-snug">
                        <strong className="text-white font-semibold">
                          {n.actor.displayName || n.actor.username}
                        </strong>{" "}
                        {n.type === "NEW_FOLLOWER" && "começou a seguir você."}
                        {n.type === "REVIEW_LIKE" && (
                          <>
                            curtiu sua resenha de{" "}
                            <span className="text-zinc-200 font-medium">"{n.title || "título"}"</span>.
                          </>
                        )}
                        {n.type === "REVIEW_COMMENT" && (
                          <>
                            comentou na sua avaliação:{" "}
                            <span className="text-zinc-400 italic">"{n.content?.slice(0, 50)}..."</span>
                          </>
                        )}
                      </p>
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
