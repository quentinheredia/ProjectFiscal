-- Seed Public Accounts Spending Categories
INSERT INTO public.spending (fiscal_year, category_id, category_en, category_fr, percentage, source_document) VALUES
('2024-25', 'elderly_benefits', 'Elderly Benefits (OAS & GIS)', 'Prestations pour personnes âgées (SV et SRG)', 17.50, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'health_social_transfers', 'Health & Social Transfers to Provinces (CHT/CST)', 'Transferts provinciaux de santé et services sociaux (TCS/TCS)', 16.20, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'public_debt_charges', 'Public Debt Charges (Interest on Debt)', 'Frais de la dette publique (Intérêts)', 11.80, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'national_defence', 'National Defence & Veterans Affairs', 'Défense nationale et Anciens Combattants', 7.60, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'indigenous_services', 'Indigenous Services & Reconciliation', 'Services aux Autochtones et Réconciliation', 7.10, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'children_family', 'Children & Family Benefits (Canada Child Benefit)', 'Prestations pour enfants et familles (Allocation canadienne)', 6.70, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'employment_insurance', 'Employment Insurance (EI Support)', 'Assurance-emploi (Soutien AE)', 5.80, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'infrastructure_green', 'Infrastructure & Environment', 'Infrastructures et Environnement', 5.40, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'public_safety_justice', 'Public Safety, RCMP & Justice', 'Sécurité publique, GRC et Justice', 4.20, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'economic_innovation', 'Economic Development & Innovation', 'Développement économique et Innovation', 3.80, 'Public Accounts of Canada, Vol. 1, Section 1'),
('2024-25', 'general_operations', 'General Government & Other Operations', 'Fonctionnement général de l’État et divers', 13.90, 'Public Accounts of Canada, Vol. 1, Section 1')
ON CONFLICT DO NOTHING;
