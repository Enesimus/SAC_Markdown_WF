#!/usr/bin/env node

/**
 * SAC Markdown Compiler v1
 *
 * Uso:
 *   node scripts/sac_compiler.js archivo.sac.md
 *
 * Salida:
 *   - imprime resumen en consola
 *   - crea archivos .html por sección
 */

const fs = require("fs");
const path = require("path");

const MAX_CHARS = 3950;

const SILENT_ROOT_SECTIONS = new Set([
  "evolucion",
  "indicaciones",
]);

const MACROS = {
  regind: "<b>REGISTRO INDICACIONES</b>",
  indprev: "<b>INDICACIONES EN ENCUENTRO PREVIO</b>",
};

// const SYSTEM_LABELS = [
//   "FEN",
//   "Respiratorio",
//   "Hemodinamico",
//   "Hemodinámico",
//   "Infeccioso",
//   "Renal",
//   "Neurologico",
//   "Neurológico",
//   "Hematologico",
//   "Hematológico",
//   "Endocrinologico",
//   "Endocrinológico",
//   "Gastroenterológico",
//   "Gastroenterologico",
//   "Inmunológico",
//   "Inmunologico",
//   "Quirurgico",
//   "Quirúrgico",
//   "Social",
// ];

const SYSTEM_MAP = {
  fen: "FEN",
  respiratorio: "Respiratorio",
  hemodinamico: "Hemodinamia",
  infeccioso: "Infeccioso",
  renal: "Renal",
  neurologico: "Neurológico",
  hematologico: "Hematológico",
  endocrinologico: "Endocrinológico",
  gastroenterologico: "Gastroenterológico",
  inmunologico: "Inmunológico",
  quirurgico: "Quirúrgico",
  social: "Social",
};

const SYSTEM_CODES = {
  FEN: "FEN",
  RESP: "Respiratorio",
  HEMO: "Hemodinamia",
  INF: "Infeccioso",
  REN: "Renal",
  HEMA: "Hematológico",
  NEURO: "Neurológico",
  QX: "Quirúrgico",
  ENDO: "Endocrinológico",
  GASTRO: "Gastroenterológico",
  INMUNO: "Inmunológico",
  SOCIAL: "Social",
};

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r/g, "");
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeWord(word) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeHeadingTitle(raw) {
  return raw.trim();
}

function sanitizeSacText(text) {
  if (!text) return "";

  return text
    // por si viene texto previamente escapado
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, " menor que ")
    .replace(/&amp;/gi, " y ")

    // caracteres problemáticos para SAC
    .replace(/&/g, " y ")
    .replace(/;/g, ",")
    .replace(/\$/g, " pesos ")
    .replace(/"/g, "")
    .replace(/'/g, "")

    // evitar inyección accidental de tags
    .replace(/</g, " menor que ")

    // compactar espacios
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escapeHtml(text) {
  return sanitizeSacText(text);
}

function isStructuredSystemLine(line) {
  const trimmed = line.trim();

  if (/^\*\*-\s*[^:]+:\*\*/i.test(trimmed)) return true;
  if(/^-\s*[^:]+:/i.test(trimmed)) return true;
  if(/^@[^ ]+\s+/i.test(trimmed)) return true;

  return false;
}

/**
 * Inserta saltos de línea antes de sistemas clínicos que quedaron pegados
 * dentro de una línea larga.
 */

function normalizeClinicalInlineSystems(source) {
  const lines = source.split("\n");

  const normalized = lines.map((line) => {
    if (isStructuredSystemLine(line)) return line;

    let out = line;

    for (const key in SYSTEM_MAP) {
      const canonical = SYSTEM_MAP[key];

      const regexDash = new RegExp(`([^\\n*])\\s+-\\s+(${key}\\s*:)`, "gi");
      out = out.replace(regexDash, (match, prev) => `${prev}\n- ${canonical}:`);

      const regexPlain = new RegExp(`([^\\n*>@])\\s+(${key}\\s*:)`, "gi");
      out = out.replace(regexPlain, (match, prev) => `${prev}\n${canonical}:`);
    }

    return out;
  });

  return normalized.join("\n");
}

/**
 * Limpieza general previa.
 */
function preprocessSource(source) {
  let out = source.replace(/\t/g, "  ");

  // Normalización de macros con o sin espacio: !regind / ! regind
  out = out.replace(/^\s*!\s*regind\s*$/gim, "!regind");
  out = out.replace(/^\s*!\s*indprev\s*$/gim, "!indprev");

  out = normalizeClinicalInlineSystems(out);

  return out;
}

function splitIntoTopLevelSections(source) {
  const lines = source.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);

    if (h2) {
      if (current) sections.push(current);
      current = {
        level: 2,
        title: normalizeHeadingTitle(h2[1]),
        lines: [],
      };
      continue;
    }

    if (h3 && !current) {
      if (current) sections.push(current);
      current = {
        level: 3,
        title: normalizeHeadingTitle(h3[1]),
        lines: [],
      };
      continue;
    }

    if (!current) {
      current = {
        level: 2,
        title: "DOCUMENTO",
        lines: [],
      };
    }

    current.lines.push(line);
  }

  if (current) sections.push(current);
  return sections;
}

function splitSubsections(lines) {
  const blocks = [];
  let current = { type: "body", title: null, lines: [] };

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) {
      if (current.lines.length || current.title) blocks.push(current);
      current = {
        type: "h3block",
        title: normalizeHeadingTitle(h3[1]),
        lines: [],
      };
      continue;
    }
    current.lines.push(line);
  }

  if (current.lines.length || current.title) blocks.push(current);
  return blocks;
}

function convertInline(text) {
  let out = sanitizeSacText(text);

  // Subrayado
  out = out.replace(/__(.+?)__/g, "<u>$1</u>");

  // Negrita
  out = out.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

  // Cursiva con *texto* o _texto_
  out = out.replace(/(^|[^\*])\*(?!\s)(.+?)(?<!\s)\*/g, "$1<i>$2</i>");
  out = out.replace(/(^|[^_])_(?!\s)(.+?)(?<!\s)_/g, "$1<i>$2</i>");

  // Super/subíndice simple
  out = out.replace(/([A-Za-z])\^(\d+)/g, "$1<sup>$2</sup>");
  out = out.replace(/([A-Za-z])_(\d+)/g, "$1<sub>$2</sub>");

  return out;
}

function expandMacro(trimmed) {
  const match = trimmed.match(/^!(regind|indprev)$/i);
  if (!match) return null;
  return MACROS[match[1].toLowerCase()] || null;
}

function expandSystemCode(trimmed) {
  const match = trimmed.match(/^@([A-ZÁÉÍÓÚÑa-záéíóúñ]+)\s*:?\s+(.+)$/);
  if (!match) return null;

  const code = match[1].toUpperCase();
  const content = match[2];

  const label = SYSTEM_CODES[code];
  if (!label) return null;

  return `<b>- ${label}:</b> ${convertInline(content)}`;
}

function expandProblemCode(trimmed) {
  const match = trimmed.match(/^@PROB\s+(.+?)(?:\s*:\s*(.*))?$/i);
  if (!match) return null;

  const problem = match[1].trim();
  const content = (match[2] || "").trim();

  if (!problem) return null;

  if (content) {
    return `<b>- ${convertInline(problem)}:</b> ${convertInline(content)}`;
  }

  return `<b>- ${convertInline(problem)}:</b>`;
}

function lineToHtml(line) {

  const trimmed = line.trim();
  if (!trimmed) return "";

  const macro = expandMacro(trimmed);
  if (macro) return macro;

  if (trimmed.startsWith("### ")) {
  const title = trimmed.replace(/^###\s+/, "");
  return `<h3>${convertInline(title)}</h3>`;
}

  if (trimmed === "---") return "<hr>";

  const problemLine = expandProblemCode(trimmed);
  if (problemLine) return problemLine;

  const systemLine = expandSystemCode(trimmed);
  if (systemLine) return systemLine;

  if (/^- /.test(trimmed)) {
    return convertInline(trimmed);
  }

  return convertInline(trimmed);
}

function isOperationalH3(title) {
  const slug = slugify(title);
  return slug === "registro_indicaciones" || slug === "indicaciones_en_encuentro_previo";
}

function isTableLine(line) {
  const trimmed = line.trim();
  return /^\|.*\|$/.test(trimmed);
}

function isTableSeparatorLine(line) {
  const trimmed = line.trim();
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());
}

function renderSimpleTable(tableLines) {
  if (!tableLines || tableLines.length === 0) return "";

  let rows = tableLines.map(parseTableRow);

  // remover fila separadora markdown si existe en segunda línea
  if (rows.length >= 2 && isTableSeparatorLine(tableLines[1])) {
    rows.splice(1, 1);
  }

  if (rows.length < 2) {
    // al menos encabezado + 1 fila de datos
    return tableLines.map(line => convertInline(line)).join("<br>");
  }

  const colCount = rows[0].length;

  // validaciones conservadoras maximo 6 columnas
  if (colCount < 1 || colCount > 6) {
    return tableLines.map(line => convertInline(line)).join("<br>");
  }

  if (rows.length > 10) {
    return tableLines.map(line => convertInline(line)).join("<br>");
  }

  // todas las filas con mismo número de columnas
  const invalidShape = rows.some(r => r.length !== colCount);
  if (invalidShape) {
    return tableLines.map(line => convertInline(line)).join("<br>");
  }

  const htmlRows = rows.map((row, rowIndex) => {
    const cells = row.map(cell => {
      const content = convertInline(cell);

      if (rowIndex === 0) {
        return `<th>${content}</th>`;
      }

      return `<td>${content}</td>`;
    }).join("");

    return `<tr>${cells}</tr>`;
  }).join("");

  return `<table>${htmlRows}</table>`;
}

function isTableLine(line) {
  const trimmed = line.trim();
  return /^\|.*\|$/.test(trimmed);
}

function isTableSeparatorLine(line) {
  const trimmed = line.trim();
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());
}

function blockToHtml(block) {
  const pieces = [];

  if (block.title) {
    if (isOperationalH3(block.title)) {
      pieces.push(`<b>${convertInline(block.title)}</b>`);
    } else {
      pieces.push(`<h3>${convertInline(block.title)}</h3>`);
    }
  }

  const body = [];
  for (let i = 0; i < block.lines.length; i++) {
    const line = block.lines[i];

    if (isTableLine(line)) {
      const tableLines = [line];

      while (i + 1 < block.lines.length && isTableLine(block.lines[i + 1])) {
        i++;
        tableLines.push(block.lines[i]);
      }

      body.push(renderSimpleTable(tableLines));
    continue;
    }

  const html = lineToHtml(line);
  if (html) body.push(html);
  }

  let joined = body.join("<br>");

  joined = joined
    .replace(/<br><table>/g, "<table>")
    .replace(/<\/table><br>/g, "</table>")
    .replace(/<br><hr><br>/g, "<hr>")
    .replace(/<br><hr>/g, "<hr>")
    .replace(/<hr><br>/g, "<hr>")
    .replace(/(<br>){3,}/g, "<br><br>");

  if (joined) pieces.push(joined);

  return pieces.join("");
}

function sectionToHtml(section) {
  const pieces = [];
  const sectionSlug = slugify(section.title || "");

  if (
    section.title &&
    section.title !== "DOCUMENTO" &&
    !SILENT_ROOT_SECTIONS.has(sectionSlug)
  ) {
    pieces.push(`<h3>${convertInline(section.title)}</h3>`);
  }

  const subblocks = splitSubsections(section.lines);
  const rendered = subblocks
    .map(blockToHtml)
    .filter(Boolean)
    .join("<br>");

  let html = pieces.join("") + rendered;

  html = html
    .replace(/<\/h3><br><h3>/g, "</h3><h3>")
    .replace(/<\/b><br><b>/g, "</b><br><b>")
    .replace(/(<br>){3,}/g, "<br><br>")
    .trim();

  return html;
}

function splitHtmlByParagraphs(html, maxChars = MAX_CHARS) {
  if (html.length <= maxChars) return [html];

  const preferredBreaks = [
    "<hr>",
    "<h3>",
    "<br><b>- ",
    "<br><b>",
    "<br>- ",
    "<br>",
  ];

  let remaining = html;
  const chunks = [];

  while (remaining.length > maxChars) {
    let cut = -1;

    for (const token of preferredBreaks) {
      const idx = remaining.lastIndexOf(token, maxChars);
      if (idx > 0) {
        cut = idx;
        break;
      }
    }

    if (cut <= 0) cut = maxChars;

    const chunk = remaining.slice(0, cut).trim();
    remaining = remaining.slice(cut).trim();

    if (!chunk) break;
    chunks.push(chunk);
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function writeOutputs(inputPath, sections) {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));
  const manifest = [];

  for (const section of sections) {
    const html = sectionToHtml(section);
    const chunks = splitHtmlByParagraphs(html, MAX_CHARS);
    const safeName = slugify(section.title || "documento");

    if (chunks.length === 1) {
      const outFile = path.join(dir, `${base}.${safeName}.html`);
      fs.writeFileSync(outFile, chunks[0], "utf8");
      manifest.push({
        title: section.title,
        file: outFile,
        chars: chunks[0].length,
        chunks: 1,
      });
    } else {
      chunks.forEach((chunk, i) => {
        const outFile = path.join(dir, `${base}.${safeName}.part${i + 1}.html`);
        fs.writeFileSync(outFile, chunk, "utf8");
      });
      manifest.push({
        title: section.title,
        file: path.join(dir, `${base}.${safeName}.partN.html`),
        chars: html.length,
        chunks: chunks.length,
      });
    }
  }

  return manifest;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: node scripts/sac_compiler.js archivo.sac.md");
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`No existe el archivo: ${inputPath}`);
    process.exit(1);
  }

  const source = preprocessSource(readFile(inputPath));
  const sections = splitIntoTopLevelSections(source);
  const manifest = writeOutputs(inputPath, sections);

  console.log("\nSAC Compiler\n");
  for (const item of manifest) {
    console.log(`- ${item.title}`);
    console.log(`  archivo: ${item.file}`);
    console.log(`  caracteres: ${item.chars}`);
    console.log(`  segmentos: ${item.chunks}`);
  }
  console.log("");
}

main();