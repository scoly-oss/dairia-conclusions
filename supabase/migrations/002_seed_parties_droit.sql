-- Seed: Bibliothèque de parties en droit DAIRIA

insert into public.parties_droit (theme, sous_theme, titre, contenu, articles_loi, jurisprudences) values

('licenciement', 'faute_grave', 'Licenciement pour faute grave — Principes généraux',
'La faute grave est celle qui résulte d''un fait ou d''un ensemble de faits imputables au salarié qui constituent une violation des obligations découlant du contrat de travail ou des relations de travail d''une importance telle qu''elle rend impossible le maintien du salarié dans l''entreprise pendant la durée du préavis.

EN DROIT,

Aux termes de l''article L. 1234-1 du Code du travail, le salarié dont le licenciement est notifié pour faute grave n''a pas droit à l''indemnité de licenciement ni à l''indemnité compensatrice de préavis.

Il est de jurisprudence constante que la faute grave prive le salarié de tout droit à indemnité (Cass. soc., 27 septembre 2007, n°06-43.867).

La charge de la preuve de la faute grave incombe à l''employeur (Cass. soc., 9 octobre 2001, n°99-42.765). Toutefois, dès lors que l''employeur rapporte cette preuve, le salarié ne peut prétendre à aucune indemnité de rupture.

La Cour de cassation a précisé que constitue une faute grave tout comportement rendant impossible le maintien du salarié dans l''entreprise (Cass. soc., 26 février 2013, n°11-27.580).',
ARRAY['L. 1234-1', 'L. 1234-9', 'L. 1237-19'],
ARRAY['Cass. soc., 27 septembre 2007, n°06-43.867', 'Cass. soc., 9 octobre 2001, n°99-42.765', 'Cass. soc., 26 février 2013, n°11-27.580']),

('licenciement', 'cause_reelle_serieuse', 'Cause réelle et sérieuse — Charge de la preuve',
'EN DROIT,

Aux termes de l''article L. 1232-1 du Code du travail, tout licenciement pour motif personnel doit être justifié par une cause réelle et sérieuse.

La cause est réelle lorsqu''elle présente un caractère d''objectivité. La cause est sérieuse lorsqu''elle est suffisamment grave pour justifier la rupture du contrat de travail.

Selon l''article L. 1235-1 du Code du travail, en cas de litige, le juge à qui il appartient d''apprécier la régularité de la procédure et le caractère réel et sérieux des motifs invoqués par l''employeur forme sa conviction au vu des éléments fournis par les parties.

La Cour de cassation a réaffirmé que la charge de la preuve de la cause réelle et sérieuse n''appartient à aucune des parties et que le doute doit profiter au salarié uniquement en cas d''incertitude persistante (Cass. soc., 23 novembre 2022, n°21-13.059).

Toutefois, l''employeur doit produire les éléments objectifs et vérifiables étayant le motif invoqué dans la lettre de licenciement, qui fixe les limites du litige (Cass. soc., 7 mars 2017, n°15-16.982).',
ARRAY['L. 1232-1', 'L. 1235-1', 'L. 1235-2'],
ARRAY['Cass. soc., 23 novembre 2022, n°21-13.059', 'Cass. soc., 7 mars 2017, n°15-16.982']),

('licenciement', 'insuffisance_professionnelle', 'Insuffisance professionnelle',
'EN DROIT,

L''insuffisance professionnelle constitue une cause réelle et sérieuse de licenciement dès lors qu''elle repose sur des faits objectifs, précis et vérifiables (Cass. soc., 22 octobre 2014, n°13-18.862).

La Cour de cassation rappelle régulièrement que l''insuffisance professionnelle se distingue de la faute en ce qu''elle n''implique pas de volonté de nuire du salarié. Elle peut néanmoins constituer une cause réelle et sérieuse de licenciement lorsqu''elle est établie par des faits concrets.

L''employeur doit notamment démontrer :
- L''inadaptation du salarié au poste occupé malgré les formations dispensées
- L''impact sur le bon fonctionnement de l''entreprise
- Le caractère persistant des insuffisances malgré les mises en garde

(Cass. soc., 3 mai 2001, n°99-40.024 ; Cass. soc., 16 mars 2016, n°14-23.838)',
ARRAY['L. 1232-1', 'L. 1235-1'],
ARRAY['Cass. soc., 22 octobre 2014, n°13-18.862', 'Cass. soc., 3 mai 2001, n°99-40.024', 'Cass. soc., 16 mars 2016, n°14-23.838']),

('heures_supplementaires', null, 'Heures supplémentaires — Charge de la preuve',
'EN DROIT,

Aux termes de l''article L. 3171-4 du Code du travail, en cas de litige relatif à l''existence ou au nombre d''heures de travail accomplies, l''employeur fournit au juge les éléments de nature à justifier les horaires effectivement réalisés par le salarié.

La Cour de cassation a précisé le régime de la preuve des heures supplémentaires : il appartient au salarié d''étayer sa demande par la production d''éléments suffisamment précis quant aux horaires effectivement réalisés pour permettre à l''employeur de répondre en fournissant ses propres éléments (Cass. soc., 18 mars 2020, n°18-10.919).

Cette preuve ne saurait résulter de simples allégations ou d''un tableau récapitulatif établi unilatéralement par le salarié, sans autre élément de corroboration (Cass. soc., 24 novembre 2010, n°09-40.928).

L''employeur qui a mis en place un système de contrôle des horaires peut opposer les enregistrements au salarié (Cass. soc., 4 décembre 2013, n°12-22.344).',
ARRAY['L. 3171-4', 'L. 3121-28', 'L. 3121-36'],
ARRAY['Cass. soc., 18 mars 2020, n°18-10.919', 'Cass. soc., 24 novembre 2010, n°09-40.928', 'Cass. soc., 4 décembre 2013, n°12-22.344']),

('harcelement', 'moral', 'Harcèlement moral — Définition et charge de la preuve',
'EN DROIT,

Aux termes de l''article L. 1152-1 du Code du travail, aucun salarié ne doit subir les agissements répétés de harcèlement moral qui ont pour objet ou pour effet une dégradation de ses conditions de travail susceptible de porter atteinte à ses droits et à sa dignité, d''altérer sa santé physique ou mentale ou de compromettre son avenir professionnel.

La Cour de cassation a précisé le régime probatoire applicable : le salarié doit présenter des faits permettant de présumer l''existence d''un harcèlement ; il incombe alors à l''employeur de prouver que ces agissements ne sont pas constitutifs de harcèlement et que sa décision est justifiée par des éléments objectifs étrangers à tout harcèlement (Cass. soc., 8 juin 2016, n°14-13.418).

Les actes de gestion de l''employeur (remarques sur le travail, recadrage, réorganisation du service) ne sauraient constituer des agissements de harcèlement moral dès lors qu''ils sont justifiés par des éléments objectifs (Cass. soc., 15 novembre 2011, n°10-10.687).',
ARRAY['L. 1152-1', 'L. 1152-2', 'L. 1154-1'],
ARRAY['Cass. soc., 8 juin 2016, n°14-13.418', 'Cass. soc., 15 novembre 2011, n°10-10.687']),

('article_700', null, 'Article 700 CPC — Demande reconventionnelle',
'EN DROIT,

Aux termes de l''article 700 du Code de procédure civile, le juge condamne la partie tenue aux dépens ou qui perd le procès à payer à l''autre partie la somme qu''il détermine, au titre des frais exposés et non compris dans les dépens.

Dans le cadre de la présente instance, compte tenu du caractère infondé des demandes formulées par le salarié et des frais engagés par la société pour assurer sa défense, il apparaît équitable de condamner M./Mme [NOM] à payer à la société [NOM SOCIÉTÉ] la somme de 3.000 euros au titre de l''article 700 du Code de procédure civile.

PAR CES MOTIFS, la société [NOM SOCIÉTÉ] sollicite la condamnation de M./Mme [NOM] à lui payer la somme de 3.000 euros au titre de l''article 700 du Code de procédure civile.',
ARRAY['Article 700 CPC'],
ARRAY[]),

('execution_provisoire', null, 'Exécution provisoire — Opposition',
'EN DROIT,

Aux termes des articles 514 et suivants du Code de procédure civile, l''exécution provisoire est de droit pour les décisions de première instance, sauf dans les cas prévus par la loi.

Toutefois, l''article R. 1454-28 du Code du travail prévoit que les jugements du Conseil de prud''hommes sont exécutoires de droit à titre provisoire lorsqu''ils ordonnent le paiement de sommes au titre des rémunérations et indemnités visées à l''article R. 1454-14.

Dans la mesure où les demandes du salarié sont contestées et que l''exécution provisoire serait susceptible d''entraîner des conséquences manifestement excessives, la société sollicite qu''il soit fait application de l''article 514-1 du Code de procédure civile.',
ARRAY['Article 514 CPC', 'Article 514-1 CPC', 'R. 1454-28 Code du travail'],
ARRAY[]),

('forfait_jours', null, 'Forfait jours — Validité et suivi effectif',
'EN DROIT,

La convention de forfait en jours sur l''année est soumise aux dispositions de l''article L. 3121-63 du Code du travail, qui requiert qu''un accord collectif d''entreprise ou de branche détermine les modalités de contrôle de la charge de travail et des temps de repos du salarié.

La Cour de cassation exige que l''employeur s''assure régulièrement que la charge de travail du salarié est raisonnable et permet une bonne répartition dans le temps (Cass. soc., 29 juin 2011, n°09-71.107).

Pour que la convention de forfait soit valide, l''employeur doit démontrer :
1. L''existence d''un accord collectif prévoyant le forfait
2. La signature d''une convention individuelle de forfait
3. La mise en place d''un suivi effectif de la charge de travail

(Cass. soc., 2 juillet 2014, n°13-11.680)',
ARRAY['L. 3121-63', 'L. 3121-64', 'L. 3121-65'],
ARRAY['Cass. soc., 29 juin 2011, n°09-71.107', 'Cass. soc., 2 juillet 2014, n°13-11.680']),

('prise_acte', null, 'Prise d''acte — Conditions et effets',
'EN DROIT,

La prise d''acte de la rupture du contrat de travail est un mode de rupture unilatéral par lequel le salarié prend acte de la rupture en raison de manquements qu''il impute à son employeur. Elle produit les effets d''un licenciement sans cause réelle et sérieuse si les manquements invoqués sont établis et suffisamment graves, ou d''une démission dans le cas contraire (Cass. soc., 25 juin 2003, n°01-42.679).

Il appartient au salarié de rapporter la preuve des manquements invoqués et de leur gravité (Cass. soc., 19 décembre 2007, n°06-43.918).

La Cour de cassation a précisé que seuls des manquements suffisamment graves rendant impossible la poursuite du contrat de travail peuvent justifier une prise d''acte produisant les effets d''un licenciement sans cause réelle et sérieuse (Cass. soc., 26 mars 2014, n°12-23.634).',
ARRAY['L. 1237-1', 'L. 1232-1'],
ARRAY['Cass. soc., 25 juin 2003, n°01-42.679', 'Cass. soc., 19 décembre 2007, n°06-43.918', 'Cass. soc., 26 mars 2014, n°12-23.634']),

('travail_dissimule', null, 'Travail dissimulé — Contestation',
'EN DROIT,

Aux termes de l''article L. 8221-5 du Code du travail, est réputé travail dissimulé par dissimulation d''emploi salarié le fait pour tout employeur de se soustraire intentionnellement à l''accomplissement de la formalité prévue à l''article L. 1221-10, relatif à la déclaration préalable à l''embauche, ou de se soustraire intentionnellement aux déclarations relatives aux salaires ou aux cotisations sociales assises sur ceux-ci.

L''élément intentionnel est un élément constitutif de l''infraction. La Cour de cassation exige que le caractère intentionnel soit établi par le salarié (Cass. soc., 12 juin 2007, n°05-44.367).

L''indemnité forfaitaire prévue par l''article L. 8223-1 du Code du travail est d''ordre public mais ne saurait être accordée en l''absence de preuve du caractère intentionnel de la dissimulation.',
ARRAY['L. 8221-5', 'L. 8223-1', 'L. 1221-10'],
ARRAY['Cass. soc., 12 juin 2007, n°05-44.367']),

('discrimination', null, 'Discrimination — Charge de la preuve',
'EN DROIT,

Aux termes de l''article L. 1134-1 du Code du travail, en matière de discrimination, le salarié présente des éléments de fait laissant supposer l''existence d''une discrimination directe ou indirecte. Au vu de ces éléments, il incombe à la partie défenderesse de prouver que sa décision est justifiée par des éléments objectifs étrangers à toute discrimination.

La charge de la preuve obéit à un mécanisme particulier de présomption (Cass. soc., 23 novembre 2005, n°03-40.826).

L''employeur peut s''exonérer en démontrant que les différences de traitement reposent sur des critères objectifs et pertinents, sans lien avec le critère discriminatoire allégué (Cass. soc., 10 novembre 2009, n°07-42.849).',
ARRAY['L. 1132-1', 'L. 1134-1', 'L. 1134-4'],
ARRAY['Cass. soc., 23 novembre 2005, n°03-40.826', 'Cass. soc., 10 novembre 2009, n°07-42.849']),

('inaptitude', null, 'Inaptitude — Obligation de reclassement',
'EN DROIT,

Aux termes de l''article L. 1226-2 du Code du travail, lorsque le salarié victime d''une maladie ou d''un accident non professionnel est déclaré inapte par le médecin du travail, l''employeur lui propose un autre emploi approprié à ses capacités, au sein de l''entreprise ou des entreprises du groupe auquel elle appartient le cas échéant.

L''employeur peut être dispensé de son obligation de reclassement lorsque l''avis d''inaptitude mentionne expressément que tout maintien du salarié dans un emploi serait gravement préjudiciable à sa santé ou que l''état de santé du salarié fait obstacle à tout reclassement dans un emploi (article L. 1226-2-1 du Code du travail).

La Cour de cassation a précisé que l''employeur doit justifier de l''impossibilité de reclassement par des éléments objectifs (Cass. soc., 4 octobre 2011, n°10-15.864).',
ARRAY['L. 1226-2', 'L. 1226-2-1', 'L. 1226-4'],
ARRAY['Cass. soc., 4 octobre 2011, n°10-15.864']);
