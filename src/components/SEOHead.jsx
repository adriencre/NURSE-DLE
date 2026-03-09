import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://nurse-dle.netlify.app';

const defaultSEO = {
  title: 'Nurse-dle — Le jeu quotidien de devinette de pathologies pour étudiants infirmiers',
  description: 'Testez vos connaissances médicales en devinant les pathologies du jour ! 4 modes de jeu, 210+ pathologies, défis quotidiens pour étudiants infirmiers.',
  image: `${BASE_URL}/og-image.png`,
};

function SEOHead({ title, description, path = '/' }) {
  const seoTitle = title || defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
    </Helmet>
  );
}

export default SEOHead;

