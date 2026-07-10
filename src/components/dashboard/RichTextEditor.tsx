"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight dependency-free rich-text editor (contentEditable + execCommand).
// Emits HTML. Commands run on mousedown with preventDefault so the editor keeps
// focus + selection (this is what makes lists/format reliable). The link tool
// uses an inline URL bar instead of a browser prompt.

type Props = {
  value: string;
  onChange: (html: string) => void;
};

type Cmd = { cmd: string; label: string; title: string };

const CMDS: Cmd[] = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bulleted list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
];

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  // seed once (uncontrolled thereafter to keep the caret stable)
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  // run a command while the editor keeps focus (mousedown + preventDefault)
  function run(cmd: string) {
    document.execCommand(cmd, false);
    emit();
  }

  function openLink() {
    saveSelection();
    setLinkUrl("https://");
    setLinkOpen(true);
  }

  function applyLink() {
    const url = linkUrl.trim();
    setLinkOpen(false);
    if (!url) return;
    ref.current?.focus();
    restoreSelection();
    document.execCommand("createLink", false, url);
    emit();
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 focus-within:border-gold">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-1.5">
        {CMDS.map((c) => (
          <button
            key={c.cmd}
            type="button"
            title={c.title}
            onMouseDown={(e) => { e.preventDefault(); run(c.cmd); }}
            className="rounded px-2.5 py-1 text-xs font-semibold text-offwhite/70 transition-colors hover:bg-white/10 hover:text-gold"
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => { e.preventDefault(); openLink(); }}
          className="rounded px-2.5 py-1 text-xs font-semibold text-offwhite/70 transition-colors hover:bg-white/10 hover:text-gold"
        >
          🔗 Link
        </button>
      </div>

      {/* Inline link bar — appears in place, applies to the selected text */}
      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-2 py-1.5">
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.com"
            className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
          />
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={applyLink}
            className="rounded bg-gold px-3 py-1 text-xs font-semibold text-black">Add</button>
          <button type="button" onClick={() => setLinkOpen(false)}
            className="rounded px-2 py-1 text-xs text-offwhite/50 hover:text-offwhite">Cancel</button>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        className="blog-content min-h-[220px] px-3 py-2.5 text-offwhite outline-none"
      />
    </div>
  );
}
