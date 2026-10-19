import React from 'react';
import { Home } from 'lucide-react';
import { ActionLink } from '@/components/ui/action';

export default function LocalizedNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-lg">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed max-w-md">
        The requested tax calculation scenario, province schedule, or page could not be found.
      </p>
      <div className="pt-2">
        <ActionLink href="/en" icon={Home}>
          Return to Home
        </ActionLink>
      </div>
    </div>
  );
}

