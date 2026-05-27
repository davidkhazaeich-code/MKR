# MKR Translation Glossary (FR → EN, locked)

> **Source de vérité unique** pour toutes les traductions du site MKR Caucasian Camp.
> Ce glossaire est embarqué inline dans le master prompt donné à chaque sub-agent traducteur.
> **Aucune dérogation n'est permise**. Si un sub-agent produit une traduction qui ne respecte
> pas le glossaire, l'output est rejeté et régénéré.

---

## 1. Brand & proper nouns (NEVER translate)

| FR | EN |
|---|---|
| MKR Caucasian Camp | MKR Caucasian Camp |
| MKR | MKR |
| Ruslan Mukhtarov | Ruslan Mukhtarov |
| Akhmat Fight Club | Akhmat Fight Club |
| INSEP | INSEP (acronyme ; expliquer inline si nécessaire : "INSEP, the French national sport institute") |
| FFL / Fédération Française de Lutte | French Wrestling Federation (FFL) |
| Khabib Nurmagomedov | Khabib Nurmagomedov |
| Khamzat Chimaev | Khamzat Chimaev |
| Islam Makhachev | Islam Makhachev |
| Antoine Petit-Jean | Antoine Petit-Jean |

## 2. Sports terminology (locked translations)

| FR | EN |
|---|---|
| Lutte (le sport) | Wrestling |
| Lutte libre | Freestyle wrestling |
| Lutte adultes | Adult wrestling |
| Lutte enfants / Lutte jeunesse | Youth wrestling (8-17) |
| Lutte gréco-romaine | Greco-Roman wrestling |
| Lutte daghestanaise | Dagestani wrestling |
| MMA | MMA (acronyme universel, NEVER expand) |
| Sambo | Sambo |
| Grappling | Grappling |
| Boxe anglaise | Boxing |
| Kickboxing | Kickboxing |
| Muay Thaï | Muay Thai |
| Jiu-Jitsu Brésilien | Brazilian Jiu-Jitsu (BJJ) |
| Judo | Judo |
| Takedown | Takedown |
| Clinch | Clinch |
| Ground & pound | Ground and pound |
| Soumission | Submission |
| Sparring | Sparring |
| Coach / Entraîneur | Coach (NEVER "trainer") |
| Camp d'entraînement | Training camp |
| Stage (sportif) | Camp (le mot "stage" ne s'utilise pas, "camp" est le terme universel) |
| Niveau | Level |
| Compétiteur | Competitor |
| Amateur sérieux | Serious amateur |
| Palmarès | Achievements / Track record (selon contexte) |

## 3. Geography (locked — orthographe EN différente du FR)

| FR | EN |
|---|---|
| Caucase | Caucasus |
| Daghestan (spelling FR) | **Dagestan** (drop the H — règle critique) |
| Tchétchénie | Chechnya |
| Makhachkala | Makhachkala |
| Kaspiysk | Kaspiysk |
| Grozny | Grozny |
| Istanbul | Istanbul |
| Russie | Russia |
| France | France |

## 4. Logistics (locked)

| FR | EN |
|---|---|
| Vol intérieur | Domestic flight |
| Vol international | International flight |
| Visa russe | Russian visa |
| Transferts | Airport transfers |
| Hébergement | Accommodation (standard international) |
| Encadrement | Coaching staff / Supervision (selon contexte) |
| 2 repas par jour | 2 meals per day |
| Excursions | Excursions |
| Assurance voyage | Travel insurance |
| Passeport | Passport |
| Lettre d'invitation | Invitation letter |
| Questionnaire UE | EU questionnaire |

## 5. Brand voice (style guidelines EN)

- **TONE** : confident, direct, slightly aspirational. NOT marketing fluff, NOT sales-pushy.
- **"Tu" FR informal → "You" EN** (jamais "thou", jamais formel excessif).
- **No em dashes (—)** : utiliser ",", "." ou " · " (règle DKDP globale).
- **No ampersands (&)** : écrire "and".
- **Numbers** : chiffres ("15 places", pas "fifteen").
- **Currency** : EUR (€) — audience internationale lit les euros.
- **Dates** : format US international ("August 17, 2026" pour "17 août 2026"). Le formatage est géré côté code via `Intl.DateTimeFormat`, le master prompt ne traduit pas les dates en dur.
- **Phone** : format international (`+33 6 66 17 76 91`) inchangé.
- **Register** : US/UK international neutral. Pas de slang local.

## 6. Slogans & taglines (carefully crafted, locked)

| FR | EN |
|---|---|
| L'immersion au milieu des champions | Immersion among champions |
| Camp d'entraînement MMA et Lutte au cœur du Caucase | MMA and Wrestling training camp at the heart of the Caucasus |
| TROIS DISCIPLINES. DEUX TERRES DU CAUCASE. | THREE DISCIPLINES. TWO LANDS OF THE CAUCASUS. |
| LA DISCIPLINE QUI A FORGÉ LE CAUCASE | THE DISCIPLINE THAT FORGED THE CAUCASUS |
| LA NOUVELLE GENERATION DU CAUCASE | THE NEW GENERATION OF THE CAUCASUS |
| Prochain camp · {dates} | Next camp · {dates} |
| Postuler (CTA primary) | Apply |
| POSTULER (CTA caps) | APPLY NOW |
| Découvrir | Discover |
| En savoir plus | Learn more |
| Demande un devis | Request a quote |
| MKR organise tout | MKR handles everything |
| Tout compris | All inclusive |
| Visa Russie inclus | Russian visa included |
| Vol intérieur inclus | Domestic flight included |
| Pour qui ? | Who is it for? |
| Comment ça marche | How it works |
| Pour les parents | For parents |
| Camp Famille | Family Camp |
| Camp Sur Mesure | Custom Camp |
| Clubs et Groupes | Clubs and Groups |
| MKR Camp 2026 | MKR Camp 2026 |
| Voir tout | See all |
| Retour en haut | Back to top |

## 7. Form labels (locked)

| FR | EN |
|---|---|
| Prénom | First name |
| Nom | Last name |
| Date de naissance | Date of birth |
| Pays de résidence | Country of residence |
| Email | Email |
| Téléphone (international) | Phone (international) |
| Discipline principale | Main discipline |
| Années de pratique | Years of practice |
| Niveau | Level |
| Club actuel (optionnel) | Current club (optional) |
| Coach actuel (optionnel) | Current coach (optional) |
| Palmarès (optionnel) | Achievements (optional) |
| Lien vidéo (optionnel) | Video link (optional) |
| Condition physique | Physical condition |
| Blessures récentes | Recent injuries |
| Contre-indications médicales | Medical contraindications |
| Prêt à t'entraîner 2 fois par jour | Ready to train twice a day |
| Ville de départ | Departure city |
| Disponibilité pour l'appel de cadrage | Availability for the kickoff call |
| Comment as-tu connu MKR | How did you hear about MKR |
| Un message pour Ruslan | A message for Ruslan |
| J'accepte d'être recontacté | I agree to be contacted back |
| Code partenaire (optionnel) | Partner code (optional) |
| Ce champ est requis | This field is required |
| Email invalide | Invalid email |

## 8. Pricing & commercial (locked)

| FR | EN |
|---|---|
| Solo | Solo |
| Duo | Duo |
| Trio | Trio |
| Quatuor | Quartet |
| Club | Club |
| Forfait Famille | Family package |
| Enfant supplémentaire | Additional child |
| Sur devis | Custom quote |
| À partir de | From |
| par adulte | per adult |
| par semaine | per week |
| Devis sur mesure | Custom quote |
| Sans paiement initial | No upfront payment |
| Paiement post-visio | Payment after kickoff call |
| Virement bancaire | Bank transfer |
| Espèces | Cash |
| RIB | Bank details |

## 9. Status & badges (admin / form / pages)

| FR | EN |
|---|---|
| Candidature reçue | Application received |
| Candidature validée | Application approved |
| Candidature soldée | Application paid |
| Annulée | Cancelled |
| Refusée | Rejected |
| Devis à envoyer | Quote to send |
| Sécurité | Safety |
| Logistique | Logistics |
| Entrainement | Training |
| Inscription | Registration |

## 10. Forbidden in EN

- ❌ Em dash `—` (use `,` or `.` or ` · `)
- ❌ Ampersand `&` (write "and")
- ❌ Emojis (use SVG icons via the `Icon` component)
- ❌ Archaic forms ("thou", "thee", "ye")
- ❌ British slang in headlines (US-international register)
- ❌ "wrestling" as "fight" or "combat" — terminology matters for SEO
- ❌ "MMA" expanded to "mixed martial arts" in CTAs / titles (keep acronym)
- ❌ "Camp" as "course" or "stage" — universal term "camp"
- ❌ Adding parentheticals not present in source
- ❌ "Daghestan" with H — always "Dagestan" in EN
- ❌ "Caucase" as "Caucase" — always "Caucasus"

## 11. SEO / search intent considerations EN

Quand on traduit pour le SEO, on cherche à matcher l'intent search anglophone :

| Intent FR | Cible EN |
|---|---|
| camp d'entraînement MMA Caucase | MMA training camp in the Caucasus |
| préparer son premier camp | preparing for your first training camp |
| lutte daghestanaise | Dagestani wrestling |
| visa russe pour camp | Russian visa for training camp |
| MMA en Tchétchénie | MMA in Chechnya |
| Khabib méthode entraînement | Khabib training method |

## 12. Passage-level citability (AI search)

Chaque paragraphe EN doit être **self-contained** : une IA (ChatGPT, Perplexity, Claude, Google AI Overviews) doit pouvoir l'extraire et le citer tel quel sans contexte.

**Bon exemple** :
> "MKR Caucasian Camp runs training camps from 1 to 3 weeks in Dagestan (wrestling) and Chechnya (MMA), with Russian visa, domestic flight from Istanbul, accommodation, and 2 meals per day included."

**Mauvais exemple** (référence implicite) :
> "Le camp se déroule là-bas, avec tout inclus."

→ La traduction EN doit toujours préférer le bon exemple, même si la version FR est plus elliptique.

---

*Dernière mise à jour : 2026-05-27. Toute modification doit être validée par David Khazaei.*
