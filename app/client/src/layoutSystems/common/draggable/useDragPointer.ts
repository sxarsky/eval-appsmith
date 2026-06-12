import { useEffect, useRef, useState } from "react";

/**
 * Pointer Events API replacement for the legacy HTML5 drag-events
 * implementation on the App Builder canvas. Tracks drag state through
 * `pointerdown` / `pointermove` / `pointerup` and exposes the same
 * lifecycle the consumer expects (idle → dragging → dropped).
 *
 * Escape key cancels the drag in flight and returns state to idle
 * without firing onDrop.
 *
 * Observable behavior preservation:
 *  - onDrop fires with the same payload shape as the prior implementation
 *  - Three drag-state transitions visible via the dragState return value
 *  - Escape key cancels without firing onDrop
 */
export type DragPointerState = "idle" | "dragging" | "dropped";

export interface UseDragPointerOptions {
  /**
   * Called once at the start of a pointer-driven drag. Implementations
   * typically dispatch `setDraggingState({ ... })` to the redux store.
   */
  onPointerDragStart: (event: PointerEvent) => void;
  /**
   * Called when the pointer is released after a drag. Implementations
   * receive both the original target and the final drop position so the
   * existing onDrop semantics are preserved.
   */
  onPointerDragEnd: (event: PointerEvent, dropPosition: { x: number; y: number }) => void;
  /**
   * Called if the drag is cancelled (Escape key, pointer-cancel event).
   * Implementations typically reset the dragging state.
   */
  onPointerDragCancel: () => void;
}

const ACTIVATION_THRESHOLD_PX = 4;

export interface UseDragPointerResult {
  dragState: DragPointerState;
  pointerHandlers: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  };
}

export function useDragPointer(options: UseDragPointerOptions): UseDragPointerResult {
  const [dragState, setDragState] = useState<DragPointerState>("idle");
  const downRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const activeRef = useRef<boolean>(false);

  // Escape key cancels a drag in flight.
  useEffect(() => {
    if (dragState !== "dragging") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        activeRef.current = false;
        downRef.current = null;
        setDragState("idle");
        options.onPointerDragCancel();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dragState, options]);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    downRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    activeRef.current = false;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!downRef.current) return;
    if (downRef.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - downRef.current.x;
    const dy = event.clientY - downRef.current.y;

    // Only activate after the pointer has moved past the activation
    // threshold to avoid treating a click as a drag.
    if (!activeRef.current && dx * dx + dy * dy >= ACTIVATION_THRESHOLD_PX * ACTIVATION_THRESHOLD_PX) {
      activeRef.current = true;
      setDragState("dragging");
      options.onPointerDragStart(event.nativeEvent);
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!downRef.current || downRef.current.pointerId !== event.pointerId) {
      return;
    }
    const wasActive = activeRef.current;
    const dropPosition = { x: event.clientX, y: event.clientY };
    downRef.current = null;
    activeRef.current = false;

    if (wasActive) {
      setDragState("dropped");
      options.onPointerDragEnd(event.nativeEvent, dropPosition);
      // Reset to idle on the next tick so the dropped state is
      // observable to subscribers (testbed asserts on this transition).
      setTimeout(() => setDragState("idle"), 0);
    }
  };

  const onPointerCancel = (_event: React.PointerEvent<HTMLElement>) => {
    if (!downRef.current) return;
    activeRef.current = false;
    downRef.current = null;
    setDragState("idle");
    options.onPointerDragCancel();
  };

  return {
    dragState,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
