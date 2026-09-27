"use client";

import { useState } from "react";
import { FileText, Wrench, Truck, AlertTriangle, Tag } from "lucide-react";

const TABS = [
  { id: "description", label: "Description", icon: FileText },
  { id: "compatibility", label: "Compatibilité", icon: Wrench },
  { id: "shipping", label: "Livraison & Retours", icon: Truck },
];

export function ProductTabs({ product, finalPrice }) {
  const [active, setActive] = useState("description");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-white/5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors flex-1 justify-center ${
                isActive
                  ? "text-mechanic-400 border-b-2 border-mechanic-500 bg-white/[0.02]"
                  : "text-offwhite-100/50 hover:text-white"
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {active === "description" && (
          <div className="space-y-4">
            <p className="text-sm text-offwhite-100/70 leading-relaxed whitespace-pre-line">
              {product.description || "Aucune description détaillée disponible pour cet article."}
            </p>

            {/* Spécifications techniques */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <SpecItem icon={Tag} label="Référence" value={product.sku} />
              <SpecItem
                icon={FileText}
                label="Catégorie"
                value={product.category?.name || "—"}
              />
              <SpecItem
                icon={AlertTriangle}
                label="Alerte stock"
                value={`À partir de ${product.lowStockAlert || 5} unités`}
              />
              <SpecItem
                icon={FileText}
                label="Prix unitaire"
                value={`${Math.round(finalPrice).toLocaleString("fr-FR")} GNF`}
              />
            </div>
          </div>
        )}

        {active === "compatibility" && (
          <div>
            {product.compatibility?.length > 0 ? (
              <>
                <p className="text-sm text-offwhite-100/60 mb-3">
                  Cette pièce est compatible avec les engins suivants :
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((c) => (
                    <span
                      key={c.id || `${c.vehicleModel?.brand}-${c.vehicleModel?.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-mechanic-500/20 bg-mechanic-500/5 px-3 py-1.5 text-sm text-offwhite-100/80"
                    >
                      <span className="font-semibold text-white">
                        {c.vehicleModel?.brand}
                      </span>
                      {c.vehicleModel?.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-offwhite-100/50">
                Aucune compatibilité spécifique renseignée pour ce produit. Contactez-nous
                pour vérifier la compatibilité avec votre engin.
              </p>
            )}
          </div>
        )}

        {active === "shipping" && (
          <div className="space-y-4 text-sm text-offwhite-100/70">
            <div>
              <p className="font-semibold text-white mb-1">Livraison Kankan</p>
              <p className="text-offwhite-100/60">
                Livraison express 24h dans Kankan ville. Retrait gratuit au magasin EID-GN Kankan.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Autres régions</p>
              <p className="text-offwhite-100/60">
                Livraison 24-48h vers Conakry, Siguiri, Kouroussa, Mandiana,
                Kérouané, N'Zérékoré. Frais calculés à la commande.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Retours & Garantie</p>
              <p className="text-offwhite-100/60">
                Échange ou remboursement sous 7 jours pour les articles non
                utilisés, dans leur emballage d'origine.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-mechanic-400/60 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-offwhite-100/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xs text-white truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
