export interface ProductRec {
  name: string;
  url: string;
  price: string;
}

const PRODUCT_MAP: { keywords: string[]; product: ProductRec }[] = [
  { keywords: ['retinol', 'cell turnover'], product: { name: 'Retinol Serum', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$12.99' } },
  { keywords: ['vitamin c', 'brightens', 'dark spots'], product: { name: 'Vitamin C Serum', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$14.99' } },
  { keywords: ['spf', 'sun damage', 'sunscreen'], product: { name: 'SPF 50 Sunscreen', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$11.99' } },
  { keywords: ['mewing', 'jawline', 'masseter', 'mastic gum', 'chew'], product: { name: 'Mastic Gum Pack', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$19.99' } },
  { keywords: ['caffeine eye', 'under-eye', 'de-puff', 'dark circles', 'puffiness'], product: { name: 'Caffeine Eye Cream', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$13.99' } },
  { keywords: ['blue light glass', 'screen'], product: { name: 'Blue Light Glasses', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$16.99' } },
  { keywords: ['castor oil', 'lash'], product: { name: 'Castor Oil for Lashes', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$8.99' } },
  { keywords: ['double cleansing', 'oil cleanser', 'cleanser'], product: { name: 'Oil Cleanser Set', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$15.99' } },
  { keywords: ['derma roll', 'collagen'], product: { name: 'Derma Roller 0.5mm', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$9.99' } },
  { keywords: ['posture', 'chin tuck', 'neck'], product: { name: 'Posture Corrector', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$18.99' } },
  { keywords: ['eyebrow', 'brow'], product: { name: 'Brow Grooming Kit', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$10.99' } },
  { keywords: ['bronzer', 'contour'], product: { name: 'Contour Bronzer', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$12.99' } },
  { keywords: ['facial massage', 'lymph', 'gua sha'], product: { name: 'Gua Sha Stone', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$7.99' } },
];

const FALLBACK: ProductRec = { name: 'Skincare Essentials Kit', url: 'https://amazon.com/dp/placeholder?tag=auracheck-20', price: '$24.99' };

export function getProductForTip(tip: string): ProductRec {
  const lower = tip.toLowerCase();
  for (const entry of PRODUCT_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.product;
    }
  }
  return FALLBACK;
}
