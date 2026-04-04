import Link from 'next/link'
import type { Metadata } from 'next'
import SectionCTA from '@/components/SectionCTA'
import Breadcrumb from '@/components/Breadcrumb'

// Placeholder article data
const ARTICLE = {
  title: 'Pourquoi le Dagestan domine le MMA mondial',
  date: '15 mars 2026',
  readTime: '8 min',
  content: `
    <p>Le Dagestan, petite republique du Caucase russe, a produit plus de champions de combat par habitant que n'importe quel autre endroit sur Terre. Ce n'est pas un hasard.</p>

    <h2>UNE CULTURE DU COMBAT</h2>
    <p>Dans les villages de montagne du Dagestan, la lutte n'est pas un sport. C'est un rite de passage. Des l'age de 5-6 ans, les garcons sont inscrits dans les salles locales. La competition commence tot, et seuls les plus determines progressent.</p>

    <blockquote><p>La difference entre un athlete occidental et un athlete daghestanais, c'est que le Daghestanais s'entraine comme s'il se battait pour sa vie. Parce que historiquement, c'etait le cas.</p></blockquote>

    <h2>LE SYSTEME D'ENTRAINEMENT</h2>
    <p>Le systeme d'entrainement daghestanais repose sur trois piliers : la repetition, le sparring reel, et la competition permanente. Pas de simulation, pas de drills vides. Chaque session est une mise en situation reelle.</p>

    <h3>LA REPETITION</h3>
    <p>Une technique n'est consideree comme acquise qu'apres des milliers de repetitions. Les coachs locaux ne passent a la suite que lorsque le geste est devenu un reflexe.</p>

    <h3>LE SPARRING REEL</h3>
    <p>Au Dagestan, le sparring n'est pas un exercice de style. C'est un combat controle mais intense. Les partenaires ne font pas semblant, et c'est cette intensite qui forge des combattants capables de gerer la pression en competition.</p>

    <h2>CE QUE MKR T'APPORTE</h2>
    <p>Le camp MKR te donne acces a ces methodes. Pendant 3 semaines, tu t'entraines avec les memes coachs, dans les memes salles, avec les memes methodes qui ont produit les champions. C'est un raccourci que tu ne trouveras nulle part ailleurs.</p>
  `,
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${ARTICLE.title} | MKR Caucasian Camp`,
    description: ARTICLE.content.replace(/<[^>]*>/g, '').substring(0, 160),
    alternates: { canonical: `https://mkrcaucasiancamp.com/blog/${slug}` },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  await params // consume the promise
  return (
    <>
      <article className="blog-article">
        <div className="inner">
          <Breadcrumb items={[
            { href: '/blog', label: 'Blog' },
            { href: '#', label: ARTICLE.title },
          ]} />
          <div className="blog-article-meta">
            <span>{ARTICLE.date}</span>
            <span>·</span>
            <span>{ARTICLE.readTime} de lecture</span>
          </div>
          <h1 className="blog-article-title">{ARTICLE.title}</h1>
          <div style={{ aspectRatio: '21/9', background: 'var(--surface)', marginBottom: '3rem', maxHeight: '480px' }} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: ARTICLE.content }} />
        </div>
      </article>

      {/* CTA fin d'article */}
      <section className="logi-section">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <h2>PRET A PASSER A L&apos;ACTION ?</h2>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sessions" className="btn-primary">VOIR LES SESSIONS</Link>
              <Link href="/inscription" className="btn-ghost">S&apos;INSCRIRE</Link>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/blog"
        primaryLabel="TOUS LES ARTICLES"
      />
    </>
  )
}
