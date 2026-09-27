"use client";

import { useEffect, useRef } from "react";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatWelcome } from "./ChatWelcome";
import { ChatSuggestions } from "./ChatSuggestions";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function ChatMessageList({
  messages,
  isStreaming,
  error,
  onRetry,
  onSelectSuggestion,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll vers le bas lors de nouveaux messages ou de chunks en streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, error]);

  const showWelcome = messages.length <= 1;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Historique des messages"
      className="chat-scroll flex-1 space-y-3.5 overflow-y-auto overscroll-contain p-4 outline-none"
    >
      {/* Présentation initiale si début de conversation */}
      {showWelcome && (
        <div className="space-y-3 pb-1">
          <ChatWelcome />
        </div>
      )}

      {/* Liste des messages */}
      {messages.map((message, index) => (
        <ChatMessageItem key={index} message={message} />
      ))}

      {/* Suggestions rapides (affichées après le message de bienvenue ou si inactif) */}
      {showWelcome && (
        <div className="pt-2">
          <ChatSuggestions
            disabled={isStreaming}
            onSelect={onSelectSuggestion}
          />
        </div>
      )}

      {/* Bannière d'erreur avec bouton Réessayer */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/40 p-3 text-xs text-red-200 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-medium">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-900/40 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-800/60"
                >
                  <RefreshCw className="h-3 w-3" />
                  Réessayer le dernier message
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
