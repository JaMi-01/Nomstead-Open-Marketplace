/** Helper utilities for marketplace data (v4.4.3)
 *  Display now uses object.metadata.title instead of prettified slug
 */

/** Extract readable title for display */
export function getDisplayName(obj) {
  if (obj?.metadata?.title) return obj.metadata.title.trim();
  if (obj?.slug) return obj.slug.replace(/-/g, ' ');
  return 'Unknown Item';
}

/** Determine general type from category or slug */
export function detectType(category, slug) {
  const c = category?.toLowerCase() || '';
  const s = slug?.toLowerCase() || '';
  if (c.includes('recipe') || s.includes('recipe')) return 'recipe';
  if (c.includes('seed') || s.includes('seed')) return 'seed';
  if (c.includes('resource') || s.includes('resource')) return 'resource';
  if (c.includes('material') || s.includes('material')) return 'material';
  return 'object';
}

/**
 * Group raw API data by category/subcategory
 * Returns grouped[category][subCategory] = [items]
 */
export function groupItems(raw, detectFn = detectType) {
  const map = {};

  const add = (entry, type) => {
    const obj = entry.object || {};
    const slug = obj.slug || 'unknown';
    const category = obj.category || 'Misc';
    const sub = obj.subCategory || 'General';
    const detectedType = detectFn(category, slug);
    const key = `${slug}_${detectedType}`;

    if (!map[key]) {
      map[key] = {
        slug,
        name: getDisplayName(obj), // 👈 now uses metadata.title
        category,
        subCategory: sub,
        type: detectedType,
        image: obj.imageUrl || obj.thumbnailImageUrl || '',
        buyOffers: [],
        sellOffers: []
      };
    }

    const offer = {
      unitPrice: Number(entry.pricing?.unitPrice ?? 0),
      quantity:
        type === 'buy'
          ? Number(entry.pricing?.availableQuantity ?? 0)
          : Number(entry.pricing?.desiredQuantity ?? 0),
      kingdomUrl: entry.tile?.url || '#',
      kingdomName: entry.tile?.owner || 'kingdom'
    };

    if (type === 'buy') map[key].buyOffers.push(offer);
    else map[key].sellOffers.push(offer);
  };

  (raw.toBuy || []).forEach(e => add(e, 'buy'));
  (raw.toSell || []).forEach(e => add(e, 'sell'));

  const byCat = {};
  Object.values(map).forEach(it => {
    const cat = it.category || 'Misc';
    const sub = it.subCategory || 'General';
    byCat[cat] ??= {};
    byCat[cat][sub] ??= [];
    byCat[cat][sub].push(it);
  });

  return byCat;
}