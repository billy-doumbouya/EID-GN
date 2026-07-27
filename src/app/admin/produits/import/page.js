// src/app/(admin)/admin/produits/import/page.js
"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileWarning,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  FileText,
  ClipboardPaste,
} from "lucide-react";

const EXPECTED_COLUMNS = [
  "sku",
  "name",
  "description",
  "type",
  "priceDetail",
  "priceGros",
  "minQtyGros",
  "stock",
  "categoryId",
];

function downloadTemplate() {
  const csv = EXPECTED_COLUMNS.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele-import-produits.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function checkMissingColumns(rows) {
  if (rows.length === 0) return [];
  const found = Object.keys(rows[0]);
  const required = ["sku", "name", "type", "priceDetail", "priceGros"];
  return required.filter((col) => !found.includes(col));
}

export default function ImportProductsPage() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(null);
  const [missingColumns, setMissingColumns] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function applyParsedRows(parsed, label) {
    setRows(parsed.data);
    setMissingColumns(checkMissingColumns(parsed.data));
    if (label) {
      toast.success(
        `${parsed.data.length} ligne(s) chargee(s) depuis ${label}`,
      );
    }
  }

  function processFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Veuillez sélectionner un fichier au format .csv");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1)); // Taille en KB
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (parsed) => applyParsedRows(parsed),
      error: () => toast.error("Impossible de lire le fichier CSV"),
    });
  }

  // Traite du texte tabule colle directement (copie depuis Excel/Google
  // Sheets, ou contenu d'un .csv copie comme texte plutot que comme
  // fichier). Papa.parse detecte automatiquement le separateur (virgule
  // ou tabulation) grace a delimitersToGuess.
  function processPastedText(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setFileName("Donnees collees");
    setFileSize(null);
    setResults(null);

    Papa.parse(trimmed, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      delimitersToGuess: [",", "\t", ";"],
      complete: (parsed) => applyParsedRows(parsed, "presse-papiers"),
      error: () => toast.error("Impossible d'interpreter les donnees collees"),
    });
  }

  function handleFileChange(e) {
    processFile(e.target.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }

  function handleReset() {
    setRows([]);
    setFileName("");
    setFileSize(null);
    setMissingColumns([]);
    setResults(null);
  }

  // Ecoute le collage (Ctrl+V) sur toute la page : un fichier reel copie
  // depuis l'explorateur passe par clipboardData.files, du texte tabule
  // copie depuis un tableur passe par clipboardData.getData("text").
  useEffect(() => {
    function handlePaste(e) {
      const file = e.clipboardData?.files?.[0];
      if (file) {
        e.preventDefault();
        processFile(file);
        return;
      }

      const text = e.clipboardData?.getData("text");
      if (text && text.trim()) {
        e.preventDefault();
        processPastedText(text);
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImport() {
    if (rows.length === 0) {
      toast.error("Chargez d'abord un fichier CSV");
      return;
    }
    if (missingColumns.length > 0) {
      toast.error(`Colonnes manquantes : ${missingColumns.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResults(data);

      if (data.created || data.updated) {
        toast.success(`${data.created} créés, ${data.updated} mis à jour`);
      }
      if (data.errors?.length > 0) {
        toast.warning(
          `${data.errors.length} ligne(s) ignorée(s), consultez le rapport ci-dessous`,
        );
      }
    } catch {
      toast.error("Import échoué, réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* EN-TÊTE */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Importation du Catalogue
          </h1>
          <p className="text-xs text-slate-500">
            Mettez à jour ou ajoutez des produits en masse via un fichier CSV
          </p>
        </div>

        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-mechanic-500"
        >
          <Download size={15} />
          Télécharger le Modèle CSV
        </button>
      </div>

      {/* ZONE DE SÉLECTION / DROPZONE */}
      {!fileName ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            isDragging
              ? "border-mechanic-500 bg-mechanic-500/5"
              : "border-slate-200 bg-white hover:border-mechanic-500 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-mechanic-50 group-hover:text-mechanic-500">
            <Upload size={26} />
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              Déposez votre fichier CSV ici, ou{" "}
              <span className="text-mechanic-500 underline">parcourez</span>
            </p>
            <p className="text-xs text-slate-400">
              Fichiers CSV uniquement, jusqu'à 10 Mo
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-5 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            <ClipboardPaste size={13} />
            Vous pouvez aussi coller (Ctrl+V) un fichier ou des cellules copiées
            depuis un tableur
          </div>
        </label>
      ) : (
        /* SÉLECTEUR DE FICHIER ACTIF */
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{fileName}</p>
              <p className="text-xs text-slate-400">
                {fileSize ? `${fileSize} KB • CSV` : "Colle directe"}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Changer de fichier"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ERREURS DE COLONNES MANQUANTES */}
      {missingColumns.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 shadow-sm">
          <FileWarning size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-900">
              Structure du fichier incorrecte
            </p>
            <p>
              Des colonnes obligatoires manquent dans votre fichier :{" "}
              <span className="font-mono font-bold">
                {missingColumns.join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* PRÉVISUALISATION DU CSV */}
      {rows.length > 0 && missingColumns.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-mechanic-500" />
              <h2 className="text-sm font-bold text-slate-800">
                Aperçu des données ({rows.length} lignes)
              </h2>
            </div>
            <span className="text-xs text-slate-400">5 premières lignes</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-600">
                  <tr>
                    {Object.keys(rows[0]).map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-4 py-3 uppercase tracking-wider text-[10px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.slice(0, 5).map((row, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      {Object.keys(rows[0]).map((col) => (
                        <td
                          key={col}
                          className="whitespace-nowrap px-4 py-2.5 font-medium"
                        >
                          {row[col] ? (
                            row[col]
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOUTON D'ACTION */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-mechanic-500 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-mechanic-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {loading
                ? "Traitement en cours..."
                : `Lancer l'import (${rows.length} produits)`}
            </button>
          </div>
        </div>
      )}

      {/* RÉSULTATS / COMPTE-RENDU D'IMPORT */}
      {results && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Rapport d'importation
            </h2>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-mechanic-500 hover:underline"
            >
              Importer un autre fichier
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium text-emerald-600">
                Nouveaux créés
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {results.created}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-xs font-medium text-blue-600">Mis à jour</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {results.updated}
              </p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
              <p className="text-xs font-medium text-rose-600">
                Échecs / Ignorés
              </p>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                {results.errors?.length || 0}
              </p>
            </div>
          </div>

          {/* LISTE DÉTAILLÉE DES ERREURS */}
          {results.errors?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <AlertCircle size={16} />
                <span>Détail des lignes ignorées :</span>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50/50 divide-y divide-slate-100">
                {results.errors.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 text-xs"
                  >
                    <span className="font-mono font-medium text-slate-600">
                      Ligne {e.line} {e.sku ? `(${e.sku})` : ""}
                    </span>
                    <span className="text-rose-600 font-medium">
                      {e.message || "Données invalides"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
