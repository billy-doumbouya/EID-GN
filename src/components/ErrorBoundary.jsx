"use client";

import { Component } from "react";

// Un Error Boundary DOIT etre un composant classe : les hooks ne permettent
// pas d'implementer componentDidCatch. C'est le seul endroit du projet ou
// on ecrit une classe malgre le choix "vanilla JS / hooks" partout ailleurs.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Remonte a Sentry si configure, sinon log console
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error, { extra: info });
    }
    console.error("Erreur interceptee par ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <h2 className="text-xl font-semibold text-navy-900">
              Un probleme est survenu
            </h2>
            <p className="mt-2 text-navy-700/70">
              Rechargez la page ou revenez a l'accueil. Si le probleme persiste,
              contactez-nous via WhatsApp.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-lg bg-mechanic-500 px-5 py-2 text-white hover:bg-mechanic-600"
            >
              Reessayer
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
