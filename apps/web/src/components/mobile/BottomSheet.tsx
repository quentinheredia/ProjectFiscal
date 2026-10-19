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

/**
 * A modal sheet that rises from the bottom of the screen. Uses the native <dialog>, which traps focus,
 * closes on Escape and gives a backdrop; a tap on the backdrop also closes it.
 */
export function BottomSheet({ open, onClose, title, closeLabel, children, className }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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
      <div className="space-y-5 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />
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
