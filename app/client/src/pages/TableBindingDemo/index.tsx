import React, { useState } from "react";

/**
 * Demo page for the AS09 TableWidget data-source binding UI. Mounts a
 * minimal property-pane-style dropdown that lets the user pick a
 * "data source" action; the bound action is reflected in a summary
 * below.
 *
 * Production wiring of this binding into the actual TableWidget
 * property pane is intentionally out of scope for this demo PR — this
 * page exists so the binding UX is browser-testable without requiring
 * a full appsmith app + action setup.
 */
interface DemoAction {
  id: string;
  name: string;
}

const AVAILABLE_ACTIONS: DemoAction[] = [
  { id: "action-1", name: "fetchUsers" },
  { id: "action-2", name: "fetchOrders" },
  { id: "action-3", name: "fetchProducts" },
];

export function TableBindingDemoPage() {
  const [boundActionId, setBoundActionId] = useState<string>("");
  const [lastRequestPayload, setLastRequestPayload] = useState<string>("");

  const bound = AVAILABLE_ACTIONS.find((a) => a.id === boundActionId) ?? null;

  function executeBoundAction() {
    if (!bound) return;
    // Simulate what the real TableWidget binding would POST to
    // /api/v1/actions/:id/execute -- the widget-scoped params per AS09.
    const payload = {
      widgetId: "demo-table-1",
      widgetName: "DemoTable",
      scope: "table",
    };
    setLastRequestPayload(JSON.stringify(payload, null, 2));
  }

  return (
    <div
      data-testid="table-binding-demo-page"
      style={{ padding: "40px", maxWidth: "640px", margin: "0 auto" }}
    >
      <h1>TableWidget Data Source Binding</h1>
      <p>Pick an action to bind to this table, then preview the execute payload.</p>

      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span>Data source</span>
        <select
          data-testid="table-binding-source-dropdown"
          onChange={(e) => setBoundActionId(e.target.value)}
          value={boundActionId}
        >
          <option value="">— select an action —</option>
          {AVAILABLE_ACTIONS.map((action) => (
            <option key={action.id} value={action.id}>
              {action.name}
            </option>
          ))}
        </select>
      </label>

      <p
        data-testid="table-binding-selection-summary"
        style={{ marginTop: "16px" }}
      >
        {bound
          ? `Bound to: ${bound.name} (${bound.id})`
          : "No data source bound"}
      </p>

      <button
        data-testid="table-binding-execute"
        disabled={!bound}
        onClick={executeBoundAction}
        style={{ marginTop: "8px" }}
        type="button"
      >
        Preview execute payload
      </button>

      {lastRequestPayload && (
        <pre
          data-testid="table-binding-last-payload"
          style={{
            background: "#f4f4f4",
            padding: "12px",
            marginTop: "12px",
            borderRadius: "4px",
          }}
        >
          {lastRequestPayload}
        </pre>
      )}
    </div>
  );
}

export default TableBindingDemoPage;
