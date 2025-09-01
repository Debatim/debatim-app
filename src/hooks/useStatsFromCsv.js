import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

// remove acentos e deixa minúsculo pra comparar nomes de coluna
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function useStatsFromCsv(url) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data || []);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [url]);

  const stats = useMemo(() => {
    if (!rows.length) {
      return { contas: 0, posts: 0, interacoes: 0, visualizacoes: null };
    }

    // mapeia nomes de colunas de forma tolerante
    const headers = Object.keys(rows[0] || {});
    const colNome = headers.find((h) => norm(h) === "nome") || "Nome";
    const colInteracoes =
      headers.find((h) => norm(h).includes("interacao")) ||
      "Total de Interações";
    const colVisualizacoes =
      headers.find((h) => norm(h).includes("visualiz")) || null;

    // contas únicas (ignora vazios)
    const contas = new Set(
      rows.map((r) => (r[colNome] ?? "").toString().trim()).filter(Boolean)
    ).size;

    // posts = nº de linhas
    const posts = rows.length;

    // soma interações
    const interacoes = rows.reduce((acc, r) => {
      const v = Number(
        String(r[colInteracoes] ?? "")
          .replace(/\./g, "")
          .replace(",", ".")
      );
      return acc + (isFinite(v) ? v : 0);
    }, 0);

    // soma visualizações (se existir alguma coluna assim)
    const visualizacoes = colVisualizacoes
      ? rows.reduce((acc, r) => {
          const v = Number(
            String(r[colVisualizacoes] ?? "")
              .replace(/\./g, "")
              .replace(",", ".")
          );
          return acc + (isFinite(v) ? v : 0);
        }, 0)
      : null;

    return { contas, posts, interacoes, visualizacoes };
  }, [rows]);

  return { stats, loading, error };
}
