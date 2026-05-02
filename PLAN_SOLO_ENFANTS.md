# PLAN D'IMPLÉMENTATION — Solo & Enfants

> **Date** : 2026-04-30
> **Auteur** : Claude pour DKDP / MKR Caucasian Camp
> **Statut** : 🟢 VALIDÉ — décisions arbitrées (voir §17). Prêt à kickoff Phase 1.
> **Effort estimé** : 6-7 semaines pour version complète · 1 semaine pour MVP positioning

---

## 0 — Résumé exécutif

Ce plan étend l'offre MKR à 2 nouveaux publics :

1. **🧍 Athlètes solo** — option "venir seul" (positionnement rassurant) + camp privé sur mesure (1-on-1 ou très petit groupe, hors dates fixes)
2. **👨‍👧 Familles & jeunesse** — parent + enfant, ado 16-17, et potentiellement enfant seul

**Impact technique** :
- 4 nouvelles pages : `/camp-prive`, `/familles`, `/programme/jeunesse`, `/tarifs` (optionnel)
- Sections additionnelles sur 8 pages existantes
- Refactor `InscriptionLayout` en parcours adaptatif (4 publics)
- Nav, Footer, mobile menu : 3 nouveaux liens minimum
- 8-10 nouvelles images Nanobanana
- 6 nouveaux composants
- Extension du type `Session` + nouveau `data/pricing.ts` + `data/audiences.ts`

---

## 1 — Vision produit

### 1.1 "Partir en solo" — 2 interprétations

| Interprétation | Description | Coût/Effort | Bénéfice |
|---|---|---|---|
| **A. Marketing** | Le camp officiel accueille les athlètes seuls. Pitch rassurant "tu n'as pas besoin de connaître quelqu'un, on devient une famille" | 1-2 jours | Convertit les hésitants. Quick win conversion |
| **B. Produit camp privé** | Camp privé hors dates fixes, sur mesure (1-on-1 ou 2-3 athlètes). Tarif premium | 2-3 semaines | Nouveau revenu premium, comble les périodes hors session officielle |

**Recommandation** : faire les deux, **A** d'abord (Phase 1 MVP), **B** en Phase 3.

### 1.2 "Inscrire des enfants" — 3 cas d'usage

| Cas | Public | Risque juridique | Priorité |
|---|---|---|---|
| **C1. Parent + Enfant** | Famille avec enfant 8-15 ans, parent vient aussi | Faible (parent présent, responsable légal) | 🔴 Haute |
| **C2. Ado avec autorisation** | Ado 16-17 ans seul avec autorisation parentale signée | Moyen (mineur seul à l'étranger) | 🟠 Moyenne |
| **C3. Enfant seul encadré** | 12-15 ans confié à MKR, parents pas sur place | Élevé (transport, santé, urgence, accompagnateur dédié) | 🟡 Basse (V2) |

**Recommandation** : commencer par C1 + C2, ajouter C3 après validation business.

### 1.3 Personas cibles élargis (matrice)

| Persona | Âge | Tarif estimé | Parcours d'inscription | Page d'entrée |
|---|---|---|---|---|
| Solo Adult | 18+ | 2900 CHF | `/inscription` standard | `/sessions` |
| **Solo Premium** (privé) | 18+ | 4500-15 000 CHF | `/camp-prive/devis` | `/camp-prive` |
| **Famille (parent + N enfants)** | adulte + 8-15 ans | 4500-7000 CHF | `/inscription` famille | `/familles` |
| **Junior accompagné** | 16-17 ans avec parent | 2700 CHF | `/inscription` junior | `/programme/jeunesse` |
| **Enfant seul (V2)** | 12-15 ans | 3500 CHF | `/inscription` enfant-seul | `/programme/jeunesse` |

---

## 2 — Nouvelles pages à créer

### 2.1 `/camp-prive` — Camp privé sur mesure

**URL canonique** : https://mkrcamp.com/camp-prive
**Métadonnées** :
- Title: `Camp privé sur mesure | MKR | Coaching 1-on-1 au Daghestan`
- Description: `Programme personnalisé au Daghestan. Coaching 1-on-1 ou petit groupe. Tes dates, ton focus, ton niveau. Tarif premium, places limitées.`

**Sections (ordre)** :
1. `<PageHero>` label="CAMP PRIVÉ" / title=`LE CAMP PRIVÉ.<br/>TES DATES, TON FOCUS.` / subtitle=`Coaching 1-on-1 ou très petit groupe au Daghestan. Sur mesure du début à la fin.`
2. `<CinematicReveal>` title=`L'EXCELLENCE PERSONNALISÉE` / image=`/images/action/private-coaching.webp`
3. **POURQUOI UN CAMP PRIVÉ** (split + 3 cards) — Focus laser, Dates flexibles, Coaching dédié
4. **CE QUI EST INCLUS** (`include-grid` × 8 items) — Coaching 1-on-1, Hébergement premium, 3 repas/jour incluses, Vol intérieur Istanbul→Makhachkala, Transferts privés, Sessions sur mesure, 1 jour récup, Debrief vidéo
5. **PROFILS RECOMMANDÉS** (grid-3) — Pro/semi-pro en prep compétition · Athlète au planning serré · Coach venu se former
6. **TARIFS** (`<PricingTable />`)
7. **PROCESSUS** (4 steps timeline) — Formulaire → Call de qualification → Devis personnalisé → Réservation
8. **FAQ camp privé** (`<FAQAccordion>` × 5 Q/R spécifiques)
9. `<SectionCTA>` primary="DEMANDER UN DEVIS PRIVÉ" → `/camp-prive/devis` · ghost="QUESTION ?" → `/contact`

**Nouveau form** : `<DevisPriveForm />` (à `/camp-prive/devis` ou modal sur `/camp-prive`)
- Champs : prénom, nom, email, téléphone, sport principal, niveau (sélecteur), objectif (textarea), durée souhaitée (1/2/3/4 sem), dates préférées (range picker), format (solo/duo/trio), budget indicatif, message libre

---

### 2.2 `/familles` — Camp Famille

**URL canonique** : https://mkrcamp.com/familles
**Métadonnées** :
- Title: `Camp Famille | MKR Caucasian Camp | MMA & Lutte parent-enfant`
- Description: `Viens t'entraîner en famille au Daghestan. Parent et enfant côte à côte. Programme adapté aux 8-15 ans, hébergement famille, tarif famille.`

**Sections** :
1. `<PageHero>` label="EN FAMILLE" / title=`VIENS T'ENTRAÎNER<br/>EN FAMILLE.` / subtitle=`Parent et enfant côte à côte sur le tapis. Une expérience qui se transmet.`
2. `<CinematicReveal>` title=`L'HÉRITAGE SE TRANSMET` / image=`/images/action/family-camp.webp`
3. **POUR QUI** (split balanced) — Familles avec enfant 8-15 ans · Parent pratiquant · Parent débutant initié au camp
4. **PROGRAMME** (2-cols Parent | Enfant) — Parent : sessions Lutte/MMA adultes ; Enfant : sessions Lutte enfants (8-12) ou Junior (13-15) selon âge
5. **`<ParentsReassurance />`** — encadrement enfant (coach jeunesse dédié, ratio 1:5, sécurité, communication parents)
6. **HÉBERGEMENT FAMILLE** (split + photo) — chambres famille, repas communautaires
7. **`<PricingTable />`** filtré "famille" — table avec discount enfant additionnel
8. **TÉMOIGNAGES PARENTS** (3 quotes vidéo si possible)
9. **FAQ FAMILLES** (`<FAQAccordion>` × 7 Q/R)
10. `<SectionCTA>` primary="INSCRIRE MA FAMILLE" → `/inscription?audience=family`

---

### 2.3 `/programme/jeunesse` — Camp Jeunesse 12-17 ans

**URL canonique** : https://mkrcamp.com/programme/jeunesse
**Métadonnées** :
- Title: `Programme Jeunesse | MKR | Camp MMA & Lutte 12-17 ans au Daghestan`
- Description: `Programme jeunesse 12-17 ans au Daghestan. Encadrement spécialisé, sécurité renforcée, autorisation parentale. Forge ton caractère au Caucase.`

**Sections** :
1. `<PageHero>` label="JEUNESSE 12-17" / title=`FORGE TON CARACTÈRE<br/>AU CAUCASE.` / subtitle=`Programme jeunesse 12-17 ans. Encadrement spécialisé, sécurité renforcée.`
2. `<CinematicReveal>` title=`DEVENIR FORT,<br/>DEVENIR SOI.` / image=`/images/action/teen-sparring.webp`
3. **POUR QUEL ADO** (split + 3 cards) — Compétiteur junior · Ado en construction · Futur pro
4. **PROGRAMME ADAPTÉ** (grid-3x2 PILLARS) — Pédagogie progressive, Encadrement renforcé, Pas de KO, Préparation mentale, Groupe de niveau, Accompagnateur dédié
5. **ENCADREMENT 24/7** (split + photo) — Coach jeunesse dédié, accompagnateur francophone, communication parents quotidienne, contact d'urgence
6. **JOURNÉE TYPE ADO** (`<KidsScheduleTimeline />`) — adapté 12-17 (réveil 8h, étude 14h optionnelle, sessions 16h-18h, repos 21h)
7. **AUTORISATION PARENTALE** (steps 4-process) — Formulaire → Document signé → Procuration médicale → Confirmation
8. **TÉMOIGNAGES PARENTS + ADOS** (4 quotes)
9. **FAQ JEUNESSE** (`<FAQAccordion>` × 8 Q/R)
10. `<SectionCTA>` primary="INSCRIRE MON ADO" → `/inscription?audience=junior` · ghost="EN FAMILLE ?" → `/familles`

---

### 2.4 `/tarifs` (optionnel, peut être section enrichie de `/sessions`)

Page tarifaire centralisée avec table multi-public + comparateur. Si on garde modulaire, intégrer dans `/sessions`.

**Recommandation** : pas de page séparée. Composant `<PricingTable />` réutilisé sur `/sessions`, `/camp-prive`, `/familles`, `/programme/jeunesse`.

---

### 2.5 `/inscription` (refactor multi-public, voir §6)

URL inchangée. Le formulaire devient adaptatif via query string `?audience=family|junior|private` ou Step 0 sélecteur.

---

## 3 — Pages existantes à enrichir

### 3.1 Homepage `/`
- **Ajout** : nouveau composant `<AudienceSwitcher />` après `<VideoSection>` — 4 cards (Solo · Famille · Junior · Privé)
- **Hero subtitle** : élargir au pluriel — `Camp d'entraînement MMA et Lutte au Daghestan. Solo, famille, junior ou privé.`
- **`<Sessions>`** : ajouter badge "famille-friendly" sur session existante
- **`<FAQ>`** homepage : ajouter 3 Q/R ("Puis-je venir seul ?", "Inscrire mon enfant ?", "Camp privé ?")

### 3.2 `/le-camp`
- **Nouvelle section** : "VIENS COMME TU ES" (split layout) — solo, en duo, en famille
- **DAILY_SCHEDULE** : ajouter mention "Sessions enfants : 9h00 et 16h00" en plus des Lutte/MMA adultes
- **INCLUDES** : ajouter "Adapté aux familles" (flag)

### 3.3 `/programme`
- **4e card** "Programme jeunesse 12-17" — entre Lutte enfants et MMA, ou en bottom row
- **5e card** "Camp privé sur mesure" (optionnel, ou via header)
- Stats band : passe de "3 disciplines" à "3 disciplines · 4 publics"

### 3.4 `/programme/lutte-enfants` (déjà créée)
- **Ajouter** section "Pour les parents" rassurante (encadrement, sécurité, communication)
- **Ajouter** stats sécurité (ratio coach/enfant, certifications)
- **Ajouter** 3 témoignages parents
- **Ajouter** lien vers `/familles` et `/programme/jeunesse`

### 3.5 `/sessions`
- **Filtres** tabs en haut : "Toutes" · "Solo" · "Famille" · "Junior" · "Privé"
- **Ajouter** colonne "Public" sur la carte session
- Lien camp privé visible : "Tes dates ne correspondent pas ? Découvre le camp privé →"

### 3.6 `/comment-ca-marche`
- **Section début** : "Solo, famille, junior ou privé ?" (4 mini-cards)
- 4 process distincts selon le public (timeline alternée)

### 3.7 `/faq`
- **Nouvelle catégorie** "Familles & Jeunesse" (7 Q/R)
- **Nouvelle catégorie** "Camp privé" (5 Q/R)
- **Nouvelle catégorie** "Solo" (3 Q/R) — peut être sous-section "Logistique"

### 3.8 `/preparer-son-camp`
- **Section spéciale** "Si tu pars avec ton enfant" (split)
- **Section** "Si ton ado part seul" (autorisation parentale, packing list ado)
- **Section** "Camp privé : préparation 1-on-1" (focus tactique avec coach)

### 3.9 `/logistique`
- **Section visa** : ajouter "Visa enfant" (autorisation parentale + documents)
- **Section vol** : ajouter "Réservation famille" (achats groupés)
- **Section spéciale** mineur seul (V2)

### 3.10 `/contact`
- **Ajouter** sujet "Question camp privé"
- **Ajouter** sujet "Inscription famille / jeunesse"

### 3.11 `/cgv`
- **Article 5** Prestations incluses : enrichir avec "Camp privé : prestations sur mesure devis" et "Camp famille : 2 chambres + 2 repas/jour adultes + 3 repas/jour enfants"
- **Nouveau Article** "Mineurs et autorisation parentale"

---

## 4 — Composants nouveaux à créer

| Composant | Rôle | Pages d'usage |
|---|---|---|
| `<AudienceSwitcher />` | Card grid 4 publics | Homepage + `/programme` + `/sessions` |
| `<FamilyForm />` | Form famille (parent + N enfants) | `/inscription?audience=family` |
| `<JuniorForm />` | Form junior 16-17 + autorisation | `/inscription?audience=junior` |
| `<DevisPriveForm />` | Form devis camp privé | `/camp-prive` |
| `<KidsScheduleTimeline />` | Timeline jour type enfant/ado | `/programme/jeunesse`, `/programme/lutte-enfants` |
| `<ParentsReassurance />` | Section sécurité/encadrement enfant | `/familles`, `/programme/jeunesse`, `/programme/lutte-enfants` |
| `<PricingTable />` | Table tarifs multi-public avec filtres | `/sessions`, `/camp-prive`, `/familles`, `/programme/jeunesse` |
| `<AgeRangeFilter />` | Filtre tranche âge sur sessions | `/sessions` |
| `<KidsCoach />` | Card coach jeunesse spécialisé | `/programme/jeunesse`, `/coachs` |

---

## 5 — Data files à enrichir

### 5.1 `data/sessions.ts` — extension du type
```ts
type SessionAudience = 'solo' | 'family' | 'junior' | 'private'

interface Session {
  // ... existing fields
  audiences: SessionAudience[]   // ['solo', 'family', 'junior']
  minAge: number                  // 8 si famille, 12 si junior, 18 sinon
  maxKidsPerFamily?: number       // ex: 3
  privateAvailable?: boolean      // false par défaut
  hasJuniorTrack?: boolean        // si la session inclut un track jeunesse
}
```

### 5.2 Nouveau `data/pricing.ts`
```ts
export const PRICING = {
  solo:           { price: 2900, label: '1 adulte solo' },
  family_1k:      { price: 4500, label: '1 parent + 1 enfant' },
  family_2k:      { price: 6000, label: '1 parent + 2 enfants' },
  family_2p_1k:   { price: 6500, label: '2 parents + 1 enfant' },
  junior_alone:   { price: 2700, label: 'Ado 16-17 seul (avec autorisation)' },
  private_solo_1w:  { price: 4500, label: 'Privé solo · 1 semaine' },
  private_solo_2w:  { price: 7800, label: 'Privé solo · 2 semaines' },
  private_solo_3w:  { price: 11000, label: 'Privé solo · 3 semaines' },
  private_duo_1w:   { price: 7000, label: 'Privé duo · 1 semaine' },
  private_duo_2w:   { price: 12500, label: 'Privé duo · 2 semaines' },
} as const
```

### 5.3 Nouveau `data/audiences.ts`
```ts
export const AUDIENCES = [
  { id: 'solo', label: 'Solo Adulte', age: '18+',
    description: 'Tu pars seul ou en duo amis. Le format historique MKR.',
    icon: SoloIcon, ctaHref: '/inscription' },
  { id: 'family', label: 'Famille', age: 'Parent + 8-15 ans',
    description: 'Parent et enfant ensemble au camp. Programme adapté.',
    icon: FamilyIcon, ctaHref: '/familles' },
  { id: 'junior', label: 'Junior', age: '16-17 ans',
    description: 'Ado avec autorisation parentale. Encadrement spécialisé.',
    icon: JuniorIcon, ctaHref: '/programme/jeunesse' },
  { id: 'private', label: 'Camp privé', age: '18+',
    description: 'Sur mesure. Tes dates, ton focus, 1-on-1 ou petit groupe.',
    icon: PrivateIcon, ctaHref: '/camp-prive' },
]
```

### 5.4 `data/coaches.ts` — coach jeunesse à ajouter
Ajouter au moins 1 coach dédié encadrement enfant/ado pour crédibiliser. Brief : "Ali Suleymanov, Coach Jeunesse, 12 ans, certifié pédagogie sportive jeunesse, francophone."

### 5.5 `data/testimonials.ts` — nouveaux témoignages
- 3 témoignages parents (vu enfant grandir, sécurité, communication)
- 2 témoignages ado (transformation, autonomie, niveau)
- 1 témoignage camp privé (athlète pro, breakthrough technique)

### 5.6 `data/faq.ts` — 2 nouvelles catégories
```ts
{ id: 'familles', label: 'Familles & Jeunesse', items: [...7 Q/R] }
{ id: 'prive', label: 'Camp privé', items: [...5 Q/R] }
```

---

## 6 — Refactor du formulaire d'inscription

### 6.1 Architecture cible

**Avant** : `/inscription` mono-parcours adulte solo
**Après** : `/inscription` multi-parcours via Step 0 ou query string

```
/inscription                    → Step 0 sélecteur
/inscription?audience=family    → bypass Step 0, direct famille
/inscription?audience=junior    → bypass Step 0, direct junior
/camp-prive                     → form séparé (court devis)
```

### 6.2 Nouveau Step 0 — "Public"

```
QUI VEUT VENIR AU CAMP ?

  ○ Moi seul (adulte 18+)                 → Solo standard
  ○ Moi avec ma famille (enfant 8-15 ans) → Famille
  ○ Mon ado seul (16-17 ans)              → Junior
  ○ Camp privé sur mesure                  → Redirige /camp-prive
```

### 6.3 Branches conditionnelles — Steps adaptés

| Public | Steps | Champs additionnels |
|---|---|---|
| **Solo Adulte** | Identité · Expérience · Santé · Logistique · Confirmation | (aucun) |
| **Famille** | Public · Parent · Enfants[] · Santé famille · Logistique · Confirmation | `enfants: { prenom, age, niveau, certifMedical }[]`, `nombreEnfants` |
| **Junior 16-17** | Public · Parent (resp. légal) · Junior · Santé junior · Autorisation · Logistique · Confirmation | `responsableLegalNom`, `responsableLegalEmail`, `responsableLegalPhone`, `autorisationParentaleFile`, `procurationMedicale` |
| **Camp privé** | redirige `/camp-prive` (form court) | `objectif`, `datesSouhaitees`, `format` (solo/duo/trio), `budgetIndicatif` |

### 6.4 Validations adaptées
```ts
// Famille
- enfants.length > 0
- enfants.every(e => 8 <= e.age <= 15)
- parent.age >= 18

// Junior
- junior.age >= 16 && junior.age <= 17
- autorisationParentaleFile present
- responsableLegal email + phone valides

// Privé
- datesSouhaitees au moins +30 jours
- objectif minimum 50 caractères
```

### 6.5 Refactor `InscriptionLayout.tsx`

```ts
type Audience = 'solo' | 'family' | 'junior' | 'private'

const STEPS_BY_AUDIENCE: Record<Audience, string[]> = {
  solo:    ['Identité', 'Expérience', 'Santé', 'Logistique', 'Confirmation'],
  family:  ['Parent', 'Enfants', 'Santé', 'Logistique', 'Confirmation'],
  junior:  ['Parent (responsable)', 'Junior', 'Santé', 'Autorisation', 'Logistique', 'Confirmation'],
  private: [/* redirige */],
}

function InscriptionLayout({ initialAudience }: { initialAudience?: Audience }) {
  const [audience, setAudience] = useState<Audience | null>(initialAudience ?? null)
  const [step, setStep] = useState(0)
  // ...
  if (!audience) return <AudienceSelector onSelect={setAudience} />
  // render steps[audience][step]
}
```

### 6.6 Page `/merci` — variantes
Adapter le message de remerciement selon le public :
- Solo : "Ta candidature est reçue, on t'appelle sous 48h"
- Famille : "Vos candidatures sont reçues. On t'appelle pour valider parent et enfants"
- Junior : "Candidature reçue. On va contacter le responsable légal pour valider l'autorisation"
- Privé : "Demande de devis reçue. On t'appelle sous 24h pour qualifier ton projet"

### 6.7 StoryCard succès
Adapter le bgImage / wording selon audience pour partage Instagram différencié.

---

## 7 — Navigation (Nav + Footer + mobile)

### 7.1 Mega menu desktop (`Nav.tsx`)

**Modifier panel "Programme"** — passer de 3 cards à 4-5 :
- MMA (existant)
- Lutte adultes (existant)
- Lutte enfants (existant)
- **Junior 12-17** (nouveau)
- **Camp privé** (nouveau, en accent visuel)

**Nouveau panel "Pour qui ?"** (5e dans la nav-list) :
```
Solo · Famille · Junior · Camp privé
+ photos, descriptions, CTA chaque
```

OU plus minimaliste : élargir le panel "Le Camp" avec une 4e colonne "Pour qui".

### 7.2 Footer (`Footer.tsx`)

**Renommer colonne "Disciplines" → "Programmes"** :
```
- MMA
- Lutte adultes
- Lutte enfants
- Junior 12-17        (nouveau)
- Camp privé          (nouveau, accent)
- Camp famille        (nouveau)
- Nos coachs
```

OU **Nouvelle colonne dédiée** "Pour qui" avec ces liens.

### 7.3 Menu mobile (`Nav.tsx` MobAccordion)

**Ajouter accordion "Pour qui ?"** :
```
- Solo Adult     → /inscription
- Famille        → /familles
- Junior 12-17   → /programme/jeunesse
- Camp privé     → /camp-prive
```

**Étendre accordion "Programme"** avec les 5 cards.

### 7.4 StickyMobileCTA — variantes contextuelles

Adapter le CTA selon la page :
| Page | CTA mobile |
|---|---|
| Default | RÉSERVE TON CAMP |
| `/familles` | RÉSERVER MA FAMILLE |
| `/programme/jeunesse` | INSCRIRE MON ADO |
| `/camp-prive` | DEMANDER UN DEVIS |
| `/programme/lutte-enfants` | INSCRIRE MON ENFANT |

Implémenté via prop `audience` ou détection `usePathname()`.

---

## 8 — Images / vidéos requises (briefs Nanobanana)

### 8.1 Nouvelles images

| Filename | Usage | Brief Nanobanana |
|---|---|---|
| `kids-wrestling-class.webp` | Hero `/programme/lutte-enfants` + `/programme/jeunesse` | Groupe de 8 enfants 10-12 ans en kimono blanc, salle de lutte du Daghestan, lumière naturelle, coach daghestanais en arrière-plan, ambiance focus respectueuse |
| `family-camp.webp` | Hero `/familles` | Père et fils 13 ans côte à côte sur le tapis dans une salle de lutte, expression concentrée et complice, lumière dramatique côté |
| `private-coaching.webp` | Hero `/camp-prive` | Coach 1-on-1 avec athlète pro adulte dans une salle vide, ambiance focus laser, lumière dramatique, plan moyen |
| `parents-watching.webp` | `/programme/jeunesse` section sécurité | Parents bienveillants regardant leur enfant s'entraîner depuis le bord du tapis, expression rassurée |
| `kids-belt-celebration.webp` | Section transformation enfant | Enfant 11 ans souriant après un takedown réussi, coach derrière qui applaudit, ambiance positive |
| `family-meal.webp` | `/familles` hébergement | Famille de 4 et autres familles partageant un repas commun caucasien, ambiance chaleureuse, table abondante |
| `teen-sparring.webp` | `/programme/jeunesse` programme | 2 adolescents 14 et 15 ans en sparring contrôlé sur tapis olympique, coach observe attentif |
| `private-meal-1on1.webp` | `/camp-prive` services | Athlète pro et son coach déjeunant ensemble dans une salle privée, debrief tactique sur tablette |
| `kids-warmup.webp` | Section échauffement enfant | 6 enfants 8-12 ans en échauffement ludique, jeux de motricité, coach souriant |
| `family-bonding.webp` | Témoignage famille | Parent et enfant en récupération après l'entraînement, complicité visible, environnement Daghestan |

### 8.2 Vidéos additionnelles (optionnel mais conseillé)
- 30s vidéo "famille au camp" (split-screen parent/enfant en parallèle)
- 30s vidéo "kids training" (montage techniques + ambiance)
- 60s testimonial vidéo parent (interview studio)
- 30s vidéo "camp privé experience" (athlète pro + coach)

### 8.3 Workflow image
Suivre le `workflows/dkdp-image-generation.md` adapté à MKR (le brand identity est différent).
**Important** : ne pas générer d'enfants identifiables — toujours angles neutres, tronqués, ou silhouettes.

---

## 9 — Copy & messaging (drafts)

### 9.1 Homepage — bandeau "Pour qui ?"
> **Eyebrow** : POUR QUI ?
> **Title** : LE CAUCASE EST POUR TOI.
> **Subtitle** : Solo, en famille, junior ou camp privé. À toi de choisir comment tu viens.

### 9.2 `/camp-prive` — Hero
> **Title** : LE CAMP PRIVÉ.<br/>TES DATES, TON FOCUS.
> **Subtitle** : Coaching 1-on-1 ou très petit groupe au Daghestan. Sur mesure du début à la fin.

### 9.3 `/familles` — Hero
> **Title** : VIENS T'ENTRAÎNER<br/>EN FAMILLE.
> **Subtitle** : Parent et enfant côte à côte sur le tapis. Une expérience qui se transmet.

### 9.4 `/programme/jeunesse` — Hero
> **Title** : FORGE TON CARACTÈRE<br/>AU CAUCASE.
> **Subtitle** : Programme jeunesse 12-17 ans. Encadrement spécialisé, sécurité renforcée.

### 9.5 Sections "rassurance" (à appliquer sur /familles + /programme/jeunesse)
> **Coach jeunesse dédié** — Un coach formé pédagogie jeunesse encadre les sessions enfants/ados. Ratio 1 coach pour 5 jeunes maximum.
> **Communication parents** — Briefing journalier par WhatsApp, photos quotidiennes, contact d'urgence 24/7.
> **Sécurité maximale** — Pas de KO autorisé, sparring contrôlé. Tapis olympiques, supervision constante.
> **Cadre adapté** — Hébergement famille avec chambre privée, repas équilibrés, espaces de jeu.

### 9.6 FAQ ajouts (drafts)

**Q: Mon enfant peut venir seul au camp ?**
A: À partir de 16 ans, oui, avec autorisation parentale signée. En dessous (8-15 ans), il doit être accompagné d'un parent. C'est notre règle de sécurité.

**Q: Comment fonctionne le camp privé ?**
A: Tu choisis tes dates (hors session officielle), ta durée (1 à 4 semaines), et le format (solo, duo ou trio). On te propose un programme 100% sur mesure avec un coach dédié, hébergement premium et toute la logistique. Tarif sur devis selon configuration.

**Q: Je ne connais personne, c'est gênant de venir seul ?**
A: 80% de nos athlètes viennent seuls. Le camp crée une vraie dynamique de groupe en 48h. Tu repars avec une famille de combat.

**Q: Quel âge minimum pour les enfants ?**
A: 8 ans en famille (parent présent), 16 ans en autonomie (avec autorisation). Entre 12-15 ans, on étudie au cas par cas si l'enfant est très autonome et que tu peux mobiliser un accompagnateur sur place.

**Q: Coût pour la famille ?**
A: 4500 CHF pour 1 parent + 1 enfant (au lieu de 5800 si pris séparément). Discount progressif au-delà.

---

## 10 — SEO & métadonnées

### 10.1 Nouvelles URLs sitemap.ts
```ts
{ url: `${base}/camp-prive`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
{ url: `${base}/familles`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
{ url: `${base}/programme/jeunesse`, lastModified, changeFrequency: 'monthly', priority: 0.85 },
```

### 10.2 Mots-clés cibles nouveaux
- "camp d'entrainement enfants Caucase"
- "camp MMA famille Daghestan"
- "stage privé MMA Daghestan"
- "camp lutte adolescent Russie"
- "1-on-1 coaching Caucase"
- "camp jeunesse arts martiaux"
- "stage MMA en famille"

### 10.3 JSON-LD additions

**`app/layout.tsx`** Organization :
- Étendre `knowsAbout` : ajouter "Camp jeunesse", "Coaching 1-on-1", "Camps familiaux"

**`app/layout.tsx`** SportsActivityLocation :
- Étendre `audience` : `['Adultes', 'Adolescents 12-17', 'Enfants 8-11', 'Familles']`
- Ajouter Service objects pour chaque type de camp

**Pages dédiées** :
- `/familles` : ajouter `Course` ou `Service` JSON-LD avec audience famille
- `/programme/jeunesse` : audience junior, AgeRange 12-17
- `/camp-prive` : Service avec offers personnalisés

---

## 11 — Tests / QA

### 11.1 Parcours utilisateur (E2E)
1. **Adulte solo** : `/sessions` → `/inscription` → succès → `/merci` ✓ (régression)
2. **Parent + enfant 12 ans** : `/familles` → `/inscription?audience=family` → step Parent → step Enfants (1 enfant) → confirmation → succès
3. **Parent + 2 enfants** : idem mais 2 enfants
4. **Ado 17 ans avec parent** : `/programme/jeunesse` → `/inscription?audience=junior` → upload autorisation → succès
5. **Athlète pro** : `/camp-prive` → form devis → soumission → message confirmation devis 24h
6. **Hésitant solo** : Homepage → bandeau "Pour qui ?" → `/inscription` solo → succès

### 11.2 Responsive
- Tester nouveaux composants en mobile (320px), tablet (768px), desktop (1280px+)
- Particulièrement `<AudienceSwitcher />` (4 cards), `<PricingTable />`, formulaires multi-step

### 11.3 SEO
- `next-sitemap` : nouvelles URLs présentes
- Canonical URLs corrects sur 4 nouvelles pages
- JSON-LD validé via Schema.org Validator

### 11.4 Accessibilité
- Form upload autorisation parentale : label, error, screen reader
- Navigation clavier sur AudienceSwitcher
- Contraste sur PricingTable

### 11.5 Performance
- LCP nouvelles pages < 2.5s
- Images Nanobanana compressées en WebP < 200 KB
- Lazy load tableaux tarifs et témoignages

---

## 12 — Roadmap par phases

### Phase 1 — MVP positioning (1 semaine) 🟢
**Objectif** : ouvrir l'offre sans gros dev, capter les leads
- [ ] `<AudienceSwitcher />` homepage (4 cards, pour info)
- [ ] Section "Venir seul" sur `/comment-ca-marche`
- [ ] 3 nouveaux Q/R FAQ ("Puis-je venir seul ?", "Inscrire mon enfant ?", "Camp privé ?")
- [ ] Section "Pour les parents" sur `/programme/lutte-enfants`
- [ ] Mise à jour Footer + Nav (ajout liens placeholder vers futures pages)
- [ ] Form contact : nouveaux sujets "Question camp privé", "Inscription famille"

**Livrable** : site capte 3 nouveaux types de leads via le contact form.

---

### Phase 2 — Pages dédiées (2 semaines) 🟡
**Objectif** : pages d'atterrissage publicitaires
- [ ] Création `/familles` (page complète avec form basique)
- [ ] Création `/programme/jeunesse` (page complète)
- [ ] Refactor `/programme/lutte-enfants` (section parents, témoignages)
- [ ] Mise à jour Nav (mega menu + mobile + footer)
- [ ] Génération 5 images Nanobanana priorité haute
- [ ] Ajout 2 catégories FAQ ("Familles & Jeunesse", "Camp privé" placeholder)

**Livrable** : pages dédiées prêtes pour campagnes Meta Ads ciblées.

---

### Phase 3 — Camp privé (1-2 semaines) 🟠
**Objectif** : ouvrir le revenu premium
- [ ] Création `/camp-prive` (page + form devis)
- [ ] `<DevisPriveForm />` avec validations
- [ ] `<PricingTable />` multi-public
- [ ] Email notif devis privé (intégration Resend ou autre)
- [ ] FAQ camp privé (5 Q/R)
- [ ] Témoignage camp privé (1 collecté)

**Livrable** : 1ers leads camp privé, processus de devis fonctionnel.

---

### Phase 4 — Refactor inscription multi-public (2 semaines) 🟠
**Objectif** : unifier le tunnel de conversion
- [ ] Step 0 sélecteur `<AudienceSelector />`
- [ ] Branches form Famille (champs enfants[])
- [ ] Branches form Junior (autorisation parentale, file upload)
- [ ] Variantes page `/merci` selon audience
- [ ] StoryCard succès adapté
- [ ] Tests E2E des 4 parcours
- [ ] Update sitemap.ts

**Livrable** : inscription pleinement multi-public, prête pour traffic réel.

---

### Phase 5 — Polish & assets (1 semaine) 🟢
**Objectif** : qualité finale
- [ ] Génération 5 dernières images Nanobanana
- [ ] 3 vidéos courtes (famille, kids, privé) — option
- [ ] Témoignages parents collectés et intégrés
- [ ] Optimisation SEO (mots-clés ciblés)
- [ ] JSON-LD Service objects
- [ ] Audit accessibilité
- [ ] Build & deploy

**Livrable** : site polished, prêt pour campagne marketing.

---

**Total : 7-8 semaines pour version complète. MVP Phase 1 livrable en 1 semaine.**

---

## 13 — 🔍 Décision points (à valider avec David avant kickoff)

| # | Question | Options | Recommandation |
|---|---|---|---|
| **Q1** | "Solo" : positionnement marketing seul (A) ou aussi camp privé sur mesure (B) ? | A only / B only / Les 2 | **Les 2** (A en P1, B en P3) |
| **Q2** | Enfants : que les cas C1+C2 ou aussi C3 (enfant seul confié) ? | C1 / C1+C2 / C1+C2+C3 | **C1+C2** (start safe, ajouter C3 si demande) |
| **Q3** | Tranches d'âge enfants ? | 8-15 + 16-17 / 10-15 + 16-17 / autre | **8-15 famille + 16-17 junior** |
| **Q4** | Tarif famille : discount vs prix individuel ? | Pas de discount / -10% / -15% / -20% | **-15% (pack famille)** |
| **Q5** | Camp privé : disponibilité ? | Hors session officielle / Toute l'année / Personnalisé | **Hors session officielle** (focus sur la 1 session déjà fixée) |
| **Q6** | Roadmap : tout d'un bloc ou par phases ? | Big bang / Phases | **Phases** (P1 MVP en 1 sem, gain immédiat) |
| **Q7** | Recruter coach jeunesse dédié ? | Oui (recrutement réel) / Persona seulement | **Persona pour le site** d'abord, recrutement quand demande validée |
| **Q8** | Form camp privé : intégré à `/inscription` ou séparé `/camp-prive/devis` ? | Intégré / Séparé | **Séparé court** (devis ≠ inscription, public différent) |
| **Q9** | Tarifs : afficher publiquement les prix camp privé ou "sur devis" ? | Affichés / Sur devis seulement | **Fourchettes affichées + détail sur devis** |
| **Q10** | Page `/tarifs` séparée ou tout dans `/sessions` ? | Séparée / Intégrée | **Intégrée** (composant `<PricingTable />` réutilisé) |
| **Q11** | Témoignages parents : à collecter ou simulés ? | Collecter / Simulés | **À collecter avant publication finale** |
| **Q12** | Notifications email devis privé : quel outil ? | Resend / SendGrid / Mailgun / Webhook | **Resend** (simple, free tier suffisant) |

---

## 14 — Dépendances et risques

### 14.1 Dépendances
- **Coach jeunesse** : pour crédibilité section /programme/jeunesse, idéalement persona réel ou inventé soigné
- **Photos enfants/familles** : Nanobanana nécessite qualité acceptable (les modèles d'IA peuvent générer des visages bizarres pour les enfants)
- **Légal** : autorisation parentale → modèle PDF type à fournir
- **Hébergement famille** : confirmer avec MKR si chambre famille existe sur place
- **Repas enfants** : confirmer 3 repas/jour pour enfants vs 2 pour adultes

### 14.2 Risques
| Risque | Impact | Mitigation |
|---|---|---|
| Visuels enfants problématiques (IA) | Moyen | Utiliser silhouettes, plans tronqués, ne pas montrer visage frontal |
| Mineurs à l'étranger : juridique | Élevé | Modèle d'autorisation parentale validé juriste, refuser cas C3 V1 |
| Confusion offre (4 publics) | Moyen | Audience switcher clair, parcours distincts dès Step 0 |
| Cannibalisation tarif (famille - solo) | Faible | Pricing rationnel : famille = pack avec discount cohérent |
| Pas de demande camp privé | Faible | Page peu coûteuse, à tester comme MVP P3 |

---

## 15 — Mise à jour SITEMAP.md après implémentation

Une fois implémenté, mettre à jour `SITEMAP.md` :
- §1 Inventaire : ajouter 3 nouvelles pages (`/camp-prive`, `/familles`, `/programme/jeunesse`)
- §2 Composants : ajouter 9 nouveaux
- §3 Data : ajouter `pricing.ts`, `audiences.ts`, étendre `sessions.ts` type
- §6bis Propagation Map : ajouter section "Tarifs multi-public" et "Audience switcher"
- §7 Conventions : ajouter règles tarification (discount famille, etc.)

---

## 16 — Estimation effort par phase

| Phase | Effort | Devs idéal | Skills requis |
|---|---|---|---|
| P1 — MVP positioning | 5 jours | 1 dev | React/Next, copy |
| P2 — Pages dédiées | 10 jours | 1-2 devs | React, design, copy, images |
| P3 — Camp privé | 7 jours | 1 dev | React, form, intégration email |
| P4 — Refactor inscription | 10 jours | 1 dev | React state machine, validations, file upload |
| P5 — Polish | 5 jours | 1 dev + 1 designer | Images, vidéos, SEO, perf |
| **Total** | **37 jours = ~7-8 semaines** | 1-2 devs | – |

---

## 17 — ✅ Décisions arbitrées (validées 2026-04-30)

### 17.1 Positionnement : HYBRIDE — 2 produits égaux

Le site présente 2 produits distincts au même niveau visuel :

**Produit A — Rejoindre la session groupe**
- Date fixe : 17 août → 5 septembre 2026 (3 semaines)
- Tarif : 2900 CHF / personne adulte, 1900 CHF / enfant 8-17 (avec parent)
- Tunnel : `/inscription/session` (ou `/inscription?type=session`)

**Produit B — Organise ton camp sur mesure**
- Tes dates, ta durée (1, 2 ou 3 semaines), ton format (solo / famille / club)
- Délai minimum : **90 jours avant le début**
- Tarifs : grille fixe ci-dessous
- Tunnel : `/inscription/sur-mesure` (ou `/inscription?type=custom`)

**Page d'accueil** : `<AudienceSwitcher />` met les deux à égalité avec 2 cards principales + 2 cards secondaires (clubs/famille).

### 17.2 Grille tarifaire fixe (publique, pas de réductions)

#### Tarifs ADULTE (18+)
| Durée | Prix CHF |
|---|---|
| 1 semaine | **1 500 CHF** |
| 2 semaines | **2 200 CHF** |
| 3 semaines | **2 900 CHF** |

#### Tarifs ENFANT/ADO (8-17 ans, avec parent obligatoire)
| Durée | Prix CHF |
|---|---|
| 1 semaine | **1 000 CHF** |
| 2 semaines | **1 400 CHF** |
| 3 semaines | **1 900 CHF** |

**Configurations famille typiques (3 semaines)** :
- 1 parent + 1 enfant : 2 900 + 1 900 = **4 800 CHF**
- 1 parent + 2 enfants : 2 900 + 2×1 900 = **6 700 CHF**
- 2 parents + 1 enfant : 2×2 900 + 1 900 = **7 700 CHF**
- 2 parents + 2 enfants : 2×2 900 + 2×1 900 = **9 600 CHF**

#### Tarifs GROUPES / CLUBS
Tarif par tête identique au tarif individuel (pas de réduction). Avantages logistiques : réservation simultanée, hébergement bloc, transferts groupés, programme adapté niveau du groupe.
- Petit groupe : 2-5 personnes (réservé via `/inscription/groupe`)
- Grand groupe : 5+ personnes (réservé via `/inscription/groupe` avec table membres)

### 17.3 Format minimum : **1 personne acceptée**

- Vrai solo possible (1 athlète pour ses dates choisies)
- Pas de supplément solo
- Tarif identique quel que soit le nombre de participants

### 17.4 Politique enfants : **toujours avec parent (8-17 ans)**

- Tout enfant ou ado de 8 à 17 ans doit avoir au moins 1 parent participant au camp
- Pas de prise en charge MKR enfant seul (V1)
- Parent = responsable légal présent sur place
- Plus simple juridiquement, conforme à la culture MKR

### 17.5 Délai réservation camp sur mesure : **90 jours minimum**

Permet de gérer :
- Visa russe (3-4 semaines minimum)
- Vol international moins cher (achat anticipé)
- Préparation physique 6 semaines (programme MKR)
- Coordination équipe coachs sur place

### 17.6 Durées camp sur mesure : **modules fixes 1, 2 ou 3 semaines**

Pas de durée intermédiaire. Le client choisit un bloc.
- 1 semaine : athlète intensif court
- 2 semaines : pratiquant régulier
- 3 semaines : transformation complète (recommandé)

---

## 18 — Architecture des 3 tunnels d'inscription

### 18.1 `/inscription` — Sélecteur d'entrée
Step 0 affiche 3 cards :
```
○ REJOINDRE LA SESSION GROUPE (17 août - 5 sept 2026)
   → "Tu rejoins notre session officielle. Camp groupe d'esprit collectif."

○ CAMP SUR MESURE (mes propres dates)
   → "Tu choisis tes dates. MKR organise tout pour toi."

○ INSCRIPTION CLUB / GROUPE
   → "Plusieurs personnes dans la même demande. Tarif par tête fixe."
```

### 18.2 `/inscription?type=session` — Tunnel session groupe
- Steps : Identité → Expérience → Santé → Logistique → Confirmation (5 steps)
- Date verrouillée : 17 août - 5 sept 2026
- Form famille : option "Je m'inscris avec ma famille" → ajoute step "Famille" pour saisir enfants

### 18.3 `/inscription?type=custom` — Tunnel sur mesure
- Steps : Identité → Dates souhaitées (durée + date début) → Expérience → Santé → Logistique → Confirmation (6 steps)
- Date début minimum : aujourd'hui + 90 jours
- Durée : 1 / 2 / 3 semaines
- Affichage tarif live selon configuration

### 18.4 `/inscription?type=groupe` — Tunnel club
- Steps : Contact responsable → Membres (table dynamique add row) → Dates souhaitées → Logistique → Confirmation (5 steps)
- Membres : prénom, nom, âge, niveau, certif médical par membre
- Au moins 2 personnes, max 20 (limite logistique)
- Délai 90 jours

---

*Plan généré 2026-04-30 par Claude. Décisions arbitrées 2026-04-30 par David. Prêt pour Phase 1 MVP (1 semaine).*
