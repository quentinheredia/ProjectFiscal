'use client';

import React from 'react';
import { Onboarding, TipsList } from '@/components/ui/onboarding';
import { Locale } from '@/lib/i18n';
import { FEDERAL_SPENDING_CATEGORIES } from '@/lib/spending';
import { Shield, Compass, CheckCircle2, FileText, PieChart } from 'lucide-react';

interface SiteTutorialProps {
  locale: Locale;
}

// Same spending shares the calculator shows, so the two never disagree.
const spendingShare = (id: string, isFr: boolean) => {
  const percentage = FEDERAL_SPENDING_CATEGORIES.find((category) => category.id === id)?.percentage ?? 0;
  return isFr ? `${String(percentage).replace('.', ',')} %` : `${percentage}%`;
};

export default function SiteTutorial({ locale }: SiteTutorialProps) {
  const isFr = locale === 'fr';

  return (
    <section className="max-w-4xl mx-auto bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isFr ? 'Tutoriel interactif' : 'Interactive Walkthrough'}</span>
        </div>
      </div>

      <Onboarding totalSteps={3} defaultValue={1} className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isFr ? 'Comment fonctionne Fiscal Insights' : 'How Fiscal Insights Works'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFr
                ? 'Trois principes d’ingénierie qui rendent notre calculateur unique au Canada.'
                : 'Three engineering principles that make this tax intelligence engine different.'}
            </p>
          </div>
          <Onboarding.StepIndicator />
        </div>

        {/* STEP 1 */}
        <Onboarding.Step step={1} className="space-y-4">
          <Onboarding.Header
            title={isFr ? '1. Confidentialité absolue garantie' : '1. Absolute Local Client-Side Privacy'}
            description={
              isFr
                ? 'Vos chiffres financiers ne quittent jamais votre navigateur.'
                : 'Zero financial data is ever transmitted across the internet.'
            }
          />
          <div className="bg-[#070b12] rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  {isFr ? 'Calculs purs en mémoire locale' : 'Pure In-Memory Integer Cents Execution'}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {isFr
                    ? 'Le moteur fiscal est une fonction mathématique pure TypeScript sans I/O, sans Date.now() et sans appels réseau. Vos données ne sont jamais envoyées à des bases de données ou traceurs analytiques.'
                    : 'The tax engine is a pure, zero-I/O TypeScript function executed entirely inside your device. Your salary and deductions are never written to server logs, URLs, or external analytics.'}
                </p>
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Mathématiques en cents entiers: ' : 'Integer cents math: '}
                  </span>
                  <span>{isFr ? 'Élimine tout bogue d’arrondi en virgule flottante.' : 'Prevents floating point rounding errors.'}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Zéro cookie tiers: ' : 'Zero tracking cookies: '}
                  </span>
                  <span>{isFr ? 'Votre calcul reste strictement confidentiel.' : 'Your tax calculation remains private.'}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 2 */}
        <Onboarding.Step step={2} className="space-y-4">
          <Onboarding.Header
            title={isFr ? '2. Chaque dollar est sourcé et audité' : '2. CRA & Revenu Québec Statutory Citations'}
            description={
              isFr
                ? 'Chaque tranche, seuil et crédit renvoie directement au formulaire officiel.'
                : 'Every rate, threshold, and deduction links directly to official tax schedule lines.'
            }
          />
          <div className="bg-[#070b12] rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  {isFr ? 'Traçabilité complète des formules' : 'Audited Explanation Traces'}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {isFr
                    ? 'Cliquez sur n’importe quelle ligne du relevé de calcul pour voir la formule exacte et le lien vers le calendrier officiel de l’ARC (ex. Annexe 1 fédérale, formulaire ON428, etc.).'
                    : 'Click any line in the calculation breakdown to reveal its exact math formula and verified source URL (e.g. Federal Schedule 1, Form ON428, TP-1.D-V).'}
                </p>
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Règles 2026 indexées: ' : 'Up-to-date 2026 inflation brackets: '}
                  </span>
                  <span>{isFr ? 'Indexation de 2,0% confirmée par l’ARC.' : '2.0% official CRA indexation factor included.'}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Cotisations RPC2 / RRQ2: ' : 'Enhanced CPP2 / QPP2 limits: '}
                  </span>
                  <span>{isFr ? 'Plafonds de gains ouvrant droit à pension respectés.' : 'Fully models the secondary earnings ceiling.'}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 3 */}
        <Onboarding.Step step={3} className="space-y-4">
          <Onboarding.Header
            title={isFr ? '3. Clarté sur l’utilisation des fonds publics' : '3. Public Accounts Spending Allocation'}
            description={
              isFr
                ? 'Découvrez exactement comment vos impôts financent les services publics.'
                : 'Connect your personal taxes directly to verified federal expenditure.'
            }
          />
          <div className="bg-[#070b12] rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
                <PieChart className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  {isFr ? 'Comptes publics du Canada vérifiés' : 'Public Accounts of Canada Breakdown'}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {isFr
                    ? 'Plutôt qu’un simple montant net, visualisez la répartition proportionnelle de votre impôt fédéral dans la santé, les aînés (SV), la défense et les infrastructures.'
                    : 'Rather than a vague deduction total, see your federal tax dollars mapped directly into major government budget categories based on the Public Accounts of Canada.'}
                </p>
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Transferts en santé et programmes sociaux (TCS/TCPS) : ' : 'Health & social transfers (CHT/CST): '}
                  </span>
                  <span>
                    {isFr
                      ? `${spendingShare('health_social_transfers', true)} des dépenses fédérales.`
                      : `${spendingShare('health_social_transfers', false)} of federal spending.`}
                  </span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {isFr ? 'Prestations aux aînés (SV et SRG) : ' : 'Elderly benefits (OAS & GIS): '}
                  </span>
                  <span>
                    {isFr
                      ? `${spendingShare('elderly_benefits', true)} des dépenses fédérales.`
                      : `${spendingShare('elderly_benefits', false)} of federal spending.`}
                  </span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        <div className="pt-4 border-t border-slate-800">
          <Onboarding.Navigation />
        </div>
      </Onboarding>
    </section>
  );
}
