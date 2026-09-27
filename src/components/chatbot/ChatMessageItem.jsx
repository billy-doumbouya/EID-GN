"use client";

import { motion } from "framer-motion";
import { Bike, User, AlertCircle } from "lucide-react";

/**
 * Formateur léger pour le markdown (gras, listes, liens, sauts de ligne)
 */
function FormattedText({ text }) {
  if (!text) return null;

  // Découpage en blocs de paragraphes
  const blocks = text.split(/\n\s*\n/);

  return (
    <div className="chat-content space-y-2">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^\s*[-*•]\s+/.test(line));

        if (isList) {
          return (
            <ul key={blockIndex} className="list-disc list-inside space-y-1">
              {lines.map((line, lineIndex) => {
                const itemContent = line.replace(/^\s*[-*•]\s+/, "");
                return (
                  <li key={lineIndex}>
                    <InlineText text={itemContent} />
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                <InlineText text={line} />
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function InlineText({ text }) {
  if (!text) return null;

  // Regex pour détecter **bold**, *italic*, [link](href), `code`
  const parts = [];
  let remaining = text;
  let key = 0;

  // Pattern combiné
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key++} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const label = token.slice(1, token.indexOf("]("));
      const href = token.slice(token.indexOf("](") + 2, -1);
      parts.push(
        <a
          key={key++}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-mechanic-400 hover:text-mechanic-300 underline underline-offset-2 font-medium"
        >
          {label}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export function ChatMessageItem({ message }) {
  const isUser = message.role === "user";
  const isStreaming = message.streaming;
  const isAborted = message.aborted;

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs ${
          isUser
            ? "border-mechanic-400/30 bg-mechanic-600/30 text-white"
            : "border-white/10 bg-navy-900 text-mechanic-400 shadow-sm"
        }`}
      >
        {isUser ? <User size={14} /> : <Bike size={14} />}
      </div>

      {/* Bulle de message */}
      <div
        className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm transition-all ${
          isUser
            ? "rounded-br-xs bg-mechanic-500 text-white"
            : "rounded-bl-xs border border-white/10 bg-navy-900/90 text-slate-200"
        }`}
      >
        {message.content ? (
          <FormattedText text={message.content} />
        ) : isStreaming ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mechanic-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mechanic-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mechanic-400" />
          </div>
        ) : null}

        {/* Curseur de streaming */}
        {isStreaming && message.content && (
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-1.5 ml-1 translate-y-0.5 animate-pulse rounded-xs bg-mechanic-400"
          />
        )}

        {/* Message interrompu */}
        {isAborted && (
          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400/80">
            <AlertCircle size={10} />
            <span>Réponse interrompue</span>
          </div>
        )}

        {/* Horodatage */}
        {formattedTime && (
          <div
            className={`mt-1 text-[10px] font-mono ${
              isUser ? "text-white/60 text-right" : "text-slate-400 text-left"
            }`}
          >
            {formattedTime}
          </div>
        )}
      </div>
    </motion.div>
  );
}
