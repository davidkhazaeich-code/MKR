import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Icon from './Icon'
import { WHATSAPP } from '@/data/site'

export default function Footer() {
  const t = useTranslations('common.footer')

  return (
    <>
      {/* Transition line */}
      <div className="footer-transition" aria-hidden="true">
        <div className="footer-transition-line"></div>
      </div>

      <footer id="footer" aria-label={t('aria')}>

        {/* Contact strip */}
        <div className="footer-contact">
          <div className="footer-contact-inner">
            <div className="footer-contact-left">
              <span className="footer-contact-eyebrow">{t('contact_eyebrow')}</span>
              <h2 className="footer-contact-heading">{t('contact_heading')}</h2>
            </div>
            <div className="footer-contact-right">
              <a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer"
                className="footer-contact-link" aria-label={t('contact_whatsapp_aria')}>
                <Icon name="whatsapp" size={18} />
                {WHATSAPP.display}
              </a>
              <Link href="/contact" className="footer-contact-link" aria-label={t('contact_form_aria')}>
                <Icon name="mail" size={18} />
                {t('contact_form_label')}
              </Link>
              <Link href="/inscription" className="footer-contact-cta">{t('contact_cta')}</Link>
            </div>
          </div>
        </div>

        {/* Main columns */}
        <div className="footer-cols">

          {/* Brand */}
          <div>
            <Link href="/" className="footer-logo-link" aria-label={t('logo_home_aria')}>
              <Image src="/logo-white.webp" alt={t('logo_alt')} className="footer-logo-img" width={320} height={193} />
            </Link>
            <p className="footer-tagline">{t('tagline')}</p>
            <p className="footer-desc">
              {t('description')}
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com/mkrcamp" target="_blank" rel="noopener noreferrer"
                className="footer-social-link" aria-label={t('social_instagram_aria')}>
                <Icon name="instagram" size={18} />
                {t('social_instagram_label')}
              </a>
            </div>
          </div>

          {/* Nos Camps */}
          <div>
            <span className="footer-col-label">{t('col_camps_label')}</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/mkr-camp-2026" className="accent">{t('col_camps.mkr_2026')}</Link></li>
              <li><Link href="/sur-mesure">{t('col_camps.sur_mesure')}</Link></li>
              <li><Link href="/familles">{t('col_camps.famille')}</Link></li>
              <li><Link href="/clubs-groupes">{t('col_camps.clubs_groupes')}</Link></li>
              <li><Link href="/sessions">{t('col_camps.tarifs')}</Link></li>
              <li><Link href="/comment-ca-marche">{t('col_camps.comment_ca_marche')}</Link></li>
            </ul>
          </div>

          {/* Programmes */}
          <div>
            <span className="footer-col-label">{t('col_programmes_label')}</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/programme/mma">{t('col_programmes.mma')}</Link></li>
              <li><Link href="/programme/lutte">{t('col_programmes.lutte_adultes')}</Link></li>
              <li><Link href="/programme/lutte-enfants">{t('col_programmes.lutte_enfants')}</Link></li>
              <li><Link href="/destinations/dagestan">{t('col_programmes.dagestan')}</Link></li>
              <li><Link href="/destinations/tchetchenie">{t('col_programmes.tchetchenie')}</Link></li>
              <li><Link href="/le-camp">{t('col_programmes.le_camp')}</Link></li>
              <li><Link href="/preparer-son-camp">{t('col_programmes.preparer_son_camp')}</Link></li>
              <li><Link href="/logistique">{t('col_programmes.logistique')}</Link></li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <span className="footer-col-label">{t('col_infos_label')}</span>
            <ul className="footer-nav-list" role="list">
              <li><Link href="/galerie">{t('col_infos.galerie')}</Link></li>
              <li><Link href="/temoignages">{t('col_infos.temoignages')}</Link></li>
              <li><Link href="/faq">{t('col_infos.faq')}</Link></li>
              <li><Link href="/blog">{t('col_infos.blog')}</Link></li>
              <li><Link href="/a-propos">{t('col_infos.a_propos')}</Link></li>
              <li><Link href="/contact">{t('col_infos.contact')}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span className="footer-copy">{t('copyright_prefix')} <a href="https://dkdp.ch" target="_blank" rel="noopener noreferrer" className="footer-dkdp">{t('copyright_dkdp')}</a></span>
            <nav className="footer-legal" aria-label={t('legal_aria')}>
              <Link href="/mentions-legales">{t('legal.mentions')}</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/cgv">{t('legal.cgv')}</Link>
              <span className="footer-legal-dot" aria-hidden="true">·</span>
              <Link href="/politique-de-confidentialite">{t('legal.confidentialite')}</Link>
            </nav>
          </div>
        </div>

      </footer>
    </>
  )
}
