'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  className?: string;
}

/** Stops the page behind a modal from scrolling while it is open. */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

/** Dragging the handle down this far closes the sheet. */
const DISMISS_DRAG_PX = 80;

/**
 * Lets the handle drag the sheet down, closing it past DISMISS_DRAG_PX. The offset is written straight
 * to the element's style, so a drag does not re-render. The close button is the non-gesture way out.
 */
function useDragToDismiss(sheetRef: React.RefObject<HTMLElement | null>, onDismiss: () => void) {
  const startY = useRef<number | null>(null);
  const offsetOf = (event: React.PointerEvent) => Math.max(0, event.clientY - (startY.current ?? event.clientY));
  const setOffset = (px: number) => {
    if (sheetRef.current) sheetRef.current.style.transform = px ? `translateY(${px}px)` : '';
  };
  const end = (event: React.PointerEvent) => {
    if (startY.current === null) return;
    const offset = offsetOf(event);
    startY.current = null;
    setOffset(0);
    if (offset > DISMISS_DRAG_PX) onDismiss();
  };

  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      startY.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (startY.current !== null) setOffset(offsetOf(event));
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
}

/**
 * A modal sheet that rises from the bottom of the screen. Uses the native <dialog>, which traps focus,
 * closes on Escape and gives a backdrop; a tap on the backdrop also closes it.
 */
export function BottomSheet({ open, onClose, title, closeLabel, children, className }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dragHandlers = useDragToDismiss(dialogRef, onClose);
  useBodyScrollLock(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'sheet-in mx-auto mb-0 mt-auto w-full max-w-2xl max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-white/[0.1] bg-[#0c121e] p-0 text-slate-100',
        'shadow-[0_-12px_40px_rgba(0,0,0,0.7)] backdrop:bg-black/60 backdrop:backdrop-blur-xs',
        className
      )}
    >
      <div className="space-y-5 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="-mx-5 flex h-7 cursor-grab touch-none items-end justify-center select-none" aria-hidden="true" {...dragHandlers}>
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-base font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400 active:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
