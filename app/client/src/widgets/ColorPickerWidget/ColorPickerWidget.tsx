import React, { useEffect, useRef, useState } from "react";
import styles from "./ColorPickerWidget.module.css";

export interface ColorPickerWidgetProps {
  /** Currently committed color value (hex or rgb string). */
  value: string;
  /** Fires when a valid color is committed. */
  onChange: (next: string) => void;
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_RE =
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/;

/** Returns true for `#rgb`, `#rrggbb`, `rgb(...)`, `rgba(...)`. */
export function isValidColor(input: string): boolean {
  const trimmed = input.trim();
  return HEX_RE.test(trimmed) || RGB_RE.test(trimmed);
}

/**
 * ColorPickerWidget — popover-based color picker.
 *
 * - Renders a swatch button showing the current value.
 * - Clicking the swatch opens a popover with an input field.
 * - Outside-click or Escape closes the popover.
 * - Valid hex (`#rgb`, `#rrggbb`) and rgb/rgba strings commit and fire onChange.
 * - Malformed input surfaces an inline validation error and does NOT fire onChange.
 *
 * Pure presentation — writes through the parent-supplied onChange handler.
 */
export const ColorPickerWidget: React.FC<ColorPickerWidgetProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Keep draft in sync when the upstream value changes externally.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  // Close on outside-click while open.
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setError(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setError(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handleCommit = (input: string) => {
    if (!isValidColor(input)) {
      setError("Enter a valid color (e.g. #ff0000 or rgb(255,0,0))");
      return;
    }
    setError(null);
    onChange(input.trim());
  };

  return (
    <div className={styles.colorPicker} ref={popoverRef}>
      <button
        aria-label="Open color picker"
        className={styles.swatch}
        data-testid="color-picker-swatch"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ backgroundColor: value }}
        type="button"
      />

      {isOpen && (
        <div
          className={styles.popover}
          data-testid="color-picker-popover"
          role="dialog"
        >
          <input
            aria-label="Color value"
            className={styles.input}
            data-testid="color-picker-input"
            onBlur={(e) => handleCommit(e.target.value)}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCommit((e.target as HTMLInputElement).value);
              }
            }}
            type="text"
            value={draft}
          />

          {error && (
            <div
              className={styles.error}
              data-testid="color-picker-error"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPickerWidget;
