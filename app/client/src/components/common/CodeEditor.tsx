import React, { useMemo } from "react";

export interface CodeEditorProps {
  /** Source text to display. Rendered read-only. */
  value: string;
  /** Language label shown in the header chip. */
  language?: string;
  /** Maximum height in px before the viewer scrolls. Defaults to 320. */
  maxHeight?: number;
  /** Called with the full text when the copy affordance is used. */
  onCopy?: (value: string) => void;
}

/**
 * Read-only code viewer for surfacing generated snippets (cURL commands,
 * webhook payloads, config fragments) outside of CodeMirror. Unlike the
 * editorComponents CodeEditor, this renders plain text with no evaluation,
 * autocomplete, or binding support — it is intentionally dependency-free.
 */
export default function CodeEditor(props: CodeEditorProps) {
  const { language = "text", maxHeight = 320, onCopy, value } = props;

  const lines = useMemo(() => value.split("\n"), [value]);

  return (
    <div
      className="t--readonly-code-editor"
      data-language={language}
      style={{ border: "1px solid var(--ads-v2-color-border)", borderRadius: 4 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: "1px solid var(--ads-v2-color-border)",
        }}
      >
        <span className="t--readonly-code-language">{language}</span>
        <button
          className="t--readonly-code-copy"
          onClick={() => onCopy?.(value)}
          type="button"
        >
          Copy
        </button>
      </div>
      <pre style={{ margin: 0, maxHeight, overflow: "auto", padding: 8 }}>
        {lines.map((line, i) => (
          <div data-line-number={i + 1} key={i}>
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
