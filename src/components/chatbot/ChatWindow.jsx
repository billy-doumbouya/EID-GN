"use client";

import { motion } from "framer-motion";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow({
  messages,
  input,
  onInputChange,
  isStreaming,
  error,
  onSend,
  onAbort,
  onRetry,
  onClose,
  onClear,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      id="eidgn-chat-window"
      role="dialog"
      aria-modal="true"
      aria-label="Assistant virtuel EID-MULTISERVICE"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex h-[min(34rem,calc(100dvh-7rem-env(safe-area-inset-bottom)))] min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-950/95 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[32rem] sm:w-[24rem] sm:rounded-3xl"
    >
      {/* En-tête */}
      <ChatHeader onClear={onClear} onClose={onClose} />

      {/* Messages */}
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        onRetry={onRetry}
        onSelectSuggestion={onSend}
      />

      {/* Barre de saisie */}
      <ChatInput
        input={input}
        onInputChange={onInputChange}
        onSend={onSend}
        isStreaming={isStreaming}
        onAbort={onAbort}
      />
    </motion.div>
  );
}
