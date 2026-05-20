import React, { useState } from "react";
import { ColorPickerWidget } from "widgets/ColorPickerWidget/ColorPickerWidget";

/**
 * Demo page that mounts the ColorPickerWidget on a real route so the
 * widget's swatch + popover + validation behavior is exercisable in the
 * running app (browser-testable via Playwright + Jest/RTL).
 *
 * The page is intentionally minimal — a heading, the widget, and a
 * read-out of the currently committed color value.
 */
export function ColorPickerDemoPage() {
  const [color, setColor] = useState<string>("#1abc9c");

  return (
    <div
      data-testid="color-picker-demo-page"
      style={{
        padding: "40px",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <h1>Color Picker Demo</h1>
      <p>Click the swatch to open the picker. Enter a hex or rgb value.</p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <ColorPickerWidget onChange={setColor} value={color} />
        <span data-testid="color-picker-demo-current-value">{color}</span>
      </div>
    </div>
  );
}

export default ColorPickerDemoPage;
