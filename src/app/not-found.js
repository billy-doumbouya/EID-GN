// src/app/not-found.js
import Link from "next/link";
import { Bike, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Conteneur Soft UI central */}
      <div className="w-full max-w-md rounded-3xl bg-[#e6eef8] p-8 shadow-[12px_12px_24px_#c3cad3,-12px_-12px_24px_#ffffff]">
        {/* Badge / Icône 404 */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e6eef8] text-mechanic-500 shadow-[inset_4px_4px_8px_#c3cad3,inset_-4px_-4px_8px_#ffffff]">
          <Bike size={40} className="animate-bounce" />
        </div>

        {/* Code d'erreur */}
        <span className="text-sm font-bold uppercase tracking-wider text-mechanic-500">
          Erreur 404
        </span>

        {/* Titre */}
        <h1 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">
          Page introuvable
        </h1>

        {/* Message d'explication */}
        <p className="mt-3 text-xs font-medium text-slate-600 sm:text-sm">
          Oups ! La page ou la pièce que vous recherchez n'existe pas ou a été
          déplacée.
        </p>

        {/* Boutons de redirection Soft UI */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e6eef8] px-5 py-3 text-xs font-bold text-slate-800 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] transition-all hover:text-mechanic-500 active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
          >
            <Home size={16} />
            Accueil
          </Link>

          <Link
            href="/motos"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e6eef8] px-5 py-3 text-xs font-bold text-mechanic-500 shadow-[4px_4px_8px_#c3cad3,-4px_-4px_8px_#ffffff] transition-all hover:bg-mechanic-500 hover:text-white active:shadow-[inset_2px_2px_4px_#c3cad3,inset_-2px_-2px_4px_#ffffff]"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
