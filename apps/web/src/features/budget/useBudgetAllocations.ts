'use client';

import { useMemo, useState } from 'react';
import { ENVELOPE_STEP_BILLION, baselineAllocations, type BudgetEnvelope } from './envelopes';
import { summarizeBudget, type BudgetSummary } from './summarize';

export interface BudgetModel {
  allocationOf: (envelope: BudgetEnvelope) => number;
  setAllocation: (envelope: BudgetEnvelope, billions: number) => void;
  /** Moves an envelope by whole steps of ENVELOPE_STEP_BILLION, within its range. */
  nudge: (envelope: BudgetEnvelope, steps: number) => void;
  reset: () => void;
  summary: BudgetSummary;
}

function clampToRange(envelope: BudgetEnvelope, billions: number): number {
  const clamped = Math.min(envelope.maxBillion, Math.max(envelope.minBillion, billions));
  return Math.round(clamped * 10) / 10;
}

/** Allocation state for the budget simulator; shared by its phone and desktop views. */
export function useBudgetAllocations(): BudgetModel {
  const [allocations, setAllocations] = useState<Record<string, number>>(baselineAllocations);
  const summary = useMemo(() => summarizeBudget(allocations), [allocations]);

  const allocationOf = (envelope: BudgetEnvelope) => allocations[envelope.id] ?? envelope.baselineBillion;
  const setAllocation = (envelope: BudgetEnvelope, billions: number) =>
    setAllocations((previous) => ({ ...previous, [envelope.id]: clampToRange(envelope, billions) }));

  return {
    allocationOf,
    setAllocation,
    nudge: (envelope, steps) => setAllocation(envelope, allocationOf(envelope) + steps * ENVELOPE_STEP_BILLION),
    reset: () => setAllocations(baselineAllocations()),
    summary,
  };
}

