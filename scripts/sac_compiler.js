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

const MAX_CHARS = 3900;

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

function normalizeHeadingTitle(raw) {
  return raw.trim();
}

function splitIntoTopLevelSections(source) {
  const lines = source.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)$/);
    const h3 = line.match(/^###\s+(.*)$/);

    // Tratamos H2 como bloque principal
    if (h2) {
      if (current) sections.push(current);
      current = {
        level: 2,
        title: normalizeHeadingTitle(h2[1]),
        lines: [],
      };
      continue;
    }

    // Si no existe bloque actual, un H3 también puede iniciar uno.
    // Si ya estamos dentro de un bloque, H3 queda como parte interna.
    if (h3 && !current) {
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
  // Dentro de una sección mayor, detecta H3 como subbloques
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
  let out = text;

  // Escape HTML mínimo
  out = out
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Negrita
  out = out.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

  // Cursiva con _texto_ o *texto*
  out = out.replace(/(^|[^\*])\*(?!\s)(.+?)(?<!\s)\*/g, "$1<i>$2</i>");
  out = out.replace(/(^|[^_])_(?!\s)(.+?)(?<!\s)_/g, "$1<i>$2</i>");

  // Subrayado estilo spec: __texto__
  out = out.replace(/__(.+?)__/g, "<u>$1</u>");

  return out;
}

function lineToHtml(line) {
  const trimmed = line.trim();
  if (!trimmed) return "";

  if (trimmed === "---") return "<hr>";

  // Lista simple
  if (/^- /.test(trimmed)) {
    return convertInline(trimmed);
  }

  return convertInline(trimmed);
}

function blockToHtml(block) {
  const pieces = [];

  if (block.title) {
    pieces.push(`<h3>${convertInline(block.title)}</h3>`);
  }

  const body = [];
  for (const line of block.lines) {
    const html = lineToHtml(line);
    if (html) body.push(html);
  }

  let joined = body.join("<br>");

  joined = joined
    .replace(/<br><hr><br>/g, "<hr>")
    .replace(/<br><hr>/g, "<hr>")
    .replace(/<hr><br>/g, "<hr>")
    .replace(/(<br>){3,}/g, "<br><br>");

  if (joined) pieces.push(joined);

  return pieces.join("");
}

function sectionToHtml(section) {
  const titleTag = section.level === 2 ? "h3" : "h3";
  const pieces = [];

  if (section.title && section.title !== "DOCUMENTO") {
    pieces.push(`<${titleTag}>${convertInline(section.title)}</${titleTag}>`);
  }

  const subblocks = splitSubsections(section.lines);
  const rendered = subblocks
    .map(blockToHtml)
    .filter(Boolean)
    .join("<br>");

  let html = pieces.join("") + rendered;

  html = html
    .replace(/<\/h3><br><h3>/g, "</h3><h3>")
    .replace(/(<br>){3,}/g, "<br><br>")
    .trim();

  return html;
}

function splitHtmlByParagraphs(html, maxChars = MAX_CHARS) {
  if (html.length <= maxChars) return [html];

  // Cortes preferentes
  const preferredBreaks = ["<hr>", "<h3>", "<br><b>- ", "<br><b>", "<br>- ", "<br>"];

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

    if (cut <= 0) {
      cut = maxChars;
    }

    let chunk = remaining.slice(0, cut).trim();
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

  const source = readFile(inputPath);
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