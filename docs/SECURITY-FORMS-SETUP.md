# Setup Resend — formulaires MKR

Doc opérationnelle pour activer les emails sortants des formulaires (`/contact`, `/api/inscription`, `/api/guide-caucase`) vers `contact@mkrcamp.com`.

> **Décision 2026-05-15** : on envoie depuis `dkdp.ch` (domaine agence, déjà vérifié sur Resend) au lieu de configurer le DNS de `mkrcamp.com`. Avantage : zéro action DNS côté Infomaniak, déploiement immédiat. La mailbox réceptrice `contact@mkrcamp.com` reste sur Google Workspace (MX inchangé). Le `replyTo` de chaque mail pointe vers l'email du candidat, donc Ruslan peut répondre direct.

## 1. Clé API Resend

1. https://resend.com/api-keys → **Create API Key** → nom : `mkr-prod`, scope : **Full access**.
2. Copier la clé (commence par `re_...`).

## 2. Domaine d'envoi : dkdp.ch (rien à faire)

Le domaine `dkdp.ch` est déjà vérifié sur Resend (utilisé pour d'autres projets DKDP). Aucune action DNS supplémentaire requise.

Si plus tard tu veux envoyer depuis `mkrcamp.com` (cohérence brand pure), il faudra :
- Resend → Domains → Add `mkrcamp.com` → coller 3 TXT chez Infomaniak (DKIM + SPF fusionné Google+Resend + DMARC)
- ⚠️ Fusionner avec le SPF Infomaniak existant : `v=spf1 include:_spf.google.com include:amazonses.com -all` (retirer `spf.infomaniak.ch` si plus utilisé pour l'envoi).

## 3. Coller la clé sur Vercel

**Vercel prod** — https://vercel.com/dashboard → Project mkr-camp → Settings → Environment Variables :

| Name | Value | Environments |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` | Production + Preview |
| `MKR_EMAIL_FROM` | `MKR Caucasian Camp <contact@mkrcamp.com>` | Production + Preview |
| `MKR_EMAIL_TO` | `contact@mkrcamp.com` | Production + Preview |

Puis **Redeploy** (le redeploy est obligatoire pour que les nouvelles env vars soient prises en compte).

Local (`nextjs/.env.local`) déjà configuré avec les mêmes valeurs.

## 4. Tester l'envoi

Une fois en prod avec la clé et le domaine vérifié :

1. Aller sur `https://mkrcamp.com/contact` → remplir le formulaire → envoyer.
2. Vérifier l'inbox de `contact@mkrcamp.com` (mailbox Google Workspace).
3. Si OK, tester aussi `/inscription` (form complet) et `/guide-caucase` (email seul).

## 5. Monitoring

- Resend dashboard : https://resend.com/emails — liste des envois récents (delivered / bounced / complained).
- Tags utilisés : `kind=contact`, `kind=inscription`, `kind=guide-caucase` pour filtrer.

## 6. Sécurité

- La clé Resend ne donne accès qu'à l'envoi sur les domaines vérifiés du compte (dkdp.ch).
- Si fuite : Resend → API Keys → Revoke → recréer.
- L'API ne renvoie jamais l'email du destinataire dans une réponse HTTP publique (le `To` est hardcodé serveur).
- Honeypot `_hp` côté form bloque les bots basiques. Rate-limit IP côté API bloque le spam ciblé.
