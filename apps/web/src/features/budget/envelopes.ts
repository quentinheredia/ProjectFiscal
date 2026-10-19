export type EnvelopeGroup = 'statutory' | 'discretionary';

export interface BudgetEnvelope {
  id: string;
  nameEn: string;
  nameFr: string;
  group: EnvelopeGroup;
  /** Billions of dollars. */
  baselineBillion: number;
  minBillion: number;
  maxBillion: number;
  descEn: string;
  descFr: string;
}

/** Smallest change a slider or a nudge button makes, in billions. */
export const ENVELOPE_STEP_BILLION = 0.5;

/** About 20.5 million Canadians file an individual income tax return. */
export const TAX_FILERS = 20_500_000;

// A ~$585.6 billion federal budget model: $297.0B statutory, $288.6B discretionary.
export const BUDGET_ENVELOPES: readonly BudgetEnvelope[] = [
  {
    id: 'elderly_benefits',
    nameEn: 'Elderly Benefits (OAS & GIS)',
    nameFr: 'Prestations aux aînés (SV et SRG)',
    group: 'statutory',
    baselineBillion: 102.5,
    minBillion: 85.0,
    maxBillion: 130.0,
    descEn: 'Old Age Security and Guaranteed Income Supplement for 7.3M Canadian seniors.',
    descFr: 'Sécurité de la vieillesse et Supplément de revenu garanti pour 7,3 millions d’aînés.',
  },
  {
    id: 'health_social_transfers',
    nameEn: 'Health & Social Transfers (CHT & CST)',
    nameFr: 'Transferts provinciaux santé et social (TCS / TCPS)',
    group: 'statutory',
    baselineBillion: 94.9,
    minBillion: 75.0,
    maxBillion: 125.0,
    descEn: 'Statutory transfers to provincial governments funding public healthcare and higher education.',
    descFr: 'Transferts constitutionnels aux provinces finançant les hôpitaux et l’éducation supérieure.',
  },
  {
    id: 'public_debt_charges',
    nameEn: 'Public Debt Charges (Bond Interest)',
    nameFr: 'Frais de la dette publique (Intérêts)',
    group: 'statutory',
    baselineBillion: 69.1,
    minBillion: 55.0,
    maxBillion: 95.0,
    descEn: 'Mandatory interest payments servicing federal debt obligations (governed by market interest rates).',
    descFr: 'Paiement obligatoire des intérêts sur la dette souveraine (dépendant des taux de la Banque du Canada).',
  },
  {
    id: 'fiscal_arrangements',
    nameEn: 'Equalization & Territorial Financing',
    nameFr: 'Péréquation et formules territoriales',
    group: 'statutory',
    baselineBillion: 30.5,
    minBillion: 25.0,
    maxBillion: 40.0,
    descEn: 'Constitutional equalization payments ensuring reasonably comparable public services across provinces.',
    descFr: 'Transferts constitutionnels de péréquation garantissant des services publics équivalents entre provinces.',
  },
  {
    id: 'national_defence',
    nameEn: 'National Defence & CAF Modernization',
    nameFr: 'Défense nationale et modernisation des FAC',
    group: 'discretionary',
    baselineBillion: 44.5,
    minBillion: 25.0,
    maxBillion: 75.0,
    descEn: 'Canadian Armed Forces, NORAD modernization, NATO readiness, and search & rescue operations.',
    descFr: 'Forces armées canadiennes, modernisation du NORAD, engagements de l’OTAN et souveraineté arctique.',
  },
  {
    id: 'indigenous_services',
    nameEn: 'Indigenous Services & Reconciliation',
    nameFr: 'Services aux Autochtones et Réconciliation',
    group: 'discretionary',
    baselineBillion: 41.6,
    minBillion: 25.0,
    maxBillion: 65.0,
    descEn: 'Clean drinking water infrastructure, First Nations schooling, healthcare facilities, and child welfare agreements.',
    descFr: 'Eau potable, écoles des Premières Nations, dispensaires et accords sur la protection de l’enfance.',
  },
  {
    id: 'children_family',
    nameEn: 'Canada Child Benefit (CCB) & Families',
    nameFr: 'Allocation canadienne pour enfants (ACE)',
    group: 'discretionary',
    baselineBillion: 39.3,
    minBillion: 20.0,
    maxBillion: 55.0,
    descEn: 'Monthly tax-free assistance to lift children out of poverty and subsidized $10/day early learning centers.',
    descFr: 'Soutien mensuel non imposable et subventions pour les garderies éducatives à 10 $/jour.',
  },
  {
    id: 'employment_insurance',
    nameEn: 'Employment Insurance & Skills Training',
    nameFr: 'Assurance-emploi et formation des compétences',
    group: 'discretionary',
    baselineBillion: 34.0,
    minBillion: 20.0,
    maxBillion: 50.0,
    descEn: 'Income stabilization during economic transitions, parental leave, and vocational apprenticeship grants.',
    descFr: 'Soutien du revenu lors des arrêts d’activité, congés parentaux et subventions aux apprentis.',
  },
  {
    id: 'infrastructure_green',
    nameEn: 'National Infrastructure & Transit',
    nameFr: 'Infrastructures nationales et transport en commun',
    group: 'discretionary',
    baselineBillion: 31.6,
    minBillion: 15.0,
    maxBillion: 55.0,
    descEn: 'Federal investments in subway transit lines, interprovincial bridges, ports, and renewable energy grids.',
    descFr: 'Lignes de métro, ponts interprovinciaux, ports maritimes et réseaux électriques renouvelables.',
  },
  {
    id: 'public_safety_justice',
    nameEn: 'Public Safety, RCMP & Border Security',
    nameFr: 'Sécurité publique, GRC et frontières (ASFC)',
    group: 'discretionary',
    baselineBillion: 24.6,
    minBillion: 15.0,
    maxBillion: 40.0,
    descEn: 'Federal law enforcement, CBSA border checkpoints, federal correctional institutions, and cybersecurity.',
    descFr: 'Police fédérale, douanes et surveillance des frontières, établissements correctionnels et cybersécurité.',
  },
  {
    id: 'economic_innovation',
    nameEn: 'Innovation, Science & Regional Agencies',
    nameFr: 'Innovation, Science et agences régionales',
    group: 'discretionary',
    baselineBillion: 22.3,
    minBillion: 10.0,
    maxBillion: 45.0,
    descEn: 'University research councils, artificial intelligence superclusters, and regional economic development grants.',
    descFr: 'Conseils de recherche universitaires, supergrappes d’intelligence artificielle et développement économique régional.',
  },
  {
    id: 'general_operations',
    nameEn: 'CRA, Global Affairs & Federal Operations',
    nameFr: 'ARC, Affaires mondiales et services publics',
    group: 'discretionary',
    baselineBillion: 50.7,
    minBillion: 35.0,
    maxBillion: 70.0,
    descEn: 'CRA revenue processing, consular services worldwide, Statistics Canada, and Parliament of Canada operations.',
    descFr: 'Administration de l’ARC, réseau diplomatique mondial, Statistique Canada et institutions parlementaires.',
  },
];

export function envelopesIn(group: EnvelopeGroup): BudgetEnvelope[] {
  return BUDGET_ENVELOPES.filter((envelope) => envelope.group === group);
}

export function baselineAllocations(): Record<string, number> {
  return Object.fromEntries(BUDGET_ENVELOPES.map((envelope) => [envelope.id, envelope.baselineBillion]));
}
