"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "eidgn-chat-messages";
const MAX_HISTORY = 20; // Limite l'historique envoyé à l'API

export function useChat({ welcomeMessage }) {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Initialiser sessionId depuis localStorage ou en générer un
  useEffect(() => {
    const stored = localStorage.getItem("eidgn-chat-session");
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionIdRef.current = id;
      localStorage.setItem("eidgn-chat-session", id);
    }

    // Restaurer les messages
    const storedMsgs = localStorage.getItem(STORAGE_KEY);
    if (storedMsgs) {
      try {
        const parsed = JSON.parse(storedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {}
    }
  }, []);

  // Persister les messages
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Envoi de message avec streaming SSE
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      const userMessage = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");

      // Préparer le message assistant vide pour le streaming
      const assistantMessage = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        streaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            // Limiter l'historique envoyé
            messages: nextMessages
              .slice(-MAX_HISTORY)
              .map((m) => ({ role: m.role, content: m.content })),
            sessionId: sessionIdRef.current,
          }),
        });

        if (!res.ok) throw new Error("Échec de la requête");

        // Streaming SSE
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.error && data.error !== "aborted") {
                setError(data.error);
              }
              if (data.content) {
                // Append au dernier message assistant
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + data.content,
                    };
                  }
                  return updated;
                });
              }
            } catch {}
          }
        }

        // Marquer le message comme terminé
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              streaming: false,
              timestamp: Date.now(),
            };
          }
          return updated;
        });
      } catch (err) {
        if (err.name === "AbortError") {
          // Annulation volontaire, on garde le contenu partiel
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                streaming: false,
                aborted: true,
              };
            }
            return updated;
          });
        } else {
          setError(err.message || "Une erreur est survenue");
          // Retirer le message assistant vide
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retryLast = useCallback(() => {
    // Trouver le dernier message user
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    // Retirer le dernier message assistant (échec)
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    setError(null);
    sendMessage(lastUser.content);
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([welcomeMessage]);
    localStorage.removeItem(STORAGE_KEY);
    // Régénérer sessionId
    const newId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionIdRef.current = newId;
    localStorage.setItem("eidgn-chat-session", newId);
  }, [welcomeMessage]);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    error,
    sendMessage,
    abortStream,
    retryLast,
    clearChat,
  };
}
