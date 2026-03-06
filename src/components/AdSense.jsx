import { useEffect } from 'react';

/**
 * Composant pour afficher une annonce AdSense
 * @param {string} format - Format de l'annonce ('horizontal', 'vertical', 'square', 'responsive')
 * @param {string} slot - ID du slot AdSense
 */
function AdSense({ format = 'responsive', slot = '1234567890' }) {
  useEffect(() => {
    try {
      // Pousser une nouvelle annonce si le script AdSense est chargé
      if (window.adsbygoogle && window.adsbygoogle.length > 0) {
        window.adsbygoogle.push({});
      }
    } catch {
      console.log('AdSense not loaded yet');
    }
  }, []);

  const getAdStyle = () => {
    switch (format) {
      case 'horizontal':
        return { display: 'block', textAlign: 'center', minHeight: '100px' };
      case 'vertical':
        return { display: 'inline-block', width: '300px', minHeight: '600px' };
      case 'square':
        return { display: 'inline-block', width: '300px', height: '250px' };
      case 'responsive':
      default:
        return { display: 'block', textAlign: 'center', minHeight: '100px' };
    }
  };

  return (
    <div className="adsense-container" style={{ margin: '1rem 0' }}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-3185416709429781"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

export default AdSense;


