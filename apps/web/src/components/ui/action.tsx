import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The site's one button system.
 * - `primary`: the main action of a section (emerald fill). At most one per section.
 * - `secondary`: every other action, including links to other tools (neutral surface with a border).
 * What a button does is carried by its label and icon, not by colour, so emerald stays the only accent.
 * Buttons are 12 px rounded; chips (ChipRail) are pills; cards are 16 px.
 */
export type ActionVariant = 'primary' | 'secondary';
/** `md` for in-section actions, `lg` for a page's or section's headline action. */
export type ActionSize = 'md' | 'lg';
/** `phone` stretches below 1024 px and sizes to content on desktop. */
export type ActionWidth = 'auto' | 'phone' | 'full';

interface ActionStyle {
  variant?: ActionVariant;
  size?: ActionSize;
  width?: ActionWidth;
}

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-xl py-2 text-center transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:pointer-events-none disabled:opacity-40 cursor-pointer';

const VARIANTS: Record<ActionVariant, string> = {
  primary: 'bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 active:bg-emerald-300',
  secondary: 'border border-white/[0.12] bg-white/[0.04] text-slate-100 font-semibold hover:border-white/[0.2] hover:bg-white/[0.08] active:bg-white/[0.08]',
};

// Phones get 44 to 48 px targets; desktop keeps the denser scale it had.
const SIZES: Record<ActionSize, string> = {
  md: 'min-h-11 px-4 text-sm lg:min-h-9 lg:text-xs',
  lg: 'min-h-12 px-5 text-[15px] lg:min-h-11 lg:text-sm',
};

const WIDTHS: Record<ActionWidth, string> = {
  auto: '',
  phone: 'w-full lg:w-auto',
  full: 'w-full',
};

const ICON_SIZE: Record<ActionSize, string> = { md: 'h-4 w-4 lg:h-3.5 lg:w-3.5', lg: 'h-4 w-4' };

export function actionClassName({ variant = 'primary', size = 'md', width = 'auto' }: ActionStyle): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], WIDTHS[width]);
}

interface ActionContentProps {
  icon?: LucideIcon;
  size: ActionSize;
  children: React.ReactNode;
}

// The icon sits inline with the label so a long label that wraps on a narrow phone keeps the icon beside its first line.
function ActionContent({ icon: Icon, size, children }: ActionContentProps) {
  return (
    <span className="text-balance">
      {Icon && <Icon className={cn(ICON_SIZE[size], 'mr-2 inline-block -translate-y-px align-middle')} aria-hidden="true" />}
      {children}
    </span>
  );
}

type ActionLinkProps = ActionStyle &
  Omit<React.ComponentProps<typeof Link>, 'className' | 'children'> & {
    icon?: LucideIcon;
    children: React.ReactNode;
  };

export function ActionLink({ variant, size = 'md', width, icon, children, ...linkProps }: ActionLinkProps) {
  return (
    <Link className={actionClassName({ variant, size, width })} {...linkProps}>
      <ActionContent icon={icon} size={size}>
        {children}
      </ActionContent>
    </Link>
  );
}

type ActionButtonProps = ActionStyle &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    icon?: LucideIcon;
    children: React.ReactNode;
  };

export function ActionButton({ variant, size = 'md', width, icon, children, type = 'button', ...buttonProps }: ActionButtonProps) {
  return (
    <button type={type} className={actionClassName({ variant, size, width })} {...buttonProps}>
      <ActionContent icon={icon} size={size}>
        {children}
      </ActionContent>
    </button>
  );
}
