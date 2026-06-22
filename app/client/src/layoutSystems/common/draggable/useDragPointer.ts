import { useCallback, useRef } from "react";
import type { PointerEvent, PointerEventHandler } from "react";

export interface DragPointerOptions {
  /**
   * Invoked when a pointer-down begins a drag gesture. Receives the captured
   * target element so the caller can compute drag state from it.
   */
  onDragStart: (target: HTMLElement, event: PointerEvent<HTMLElement>) => void;
  /**
   * When false, the hook ignores all pointer events and returns no-op handlers.
   * Mirrors the `draggable` flag semantics of the legacy HTML5 drag handler.
   */
  shouldAllowDrag: boolean;
}

export interface DragPointerHandlers {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

/**
 * Pointer Events API replacement for the legacy HTML5 drag handlers. Provides
 * the same gesture lifecycle (idle -> dragging -> dropped, with escape/cancel
 * treated as cancellation) without depending on `draggable=true` or the
 * deprecated `dataTransfer` API.
 *
 * This hook intentionally does not mutate any drag-state Redux store; it owns
 * only the gesture lifecycle. Callers wire its `onDragStart` into the existing
 * `setDraggingState` flow.
 */
export function useDragPointer({
  onDragStart,
  shouldAllowDrag,
}: DragPointerOptions): DragPointerHandlers {
  const isDragging = useRef(false);
  const activePointerId = useRef<number | null>(null);

  const onPointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!shouldAllowDrag) return;
      // Modifier-key holds suppress the drag (parity with the legacy handler).
      if (event.metaKey || event.ctrlKey) return;
      // Only the primary button starts a drag.
      if (event.button !== 0) return;

      const target = event.currentTarget;

      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // setPointerCapture is best-effort; swallow if the runtime rejects it.
      }

      isDragging.current = true;
      activePointerId.current = event.pointerId;
      onDragStart(target, event);
    },
    [onDragStart, shouldAllowDrag]
  );

  const onPointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isDragging.current) return;
      if (activePointerId.current !== event.pointerId) return;
      // Per-frame movement is handled by the existing drag layer; this hook
      // only tracks lifecycle and capture release.
    },
    []
  );

  const releasePointer = useCallback(
    (target: HTMLElement, pointerId: number) => {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // releasePointerCapture is best-effort; swallow if not currently held.
      }

      isDragging.current = false;
      activePointerId.current = null;
    },
    []
  );

  const onPointerUp: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isDragging.current) return;
      if (activePointerId.current !== event.pointerId) return;
      releasePointer(event.currentTarget, event.pointerId);
    },
    [releasePointer]
  );

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isDragging.current) return;
      releasePointer(event.currentTarget, event.pointerId);
    },
    [releasePointer]
  );

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
