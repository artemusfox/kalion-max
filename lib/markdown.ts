// ═══════════════════════════════════════════════════════════
// Mini-Markdown-Renderer — kein npm-Paket, deckt 95% der Fälle:
//   **bold**   *italic*   `code`   [text](url)   [link](url)   newlines
//   - bullet list, paragraphs
// XSS-safe: HTML wird escaped, dann werden Inline-Patterns ersetzt mit safe tags
// URLs werden auf http(s):/mailto: gefiltert → kein javascript:
// ═══════════════════════════════════════════════════════════

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return null;
}

function renderInline(text: string): string {
  let s = escapeHtml(text);
  // Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safe = safeUrl(url);
    if (!safe) return label;
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline">${label}</a>`;
  });
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  // Code: `code`
  s = s.replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.9em;background:var(--surface);padding:1px 5px;border-radius:4px">$1</code>');
  return s;
}

export function markdownToHtml(text: string | null | undefined): string {
  if (!text) return "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let listOpen = false;
  let para: string[] = [];

  function flushPara() {
    if (para.length > 0) {
      out.push(`<p style="margin:0 0 6px;line-height:1.5">${para.map(renderInline).join("<br>")}</p>`);
      para = [];
    }
  }

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushPara();
      if (!listOpen) {
        out.push('<ul style="margin:0 0 6px;padding-left:18px">');
        listOpen = true;
      }
      out.push(`<li style="margin-bottom:2px">${renderInline(bulletMatch[1])}</li>`);
      continue;
    }
    if (listOpen) { out.push("</ul>"); listOpen = false; }
    if (line.trim() === "") {
      flushPara();
    } else {
      para.push(line);
    }
  }
  flushPara();
  if (listOpen) out.push("</ul>");
  return out.join("");
}
