import { buildMetadata } from '@/lib/seo'
import { PRICING_TIERS, FAMILY_PRICING, formatEUR } from '@/data/pricing'
import {
  DUO_ONE_LINE_BARE,
  TRIO_ONE_LINE_BARE,
  CLUB_ONE_LINE_BARE,
  FAMILY_BASE_PROSE,
  FAMILY_EXTRA_CHILD_FULL,
} from '@/lib/pricing-copy'

export const metadata = buildMetadata({
  title: 'CGV | MKR Caucasian Camp | Conditions Générales de Vente',
  description: "Conditions générales de vente de MKR Caucasian Camp. Modalités d'inscription, paiement, annulation et remboursement.",
  path: '/cgv',
})
export default function CGVPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">CONDITIONS GÉNÉRALES DE VENTE</h1>
        <div className="legal-content">
          <h2>Article 1 : Objet</h2>
          <p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre MKR Caucasian Camp (ci-après &laquo; l&apos;Organisateur &raquo;) et toute personne physique (ci-après &laquo; le Participant &raquo;) souhaitant participer à un camp d&apos;entraînement organisé par MKR Caucasian Camp.</p>

          <h2>Article 2 : Inscription et validation</h2>
          <p>L&apos;inscription se fait via le formulaire en ligne sur mkrcamp.com. Toute candidature est soumise à validation par l&apos;équipe MKR lors d&apos;un entretien téléphonique ou vidéo. L&apos;Organisateur se réserve le droit de refuser toute candidature sans justification.</p>

          <h2>Article 3 : Tarifs et paiement</h2>
          <p>Les tarifs sont indiqués en euros (EUR) sur la page Sessions du site et appliqués selon la grille publique suivante (par adulte, sans réduction discrétionnaire) :</p>
          <ul>
            <li><strong>1 à 2 personnes</strong> (Solo / Duo) : {DUO_ONE_LINE_BARE} par adulte.</li>
            <li><strong>3 à 5 personnes</strong> (Trio à 5) : {TRIO_ONE_LINE_BARE} par adulte.</li>
            <li><strong>6 à 10 personnes</strong> (Club / Groupe) : {CLUB_ONE_LINE_BARE} par adulte.</li>
            <li><strong>11 personnes et plus / salle entière privatisée</strong> : tarif sur devis personnalisé.</li>
            <li><strong>Forfait Famille (1 parent + 1 enfant inclus)</strong> : {FAMILY_BASE_PROSE}. Chaque enfant supplémentaire : {FAMILY_EXTRA_CHILD_FULL}.</li>
            <li><strong>Famille avec 2 parents participants</strong> : tarif Solo / Duo appliqué aux deux parents ({formatEUR(PRICING_TIERS.duo.perAdult[1])} / pers / sem) + {formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} par enfant et par semaine.</li>
          </ul>
          <p>Aucun paiement n&apos;est demandé au moment de l&apos;inscription en ligne. Le paiement intégral du package est dû après l&apos;entretien de validation en visioconférence avec l&apos;équipe MKR. Les coordonnées bancaires (RIB) sont communiquées au candidat à l&apos;issue de cet entretien.</p>
          <p>Moyens de paiement acceptés : virement bancaire ou espèces. Toute autre modalité est étudiée au cas par cas.</p>

          <h2>Article 4 : Politique d&apos;annulation</h2>
          <ul>
            <li>Plus de 60 jours avant le début : remboursement intégral (100%)</li>
            <li>Entre 30 et 60 jours : remboursement partiel (50%)</li>
            <li>Moins de 30 jours : aucun remboursement</li>
          </ul>
          <p>Le report sur une session ultérieure est possible sous réserve de disponibilité, si la demande est faite plus de 60 jours avant le début du camp.</p>

          <h2>Article 5 : Prestations incluses</h2>
          <p>Le tarif du camp comprend :</p>
          <ul>
            <li><strong>Visa russe</strong> : frais consulaires, lettre d&apos;invitation officielle, questionnaire UE et accompagnement complet du dossier</li>
            <li><strong>Vol intérieur</strong> Istanbul-Makhachkala (pour le camp Lutte au Daghestan) ou Istanbul-Grozny (pour le camp MMA en Tchétchénie)</li>
            <li>Transferts aéroport-camp et déplacements pendant le séjour</li>
            <li>Hébergement en logement de camp</li>
            <li>2 repas par jour (petit-déjeuner et déjeuner)</li>
            <li>Sessions d&apos;entraînement biquotidiennes (6 jours par semaine)</li>
            <li>Excursions culturelles (en option)</li>
            <li>Suivi préparatoire à distance avant le départ</li>
          </ul>

          <h2>Article 6 : Prestations non incluses</h2>
          <ul>
            <li><strong>Vol international aller-retour jusqu&apos;à Istanbul</strong> : à réserver librement par le Participant. Le vol doit arriver à Istanbul (IST ou SAW) au moins 4 heures avant l&apos;horaire du vol intérieur MKR. MKR communique l&apos;horaire du vol intérieur dès la validation de la candidature.</li>
            <li>Assurance voyage couvrant le rapatriement médical et la pratique de sports de contact (obligatoire, à souscrire par le Participant)</li>
            <li>Équipement personnel (gants, protège-tibias, protège-dents, coquille)</li>
            <li>Dépenses personnelles sur place (boissons, achats, pourboires, communication mobile)</li>
            <li>Frais éventuels liés au passeport (renouvellement, etc.)</li>
          </ul>

          <h2>Article 6 bis : Supplément traitement express (candidatures à moins de 30 jours du départ)</h2>
          <p>Pour toute candidature acceptée à moins de trente (30) jours du début du camp, MKR applique un supplément forfaitaire de traitement express. Ce supplément couvre la procédure visa accélérée, la sécurisation du vol intérieur en haute-saison et la coordination logistique en délai contraint.</p>
          <p>Le montant du supplément est communiqué au Participant lors de l&apos;entretien de validation, en fonction de la date de départ et de la complexité du dossier. Il est dû en sus du tarif du package et s&apos;ajoute au paiement intégral après validation.</p>
          <p>L&apos;Organisateur se réserve le droit de refuser une candidature reçue à moins de trente (30) jours du départ si les délais administratifs (visa, vol intérieur) ne peuvent être tenus dans des conditions raisonnables.</p>

          <h2>Article 7 : Assurance</h2>
          <p>Le Participant est tenu de souscrire une assurance voyage couvrant le rapatriement médical et la pratique de sports de contact avant le départ. La preuve d&apos;assurance doit être fournie à l&apos;Organisateur au plus tard 15 jours avant le départ.</p>

          <h2>Article 8 : Responsabilité</h2>
          <p>Le Participant reconnaît participer au camp de sa propre initiative et en pleine connaissance des risques liés à la pratique de sports de combat. L&apos;Organisateur décline toute responsabilité en cas de blessure survenue lors des entraînements ou activités annexes.</p>

          <h2>Article 9 : Droit à l&apos;image</h2>
          <p>Le Participant autorise l&apos;Organisateur à utiliser les photos et vidéos prises pendant le camp à des fins de communication et de promotion, sauf opposition écrite préalable. Pour les mineurs, l&apos;autorisation est donnée par le responsable légal lors de l&apos;inscription.</p>

          <h2>Article 10 : Mineurs et autorisation parentale</h2>
          <p>Les enfants et adolescents de 8 à 17 ans sont admis au camp <strong>uniquement accompagnés d&apos;un parent ou responsable légal participant lui-même au camp</strong>. L&apos;Organisateur n&apos;assure pas la prise en charge d&apos;un mineur seul.</p>
          <p>L&apos;inscription d&apos;un mineur nécessite :</p>
          <ul>
            <li>Une autorisation parentale signée par le responsable légal au moment de l&apos;inscription</li>
            <li>Un certificat médical d&apos;aptitude à la pratique sportive intensive datant de moins de 6 mois avant le départ, établi par le médecin traitant</li>
            <li>Une copie du passeport du mineur (validité minimum 6 mois après la date de retour)</li>
            <li>Une procuration médicale autorisant l&apos;Organisateur et son équipe médicale locale à prendre les mesures d&apos;urgence nécessaires</li>
            <li>L&apos;assurance voyage doit explicitement couvrir le mineur, le rapatriement médical et la pratique de sports de contact pour mineurs</li>
          </ul>
          <p>Le parent ou responsable légal accompagnant demeure pleinement responsable du mineur pendant toute la durée du séjour, y compris en dehors des sessions d&apos;entraînement encadrées par MKR. L&apos;Organisateur fournit un encadrement spécialisé pendant les sessions Lutte enfants (coach jeunesse dédié, ratio 1 coach pour 5 enfants maximum, supervision constante).</p>

          <h2>Article 11 : Droit applicable et résolution des litiges</h2>
          <p>Les présentes Conditions Générales de Vente sont régies par le droit français. La langue contractuelle est le français.</p>
          <p>Avant toute action contentieuse, le Client est invité à contacter MKR Caucasian Camp via le <a href="/contact">formulaire de contact</a> afin de tenter une résolution amiable du différend.</p>
          <p>Conformément aux articles L611-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige. Les coordonnées du médiateur compétent sont communiquées sur demande via le <a href="/contact">formulaire de contact</a>. Le Client peut également utiliser la plateforme européenne de règlement en ligne des litiges accessible à l&apos;adresse <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.</p>
          <p>À défaut de résolution amiable, tout litige relatif à la formation, à l&apos;exécution ou à l&apos;interprétation des présentes CGV sera porté devant les tribunaux français compétents. Pour les Clients consommateurs, le tribunal compétent est celui du lieu de résidence du consommateur ou du lieu d&apos;exécution de la prestation, conformément aux articles L211-3 et suivants du Code de la consommation et à l&apos;article R631-3 du même Code. Pour les Clients professionnels, le tribunal compétent est celui du siège social de MKR Caucasian Camp.</p>

          <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>Dernière mise à jour : 14 mai 2026</p>
        </div>
      </div>
    </section>
  )
}
