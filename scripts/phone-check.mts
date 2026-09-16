// Teste le VRAI module lib/phone.ts : normalisation E.164 du telephone saisi
// dans le tunnel d'inscription (indicatif choisi + numero national).
// Lancer : node --import ./scripts/_alias-hook.mjs scripts/phone-check.mts
import { toE164, formatIntl, phoneCountries, guessCountry, splitE164 } from '../src/lib/phone.ts'

let ko = 0
const check = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) ko++
  console.log(ok ? 'OK ' : 'KO ', label, '->', JSON.stringify(got), ok ? '' : `(attendu ${JSON.stringify(want)})`)
}

console.log('--- toE164 : ce que les candidats ont reellement tape en base ---')
check('FR avec 0 de tete',          toE164('06 52 04 23 18', 'FR'), '+33652042318')
check('FR sans 0',                  toE164('6 52 04 23 18', 'FR'),  '+33652042318')
check('FR deja international',      toE164('+33 07 59 23 76 87', 'FR'), '+33759237687')
check('FR 00 en tete',              toE164('0033652042318', 'FR'), '+33652042318')
check('UK avec 0 de tete',          toE164('07835255427', 'GB'),   '+447835255427')
check('UK sans 0',                  toE164('793563355', 'GB'),     null)
check('US 10 chiffres',             toE164('2015545214', 'US'),    '+12015545214')
check('US avec 1 devant',           toE164('13137076486', 'US'),   '+13137076486')
check('IT mobile sans 0',           toE164('3779682603', 'IT'),    '+393779682603')
check('CH avec espaces',            toE164('078 214 08 48', 'CH'), '+41782140848')
check('IN 00 en tete',              toE164('00919760389418', 'IN'), '+919760389418')
check('QA 00 en tete',              toE164('0097451100085', 'QA'), '+97451100085')
check('PK avec 0',                  toE164('03152912218', 'PK'),   '+923152912218')
check('MX',                         toE164('5531119429', 'MX'),    '+525531119429')
check('indicatif d un autre pays que le select', toE164('+41 78 214 08 48', 'FR'), '+41782140848')
check('trop court',                 toE164('12', 'FR'),            null)
check('lettres',                    toE164('abc', 'FR'),           null)
check('vide',                       toE164('', 'FR'),              null)
check('pays vide sans +',           toE164('0652042318', ''),      null)
check('pays vide avec +',           toE164('+33652042318', ''),    '+33652042318')

console.log('--- formatIntl ---')
check('FR lisible',  formatIntl('+33652042318'), '+33 6 52 04 23 18')
check('non E.164 rendu tel quel', formatIntl('0652042318'), '0652042318')

console.log('--- splitE164 (pre-remplissage a la relecture) ---')
check('FR', splitE164('+33652042318'), { country: 'FR', national: '6 52 04 23 18' })
check('vide', splitE164(''), { country: '', national: '' })
check('non normalise', splitE164('0652042318'), { country: '', national: '0652042318' })

console.log('--- phoneCountries ---')
const fr = phoneCountries('fr')
const en = phoneCountries('en')
check('FR present avec +33', fr.find(c => c.iso === 'FR')?.code, '33')
check('nom en francais', fr.find(c => c.iso === 'DE')?.name, 'Allemagne')
check('nom en anglais', en.find(c => c.iso === 'DE')?.name, 'Germany')
check('trie par nom (fr)', fr.slice(0, 2).map(c => c.iso), ['AF', 'ZA'])
check('aucun doublon', new Set(fr.map(c => c.iso)).size, fr.length)
check('au moins 200 pays', fr.length >= 200, true)

console.log('--- guessCountry ---')
check('fr-FR', guessCountry(['fr-FR']), 'FR')
check('en-GB', guessCountry(['en-GB']), 'GB')
check('fr seul = inconnu', guessCountry(['fr']), '')
check('region non telephonique', guessCountry(['en-001']), '')
check('premier valide gagne', guessCountry(['en', 'de-CH']), 'CH')

console.log(ko ? `\n${ko} KO` : '\nTout OK')
process.exit(ko ? 1 : 0)
