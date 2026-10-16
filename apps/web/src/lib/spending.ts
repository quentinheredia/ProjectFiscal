export interface SpendingCategory {
  id: string;
  nameEn: string;
  nameFr: string;
  percentage: number; // Share of federal spending
  descriptionEn: string;
  descriptionFr: string;
  color: string;
}

export const FEDERAL_SPENDING_CATEGORIES: SpendingCategory[] = [
  {
    id: 'elderly_benefits',
    nameEn: 'Elderly Benefits (OAS & GIS)',
    nameFr: 'Prestations pour personnes âgées (SV et SRG)',
    percentage: 17.5,
    descriptionEn: 'Old Age Security and Guaranteed Income Supplement for Canadian seniors.',
    descriptionFr: 'Sécurité de la vieillesse et Supplément de revenu garanti pour les aînés canadiens.',
    color: '#1b7a43', // Brand dark green
  },
  {
    id: 'health_social_transfers',
    nameEn: 'Health & Social Transfers to Provinces (CHT/CST)',
    nameFr: 'Transferts provinciaux de santé et services sociaux (TCS/TCS)',
    percentage: 16.2,
    descriptionEn: 'Major transfers to provincial governments funding public hospitals, doctors, and education.',
    descriptionFr: 'Transferts majeurs aux gouvernements provinciaux pour les hôpitaux, médecins et éducation.',
    color: '#1d4ed8', // Brand blue
  },
  {
    id: 'public_debt_charges',
    nameEn: 'Public Debt Charges (Interest on Debt)',
    nameFr: 'Frais de la dette publique (Intérêts)',
    percentage: 11.8,
    descriptionEn: 'Interest charges to service the federal government outstanding public debt.',
    descriptionFr: 'Service des intérêts sur les obligations et la dette publique du Canada.',
    color: '#dc2626', // Red
  },
  {
    id: 'national_defence',
    nameEn: 'National Defence & Veterans Affairs',
    nameFr: 'Défense nationale et Anciens Combattants',
    percentage: 7.6,
    descriptionEn: 'Canadian Armed Forces operations, equipment, search & rescue, and veterans pensions.',
    descriptionFr: 'Opérations des Forces armées canadiennes, équipement et soutien aux vétérans.',
    color: '#475569', // Slate
  },
  {
    id: 'indigenous_services',
    nameEn: 'Indigenous Services & Reconciliation',
    nameFr: 'Services aux Autochtones et Réconciliation',
    percentage: 7.1,
    descriptionEn: 'Health, education, water infrastructure, and community services in First Nations communities.',
    descriptionFr: 'Santé, éducation, infrastructures d’eau potable et services communautaires autochtones.',
    color: '#d97706', // Amber
  },
  {
    id: 'children_family',
    nameEn: 'Children & Family Benefits (Canada Child Benefit)',
    nameFr: 'Prestations pour enfants et familles (Allocation canadienne)',
    percentage: 6.7,
    descriptionEn: 'Tax-free monthly support to help eligible families with the cost of raising children.',
    descriptionFr: 'Allocation mensuelle non imposable pour soutenir les familles avec enfants.',
    color: '#059669', // Emerald
  },
  {
    id: 'employment_insurance',
    nameEn: 'Employment Insurance (EI Support)',
    nameFr: 'Assurance-emploi (Soutien AE)',
    percentage: 5.8,
    descriptionEn: 'Income support for temporary job losses, sickness, and parental leaves.',
    descriptionFr: 'Soutien du revenu lors de pertes d’emploi, maladie et congés parentaux.',
    color: '#2563eb', // Blue
  },
  {
    id: 'infrastructure_green',
    nameEn: 'Infrastructure & Environment',
    nameFr: 'Infrastructures et Environnement',
    percentage: 5.4,
    descriptionEn: 'Transit, municipal wastewater, green technology, clean energy, and parks conservation.',
    descriptionFr: 'Transports collectifs, parcs nationaux, transition énergétique et infrastructures.',
    color: '#0891b2', // Cyan
  },
  {
    id: 'public_safety_justice',
    nameEn: 'Public Safety, RCMP & Justice',
    nameFr: 'Sécurité publique, GRC et Justice',
    percentage: 4.2,
    descriptionEn: 'Federal policing, border security (CBSA), corrections, and federal court systems.',
    descriptionFr: 'Police fédérale (GRC), douanes (ASFC), services correctionnels et tribunaux fédéraux.',
    color: '#6366f1', // Indigo
  },
  {
    id: 'economic_innovation',
    nameEn: 'Economic Development & Innovation',
    nameFr: 'Développement économique et Innovation',
    percentage: 3.8,
    descriptionEn: 'Scientific research, regional development agencies, and business innovation grants.',
    descriptionFr: 'Recherche scientifique, agences de développement régional et innovation technologique.',
    color: '#8b5cf6', // Violet
  },
  {
    id: 'general_operations',
    nameEn: 'General Government & Other Operations',
    nameFr: 'Fonctionnement général de l’État et divers',
    percentage: 13.9,
    descriptionEn: 'Foreign affairs, CRA revenue administration, Statistics Canada, and parliamentary operations.',
    descriptionFr: 'Affaires mondiales, administration fiscale de l’ARC, Statistique Canada et Parlement.',
    color: '#64748b', // Slate
  },
];
