// src/app/(admin)/admin/produits/import/page.js
"use client";

import { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Upload, Download, FileWarning } from "lucide-react";

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
  const [missingColumns, setMissingColumns] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (parsed) => {
        setRows(parsed.data);
        setMissingColumns(checkMissingColumns(parsed.data));
      },
      error: () => toast.error("Impossible de lire le fichier CSV"),
    });
  }

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
        toast.success(`${data.created} crees, ${data.updated} mis a jour`);
      }
      if (data.errors?.length > 0) {
        toast.warning(
          `${data.errors.length} ligne(s) ignoree(s), voir le detail ci-dessous`,
        );
      }
    } catch {
      toast.error("Import echoue, reessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Importer un catalogue
        </h1>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-sm font-medium text-mechanic-500 hover:underline"
        >
          <Download size={14} /> Modele CSV
        </button>
      </div>
      <p className="mb-6 text-sm text-navy-800/60">
        Colonnes attendues : sku, name, description, type (MOTO/TRICYCLE/PIECE),
        priceDetail, priceGros, minQtyGros (optionnel, defaut 5), stock,
        categoryId (optionnel).
      </p>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-navy-800/20 bg-white py-10 text-center hover:border-mechanic-500">
        <Upload size={28} className="text-navy-800/40" />
        <span className="text-sm text-navy-800/70">
          {fileName || "Cliquez pour choisir un fichier CSV"}
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
      </label>

      {missingColumns.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <FileWarning size={16} className="mt-0.5 shrink-0" />
          <span>
            Colonnes obligatoires manquantes dans ce fichier :{" "}
            <strong>{missingColumns.join(", ")}</strong>. Verifiez les en-tetes
            de votre CSV.
          </span>
        </div>
      )}

      {rows.length > 0 && missingColumns.length === 0 && (
        <>
          <p className="mt-3 text-sm text-navy-800/70">
            {rows.length} ligne(s) detectee(s). Apercu des 5 premieres :
          </p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-navy-800/10 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-offwhite-200 text-left text-navy-800/70">
                <tr>
                  {Object.keys(rows[0]).map((col) => (
                    <th key={col} className="whitespace-nowrap px-3 py-2">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-navy-800/5">
                    {Object.keys(rows[0]).map((col) => (
                      <td
                        key={col}
                        className="whitespace-nowrap px-3 py-2 text-navy-800/80"
                      >
                        {row[col] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button
        onClick={handleImport}
        disabled={loading || rows.length === 0 || missingColumns.length > 0}
        className="mt-4 rounded-lg bg-mechanic-500 px-6 py-2.5 font-medium text-white hover:bg-mechanic-600 disabled:opacity-50"
      >
        {loading
          ? "Import en cours..."
          : `Importer ${rows.length || ""} produit(s)`}
      </button>

      {results && (
        <div className="mt-6 rounded-xl border border-navy-800/10 bg-white p-4 text-sm">
          <p>
            Crees : <strong>{results.created}</strong>
          </p>
          <p>
            Mis a jour : <strong>{results.updated}</strong>
          </p>
          {results.errors?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-danger">
                {results.errors.length} erreur(s) :
              </p>
              <ul className="mt-1 max-h-48 list-inside list-disc overflow-y-auto text-navy-800/70">
                {results.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    Ligne {e.line}
                    {e.sku ? ` (${e.sku})` : ""} :{" "}
                    {e.message || "donnees invalides"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
