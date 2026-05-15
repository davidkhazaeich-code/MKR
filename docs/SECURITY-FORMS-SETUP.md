# Setup Resend + DNS — formulaires MKR

Doc opérationnelle pour activer les emails sortants des formulaires (`/contact`, `/api/inscription`, `/api/guide-caucase`) vers `contact@mkrcamp.com`. Sans ces étapes, le code est en place mais aucun mail ne part (Slack continue de fonctionner).

## 1. Créer la clé API Resend

1. Se connecter sur https://resend.com (plan free : 3 000 emails/mois, 100/jour — largement suffisant pour MKR).
2. https://resend.com/api-keys → **Create API Key** → nom : `mkr-prod`, scope : **Full access**.
3. Copier la clé (commence par `re_...`).

## 2. Ajouter le domaine mkrcamp.com sur Resend

1. https://resend.com/domains → **Add Domain** → `mkrcamp.com`, region `eu-west-1` (Frankfurt, comme Supabase).
2. Resend affiche 3 enregistrements DNS à ajouter chez Infomaniak (gestionnaire DNS actuel d'après le SPF):

| Type | Nom (host) | Valeur | TTL |
|---|---|---|---|
| **TXT** | `send.mkrcamp.com` ou `@` | `v=spf1 include:_spf.google.com include:amazonses.com -all` | 3600 |
| **TXT** | `resend._domainkey` | (valeur DKIM exacte fournie par Resend, ~250 chars) | 3600 |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@mkrcamp.com` | 3600 |

> ⚠️ **SPF actuel à fusionner** : `v=spf1 include:spf.infomaniak.ch -all`. Le `-all` final est trop strict. Remplacer par la valeur du tableau ci-dessus (Google reçoit, Resend envoie, on retire Infomaniak qui ne sert plus si le mail est sur Google Workspace).
>
> Si Infomaniak héberge encore quelque chose qui envoie (formulaire ancien site, etc.), garder l'include : `v=spf1 include:_spf.google.com include:amazonses.com include:spf.infomaniak.ch -all`.

3. Aller dans Infomaniak Manager → Hébergement → DNS → `mkrcamp.com` → ajouter / éditer les 3 TXT ci-dessus.
4. Propagation 5-30 min. Revenir sur Resend → **Verify**. Une fois les 3 statuts en vert, le domaine est vérifié.

## 3. Coller la clé dans .env.local + Vercel

**Local** — `nextjs/.env.local` :
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
MKR_EMAIL_FROM=MKR Caucasian Camp <notifications@mkrcamp.com>
MKR_EMAIL_TO=contact@mkrcamp.com
```

**Vercel prod** — https://vercel.com/dashboard → Project mkr-camp → Settings → Environment Variables :

| Name | Value | Environments |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` | Production + Preview |
| `MKR_EMAIL_FROM` | `MKR Caucasian Camp <notifications@mkrcamp.com>` | Production + Preview |
| `MKR_EMAIL_TO` | `contact@mkrcamp.com` | Production + Preview |

Puis **Redeploy** (le redeploy est obligatoire pour que les nouvelles env vars soient prises en compte).

## 4. Tester l'envoi

Une fois en prod avec la clé et le domaine vérifié :

1. Aller sur `https://mkrcamp.com/contact` → remplir le formulaire → envoyer.
2. Vérifier l'inbox de `contact@mkrcamp.com` (mailbox Google Workspace).
3. Si OK, tester aussi `/inscription` (form complet) et `/guide-caucase` (email seul).

## 5. Fallback temporaire (avant vérification domaine)

Tant que `mkrcamp.com` n'est pas vérifié sur Resend, les envois échouent silencieusement avec erreur `from address not allowed`. Solution temporaire pour tester en preview :

```
MKR_EMAIL_FROM=MKR Caucasian Camp <onboarding@resend.dev>
```

C'est l'adresse fallback offerte par Resend, OK pour tester. À retirer dès que le domaine est vérifié sinon Gmail risque de mettre en spam.

## 6. Monitoring

- Resend dashboard : https://resend.com/emails — liste des envois récents (delivered / bounced / complained).
- Tags utilisés : `kind=contact`, `kind=inscription`, `kind=guide-caucase` pour filtrer.

## 7. Sécurité

- La clé Resend ne donne accès qu'à l'envoi sur `mkrcamp.com` (scope domain-level).
- Si fuite : Resend → API Keys → Revoke → recréer.
- L'API ne renvoie jamais l'email du destinataire dans une réponse HTTP publique (le `To` est hardcodé serveur).
- Honeypot `_hp` côté form bloque les bots basiques. Rate-limit IP côté API bloque le spam ciblé.
