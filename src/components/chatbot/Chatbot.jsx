"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { ChatTrigger } from "./ChatTrigger";
import { ChatWindow } from "./ChatWindow";
import { ChatWelcome } from "./ChatWelcome";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Bonjour 👋 Je suis l'assistant EID-MULTISERVICE. Je peux vous renseigner sur **nos produits**, **les stocks** et **le suivi de commande**. Comment puis-je vous aider ?",
  timestamp: Date.now(),
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    sendMessage,
    abortStream,
    retryLast,
    clearChat,
  } = useChat({ welcomeMessage: WELCOME_MESSAGE });

  // Persistence de l'état ouvert dans sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("eidgn-chat-open");
    if (saved === "true") setOpen(true);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("eidgn-chat-open", String(open));
    if (open) setHasOpened(true);
  }, [open]);

  // Raccourci clavier : Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSend = useCallback(
    (text) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <>
      <ChatTrigger
        open={open}
        hasOpened={hasOpened}
        onToggle={() => setOpen((o) => !o)}
      />

      <AnimatePresence>
        {open && (
          <ChatWindow
            messages={messages}
            input={input}
            onInputChange={setInput}
            isStreaming={isStreaming}
            error={error}
            onSend={handleSend}
            onAbort={abortStream}
            onRetry={retryLast}
            onClose={handleClose}
            onClear={clearChat}
          />
        )}
      </AnimatePresence>
    </>
  );
}
