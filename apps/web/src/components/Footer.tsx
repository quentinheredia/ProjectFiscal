import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale, getDictionary } from '@/lib/i18n';
import { CheckCircle2 } from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="pt-12 border-t border-slate-800/80 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Column 1: Brand & Integrity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-icon.png"
              alt="Fiscal Insights Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-white text-sm">Fiscal Insights</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {locale === 'fr'
              ? 'Plateforme open source de transparence fiscale et de calcul d’impôt canadien conforme aux normes ARC 2026.'
              : 'Audited Canadian tax engine and fiscal transparency platform built to CRA 2026 statutory specifications.'}
          </p>
          <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {locale === 'fr' ? 'Moteur ARC 2026.1 validé' : '2026.1 CRA Engine Audited'}
          </span>
        </div>

        {/* Column 2: Provincial Calculators */}
        <div className="space-y-2.5">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
            {locale === 'fr' ? 'Calculateurs' : 'Calculators'}
          </span>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <Link href={`/${locale}/calculator/ontario`} className="hover:text-emerald-400 transition-colors">
                Ontario (ON428)
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/calculator/quebec`} className="hover:text-emerald-400 transition-colors">
                Québec (TP-1)
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/calculator/british-columbia`} className="hover:text-emerald-400 transition-colors">
                British Columbia (BC428)
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/calculator/alberta`} className="hover:text-emerald-400 transition-colors">
                Alberta (AB428)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Fast-Track Benchmarks */}
        <div className="space-y-2.5">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
            {locale === 'fr' ? 'Repères d’audit' : 'Audit Benchmarks'}
          </span>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <Link href={`/${locale}/salary/80000/ontario`} className="text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                <span>$80,000 Audit Case</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/salary/50000/ontario`} className="hover:text-emerald-400 transition-colors">
                $50,000 Fast-Track
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/salary/100000/ontario`} className="hover:text-emerald-400 transition-colors">
                $100,000 Fast-Track
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/salary/150000/ontario`} className="hover:text-emerald-400 transition-colors">
                $150,000 Fast-Track
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Architecture & Integrity */}
        <div className="space-y-2.5">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
            {locale === 'fr' ? 'Normes & Intégrité' : 'Standards & Privacy'}
          </span>
          <ul className="space-y-1.5 text-slate-400">
            <li className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Pure</span>
            </li>
            <li className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Integer-Cents Math</span>
            </li>
            <li className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Remote Tracking</span>
            </li>
            <li className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Schedule 1 Citations</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal Disclaimer & Copyright */}
      <div className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 leading-relaxed max-w-4xl mx-auto space-y-2">
        <p>{dict.disclaimer}</p>
        <p className="text-[11px] text-slate-600 font-mono">
          © 2026 Fiscal Insights. Canadian Tax Transparency Initiative.
        </p>
      </div>
    </footer>
  );
}

