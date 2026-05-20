import React, { useState } from "react";
import { MultiSelectWidget } from "widgets/MultiSelectWidget/MultiSelectWidget";

const OPTIONS = [
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Cyan", value: "cyan" },
  { label: "Magenta", value: "magenta" },
  { label: "Yellow", value: "yellow" },
];

/**
 * Demo route that mounts the MultiSelectWidget on a reachable path so
 * the chip-display / clear-all / keyboard-navigation behavior is
 * exercisable in the running app (Playwright + Jest/RTL).
 */
export function MultiSelectDemoPage() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div
      data-testid="multi-select-demo-page"
      style={{ padding: "40px", maxWidth: "640px", margin: "0 auto" }}
    >
      <h1>MultiSelect Demo</h1>
      <p>Pick one or more colors. Click chip-× to remove individually, Clear all to reset.</p>

      <MultiSelectWidget
        onChange={setSelected}
        options={OPTIONS}
        placeholder="Pick colors"
        value={selected}
      />

      <p data-testid="multi-select-demo-summary" style={{ marginTop: "16px" }}>
        Selected: {selected.length === 0 ? "(none)" : selected.join(", ")}
      </p>
    </div>
  );
}

export default MultiSelectDemoPage;
