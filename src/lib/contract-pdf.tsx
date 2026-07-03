/**
 * Génération du contrat de participation en PDF (@react-pdf/renderer v4).
 *
 * `buildContractPdf(data, { preview })` → Buffer PDF A4.
 * - preview: true → filigrane « APERÇU — NON CONTRACTUEL » (route preview).
 * - Fonts de marque (Teko / Barlow) + logo lus depuis public/ via fs, comme
 *   le template OG (pattern éprouvé en prod Vercel). Fallback Helvetica si
 *   lecture impossible : la génération ne crashe JAMAIS pour une font.
 * - @react-pdf est en `serverExternalPackages` (next.config.ts) : jamais
 *   bundlé par Turbopack, résolu depuis node_modules au runtime.
 *
 * Le contenu vient exclusivement de `src/data/contract.ts` + des champs
 * contract_* de la candidature. Aucun accès DB ici.
 */

import path from 'node:path'
import { readFile } from 'node:fs/promises'
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer'
import {
  ACCEPTANCE_CLAUSE,
  CONTRACT_DISCIPLINE_LABEL,
  CONTRACT_RIB,
  INSURANCE_CLAUSE,
  MKR_PARTY,
  PAYMENT_METHODS_NOTE,
  PDF_LABELS,
  REFUND_POSTPONE_NOTE,
  cgvReference,
  formatDateLong,
  formatEurCents,
  getRefundTiers,
  isRibConfigured,
  paymentDeadlineSentence,
  paymentInstruction,
  sanitizeForPdf,
  weeksLabel,
  type ContractDiscipline,
  type ContractLocale,
} from '@/data/contract'

export interface ContractPdfData {
  contractNumber: string
  /** Date d'émission (ISO date). */
  issuedDate: string
  locale: ContractLocale
  participant: {
    fullName: string
    email: string
    phone?: string | null
    birthdate?: string | null
    country?: string | null
    departureCity?: string | null
  }
  /** Nombre de participants si dossier famille/groupe (> 1). */
  groupSize?: number | null
  discipline: ContractDiscipline | null
  startDate: string
  endDate: string
  durationWeeks: number
  amountCents: number
  paymentDeadline: string
  /** Items déjà découpés (1 par ligne côté DB). */
  inclusions: string[]
  exclusions: string[]
  note?: string | null
}

export interface BuildContractPdfOptions {
  preview?: boolean
}

/* ───────────────────────── Fonts + logo ───────────────────────── */

const RED = '#C0392B'
const INK = '#111418'
const MUTED = '#5c6470'
const BORDER = '#d8dce2'
const BG_SOFT = '#f4f5f7'

let fontsReady = false
let brandFontsLoaded = false

function registerFonts(): void {
  if (fontsReady) return
  fontsReady = true
  try {
    const dir = path.join(process.cwd(), 'public', 'og-fonts')
    Font.register({ family: 'Teko', src: path.join(dir, 'Teko-Bold.ttf') })
    Font.register({ family: 'Barlow', src: path.join(dir, 'Barlow-Medium.ttf') })
    Font.register({
      family: 'BarlowCondensed',
      src: path.join(dir, 'BarlowCondensed-SemiBold.ttf'),
    })
    brandFontsLoaded = true
  } catch {
    brandFontsLoaded = false
  }
}

async function loadLogoDataUri(): Promise<string | null> {
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', 'logo-dark.png'))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

/* ───────────────────────── Styles ───────────────────────── */

function makeStyles() {
  const display = brandFontsLoaded ? 'Teko' : 'Helvetica-Bold'
  const body = brandFontsLoaded ? 'Barlow' : 'Helvetica'
  const condensed = brandFontsLoaded ? 'BarlowCondensed' : 'Helvetica-Bold'

  return StyleSheet.create({
    page: {
      paddingTop: 42,
      paddingHorizontal: 46,
      paddingBottom: 64,
      fontFamily: body,
      fontSize: 9.5,
      color: INK,
      lineHeight: 1.45,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18,
    },
    logo: { width: 118, height: 71, objectFit: 'contain' },
    headerRight: { alignItems: 'flex-end', maxWidth: 300 },
    docTitle: { fontFamily: display, fontSize: 26, lineHeight: 1, color: INK },
    docMeta: { fontFamily: condensed, fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: 0.5 },
    docNumber: { fontFamily: condensed, fontSize: 13, color: RED, marginTop: 2, letterSpacing: 0.5 },
    section: { marginTop: 14 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    sectionBar: { width: 14, height: 3, backgroundColor: RED, marginRight: 6, borderRadius: 1 },
    sectionTitle: { fontFamily: display, fontSize: 14, letterSpacing: 0.6, color: INK },
    twoCols: { flexDirection: 'row', gap: 10 },
    col: { flex: 1 },
    partyBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 6,
      padding: 10,
    },
    partyRole: { fontFamily: condensed, fontSize: 9, color: RED, letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' },
    partyName: { fontSize: 11.5, fontFamily: condensed, color: INK, marginBottom: 3 },
    kvRow: { flexDirection: 'row', marginTop: 1.5 },
    kvKey: { width: 92, color: MUTED, fontSize: 8.5 },
    kvVal: { flex: 1, fontSize: 8.5 },
    stayGrid: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 6,
      backgroundColor: BG_SOFT,
      padding: 10,
    },
    stayRow: { flexDirection: 'row', marginTop: 2 },
    stayKey: { width: 110, color: MUTED, fontSize: 9 },
    stayVal: { flex: 1, fontSize: 9.8, fontFamily: condensed },
    bullet: { flexDirection: 'row', marginTop: 2.5, paddingRight: 6 },
    bulletDot: { width: 10, color: RED, fontFamily: condensed },
    bulletText: { flex: 1, fontSize: 9 },
    amountBox: {
      borderWidth: 1,
      borderColor: BORDER,
      borderLeftWidth: 3,
      borderLeftColor: RED,
      borderRadius: 6,
      padding: 10,
      marginBottom: 8,
    },
    amountLabel: { fontFamily: condensed, fontSize: 9, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase' },
    // lineHeight explicite : les métriques verticales de Teko débordent sinon
    // sur la ligne suivante (chevauchement constaté au premier rendu).
    amountValue: { fontFamily: display, fontSize: 24, lineHeight: 1.2, color: INK, marginTop: 2, marginBottom: 4 },
    ribBox: {
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 6,
      padding: 10,
      backgroundColor: BG_SOFT,
    },
    ribTitle: { fontFamily: condensed, fontSize: 9, color: MUTED, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
    ribMissing: {
      marginTop: 6,
      padding: 8,
      borderRadius: 4,
      backgroundColor: '#fdecea',
      color: '#b71c1c',
      fontSize: 9,
      fontFamily: condensed,
    },
    refundTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: 'hidden' },
    refundRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
    refundRowFirst: { flexDirection: 'row' },
    refundDelay: { flex: 3, padding: 6, fontSize: 9 },
    refundValue: { flex: 2, padding: 6, fontSize: 9, fontFamily: condensed },
    clause: { fontSize: 8.8, color: '#2a2f36', marginTop: 3 },
    noteBox: {
      borderWidth: 1,
      borderColor: '#e5c987',
      backgroundColor: '#fdf8ec',
      borderRadius: 6,
      padding: 10,
      fontSize: 9,
    },
    signRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    signBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: BORDER,
      borderRadius: 6,
      padding: 10,
      minHeight: 84,
    },
    signLabel: { fontFamily: condensed, fontSize: 8.5, color: MUTED, letterSpacing: 0.6, textTransform: 'uppercase' },
    signName: { fontSize: 9.5, marginTop: 2 },
    footer: {
      position: 'absolute',
      bottom: 26,
      left: 46,
      right: 46,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: BORDER,
      paddingTop: 6,
    },
    footerText: { fontSize: 7.5, color: MUTED },
    // Un seul mot (pas de wrap possible en rotation), gros et discret.
    watermark: {
      position: 'absolute',
      top: 380,
      left: 120,
      transform: 'rotate(-28deg)',
      fontSize: 92,
      color: 'rgba(192, 57, 43, 0.11)',
      fontFamily: condensed,
      letterSpacing: 10,
    },
    link: { color: RED, textDecoration: 'none' },
  })
}

/* ───────────────────────── Composants ───────────────────────── */

type Styles = ReturnType<typeof makeStyles>

function SectionTitle({ s, children }: { s: Styles; children: string }) {
  return (
    <View style={s.sectionTitleRow} wrap={false}>
      <View style={s.sectionBar} />
      <Text style={s.sectionTitle}>{children}</Text>
    </View>
  )
}

function Bullets({ s, items }: { s: Styles; items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{sanitizeForPdf(item)}</Text>
        </View>
      ))}
    </View>
  )
}

function Kv({ s, k, v }: { s: Styles; k: string; v: string }) {
  return (
    <View style={s.kvRow}>
      <Text style={s.kvKey}>{k}</Text>
      <Text style={s.kvVal}>{sanitizeForPdf(v)}</Text>
    </View>
  )
}

function ContractDocument({
  data,
  preview,
  logo,
  s,
}: {
  data: ContractPdfData
  preview: boolean
  logo: string | null
  s: Styles
}) {
  const L = PDF_LABELS[data.locale]
  const locale = data.locale
  const tiers = getRefundTiers(locale)
  const cgv = cgvReference(locale)
  const ribOk = isRibConfigured()
  const p = data.participant
  const disciplineLabel = data.discipline
    ? CONTRACT_DISCIPLINE_LABEL[locale][data.discipline]
    : '—'

  return (
    <Document
      title={`${data.contractNumber} — ${L.docTitle}`}
      author={MKR_PARTY.name}
      creator={MKR_PARTY.name}
    >
      <Page size="A4" style={s.page}>
        {preview && (
          <Text style={s.watermark} fixed>
            {L.previewWatermark}
          </Text>
        )}

        {/* Header */}
        <View style={s.headerRow}>
          {logo ? <Image src={logo} style={s.logo} /> : <Text style={s.docTitle}>MKR</Text>}
          <View style={s.headerRight}>
            <Text style={s.docTitle}>{L.docTitle}</Text>
            <Text style={s.docNumber}>{`${L.contractNo} ${data.contractNumber}`}</Text>
            <Text style={s.docMeta}>{`${L.issuedOn} ${formatDateLong(data.issuedDate, locale)}`}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={s.section}>
          <SectionTitle s={s}>{L.parties}</SectionTitle>
          <View style={s.twoCols}>
            <View style={s.partyBox}>
              <Text style={s.partyRole}>{L.organizer}</Text>
              <Text style={s.partyName}>{MKR_PARTY.name}</Text>
              <Kv s={s} k={L.representedBy} v={`${MKR_PARTY.representative} (${MKR_PARTY.representativeRole[locale]})`} />
              <Kv s={s} k={L.email} v={MKR_PARTY.email} />
              <Kv s={s} k={L.phone} v={MKR_PARTY.phone} />
              <Text style={{ ...s.kvVal, color: MUTED, marginTop: 3, fontSize: 8 }}>
                {MKR_PARTY.country[locale]}
              </Text>
            </View>
            <View style={s.partyBox}>
              <Text style={s.partyRole}>{L.participant}</Text>
              <Text style={s.partyName}>{sanitizeForPdf(p.fullName)}</Text>
              <Kv s={s} k={L.email} v={p.email} />
              {p.phone ? <Kv s={s} k={L.phone} v={p.phone} /> : null}
              {p.birthdate ? <Kv s={s} k={L.birthdate} v={formatDateLong(p.birthdate, locale)} /> : null}
              {p.country ? <Kv s={s} k={L.country} v={p.country} /> : null}
              {p.departureCity ? <Kv s={s} k={L.departureCity} v={p.departureCity} /> : null}
            </View>
          </View>
        </View>

        {/* Séjour */}
        <View style={s.section}>
          <SectionTitle s={s}>{L.stay}</SectionTitle>
          <View style={s.stayGrid}>
            <View style={s.stayRow}>
              <Text style={s.stayKey}>{L.discipline}</Text>
              <Text style={s.stayVal}>{disciplineLabel}</Text>
            </View>
            <View style={s.stayRow}>
              <Text style={s.stayKey}>{L.dates}</Text>
              <Text style={s.stayVal}>
                {`${formatDateLong(data.startDate, locale)} ${L.datesTo} ${formatDateLong(data.endDate, locale)}`}
              </Text>
            </View>
            <View style={s.stayRow}>
              <Text style={s.stayKey}>{L.duration}</Text>
              <Text style={s.stayVal}>{weeksLabel(data.durationWeeks, locale)}</Text>
            </View>
            {data.groupSize && data.groupSize > 1 ? (
              <View style={s.stayRow}>
                <Text style={s.stayKey}>{L.groupSize}</Text>
                <Text style={s.stayVal}>{`${data.groupSize} ${L.groupSizeValue}`}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Prestations */}
        <View style={s.section}>
          <SectionTitle s={s}>{L.inclusions}</SectionTitle>
          <Bullets s={s} items={data.inclusions} />
        </View>
        <View style={s.section}>
          <SectionTitle s={s}>{L.exclusions}</SectionTitle>
          <Bullets s={s} items={data.exclusions} />
        </View>

        {/* Montant + RIB */}
        <View style={s.section}>
          <SectionTitle s={s}>{L.payment}</SectionTitle>
          <View style={s.amountBox} wrap={false}>
            <Text style={s.amountLabel}>{L.totalAmount}</Text>
            <Text style={s.amountValue}>{formatEurCents(data.amountCents, locale)}</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>
              {paymentDeadlineSentence(locale, formatDateLong(data.paymentDeadline, locale))}
            </Text>
          </View>
          <View style={s.ribBox} wrap={false}>
            <Text style={s.ribTitle}>{L.bankDetails}</Text>
            <Kv s={s} k={L.holder} v={CONTRACT_RIB.holder} />
            <Kv s={s} k="IBAN" v={CONTRACT_RIB.iban} />
            <Kv s={s} k="BIC" v={`${CONTRACT_RIB.bic} (${CONTRACT_RIB.bank})`} />
            <Text style={{ fontSize: 8.6, marginTop: 4 }}>{paymentInstruction(locale, data.contractNumber)}</Text>
            <Text style={{ fontSize: 8.6, marginTop: 2, color: MUTED }}>{PAYMENT_METHODS_NOTE[locale]}</Text>
            {!ribOk ? <Text style={s.ribMissing}>{L.ribMissing}</Text> : null}
          </View>
        </View>

        {/* Annulation */}
        <View style={s.section} wrap={false}>
          <SectionTitle s={s}>{L.cancellation}</SectionTitle>
          <View style={s.refundTable}>
            {tiers.map((tier, i) => (
              <View key={i} style={i === 0 ? s.refundRowFirst : s.refundRow}>
                <Text style={s.refundDelay}>{tier.delay}</Text>
                <Text style={s.refundValue}>{tier.refund}</Text>
              </View>
            ))}
          </View>
          <Text style={{ ...s.clause, marginTop: 5 }}>{REFUND_POSTPONE_NOTE[locale]}</Text>
        </View>

        {/* Conditions particulières */}
        {data.note && data.note.trim() ? (
          <View style={s.section} wrap={false}>
            <SectionTitle s={s}>{L.specialConditions}</SectionTitle>
            <View style={s.noteBox}>
              <Text>{sanitizeForPdf(data.note.trim())}</Text>
            </View>
          </View>
        ) : null}

        {/* Assurance + CGV + acceptation */}
        <View style={s.section} wrap={false}>
          <SectionTitle s={s}>{L.insurance}</SectionTitle>
          <Text style={s.clause}>{INSURANCE_CLAUSE[locale]}</Text>
        </View>
        <View style={s.section} wrap={false}>
          <SectionTitle s={s}>{L.cgv}</SectionTitle>
          <Text style={s.clause}>{cgv.text}</Text>
          <Text style={{ ...s.clause, ...s.link }}>{cgv.url}</Text>
        </View>
        <View style={s.section} wrap={false}>
          <SectionTitle s={s}>{L.acceptance}</SectionTitle>
          <Text style={s.clause}>{ACCEPTANCE_CLAUSE[locale]}</Text>
        </View>

        {/* Signatures */}
        <View style={s.section} wrap={false}>
          <SectionTitle s={s}>{L.signatures}</SectionTitle>
          <View style={s.signRow}>
            <View style={s.signBox}>
              <Text style={s.signLabel}>{L.signOrganizer}</Text>
              <Text style={s.signName}>{`${MKR_PARTY.representative} — ${MKR_PARTY.name}`}</Text>
            </View>
            <View style={s.signBox}>
              <Text style={s.signLabel}>{L.signParticipant}</Text>
              <Text style={s.signName}>{sanitizeForPdf(p.fullName)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {`${MKR_PARTY.name} — ${MKR_PARTY.website} — ${MKR_PARTY.email}`}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `${data.contractNumber} · ${L.page} ${pageNumber}/${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

/* ───────────────────────── API ───────────────────────── */

export async function buildContractPdf(
  data: ContractPdfData,
  options: BuildContractPdfOptions = {},
): Promise<Buffer> {
  registerFonts()
  const logo = await loadLogoDataUri()
  const s = makeStyles()
  const buffer = await renderToBuffer(
    <ContractDocument data={data} preview={!!options.preview} logo={logo} s={s} />,
  )
  return Buffer.from(buffer)
}
