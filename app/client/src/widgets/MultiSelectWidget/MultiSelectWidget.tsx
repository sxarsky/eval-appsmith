import React, { useEffect, useRef, useState } from "react";
import styles from "./MultiSelectWidget.module.css";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectWidgetProps {
  /** Available options the user can pick from. */
  options: MultiSelectOption[];
  /** Currently selected values. Controlled. */
  value: string[];
  /** Fires whenever selection changes. */
  onChange: (next: string[]) => void;
  /** Placeholder text when nothing is selected. */
  placeholder?: string;
}

/**
 * MultiSelectWidget — multi-select dropdown with chip-based display.
 *
 * Supported interactions:
 *  - Click chip's "×" to remove a single value
 *  - Click "Clear all" to reset to []
 *  - Arrow keys / Enter / Escape to navigate the dropdown
 *
 * Documented limitation: screen-reader announcement of selection
 * changes (aria-live region) is deferred to a follow-up PR. The widget
 * is otherwise functionally complete.
 */
export const MultiSelectWidget: React.FC<MultiSelectWidgetProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
}) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedSet = new Set(value);
  const selectedOptions = options.filter((opt) => selectedSet.has(opt.value));

  const toggleValue = (optionValue: string) => {
    const next = selectedSet.has(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setFocusedIndex((prev) => Math.min(options.length - 1, prev + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === "Enter" && open && focusedIndex >= 0) {
      event.preventDefault();
      toggleValue(options[focusedIndex]!.value);
    }
  };

  return (
    <div
      className={styles.root}
      data-testid="multi-select-widget"
      onKeyDown={handleKey}
      ref={rootRef}
      tabIndex={0}
    >
      <div
        className={styles.control}
        data-testid="multi-select-control"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedOptions.length === 0 ? (
          <span
            className={styles.placeholder}
            data-testid="multi-select-placeholder"
          >
            {placeholder}
          </span>
        ) : (
          <div
            className={styles.chips}
            data-testid="multi-select-chips"
          >
            {selectedOptions.map((opt) => (
              <span
                className={styles.chip}
                data-testid={`multi-select-chip-${opt.value}`}
                key={opt.value}
              >
                {opt.label}
                <button
                  aria-label={`Remove ${opt.label}`}
                  className={styles.chipRemove}
                  data-testid={`multi-select-chip-remove-${opt.value}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(opt.value);
                  }}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {value.length > 0 && (
          <button
            aria-label="Clear all selections"
            className={styles.clearAll}
            data-testid="multi-select-clear-all"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            type="button"
          >
            Clear all
          </button>
        )}
      </div>

      {open && (
        <ul
          className={styles.menu}
          data-testid="multi-select-menu"
          role="listbox"
        >
          {options.map((opt, idx) => (
            <li
              aria-selected={selectedSet.has(opt.value)}
              className={`${styles.option} ${
                idx === focusedIndex ? styles.optionFocused : ""
              }`}
              data-testid={`multi-select-option-${opt.value}`}
              key={opt.value}
              onClick={() => toggleValue(opt.value)}
              onMouseEnter={() => setFocusedIndex(idx)}
              role="option"
            >
              <input
                checked={selectedSet.has(opt.value)}
                onChange={() => {}}
                type="checkbox"
              />
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSelectWidget;
