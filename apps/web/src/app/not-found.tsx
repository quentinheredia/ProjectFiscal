import React from 'react';
import { Home } from 'lucide-react';
import { ActionLink } from '@/components/ui/action';

export default function RootNotFound() {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-100 p-6 text-center antialiased">
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-lg">
            404
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page or calculator route you requested does not exist or has been moved.
          </p>
          <div className="pt-2">
            <ActionLink href="/en" icon={Home}>
              Return to Fiscal Insights
            </ActionLink>
          </div>
        </div>
      </body>
    </html>
  );
}

