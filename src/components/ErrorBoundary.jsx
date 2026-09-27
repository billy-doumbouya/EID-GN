"use client";

import { Component } from "react";
import { ErrorPage } from "./ErrorPage";
import { ErrorSection } from "./ErrorSection";
import { ErrorComponent } from "./ErrorComponent";

// ============================================================
// ERROR BOUNDARY — Composant classe obligatoire
// Gère 3 niveaux : page / section / composant
// ============================================================
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      info: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  componentDidCatch(error, info) {
    this.setState({ info });

    // Logging Sentry (import direct, pas window.Sentry)
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureException(error, {
            tags: { scope: this.props.scope || "unknown" },
            extra: {
              componentStack: info?.componentStack,
              props: this.sanitizeProps(this.props),
            },
          });
        })
        .catch(() => {
          // Sentry non disponible, log console
          console.error("[ErrorBoundary]", error, info);
        });
    } else {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  // Reset automatique quand la route change (key ou pathname)
  componentDidUpdate(prevProps) {
    if (
      this.state.hasError &&
      (prevProps.resetKey !== this.props.resetKey ||
        prevProps.children !== this.props.children)
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      info: null,
      errorId: null,
    });

    // Remonter en haut de page si erreur de page
    if (this.props.scope === "page") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Sanitize props pour Sentry (éviter de log des données sensibles)
  sanitizeProps(props) {
    const safe = {};
    const allowed = ["scope", "fallback", "resetKey"];
    for (const key of allowed) {
      if (key in props) safe[key] = props[key];
    }
    return safe;
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, info, errorId } = this.state;
    const { scope = "section", fallback } = this.props;

    // Fallback personnalisé fourni par le parent
    if (fallback) {
      return typeof fallback === "function"
        ? fallback({ error, info, errorId, reset: this.reset })
        : fallback;
    }

    // Fallback par défaut selon le scope
    switch (scope) {
      case "page":
        return (
          <ErrorPage
            error={error}
            info={info}
            errorId={errorId}
            onReset={this.reset}
          />
        );
      case "component":
        return (
          <ErrorComponent
            error={error}
            errorId={errorId}
            onReset={this.reset}
          />
        );
      case "section":
      default:
        return (
          <ErrorSection
            error={error}
            info={info}
            errorId={errorId}
            onReset={this.reset}
          />
        );
    }
  }
}