// Node 18+ required (global fetch).
// Usage: node scripts/extractCraftFromWiki.mjs
// Output: app/data/craftRecipes.json

import { writeFile } from 'node:fs/promises';

const WIKI_URL = 'https://nomsteadwiki.web.id/items';

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/__+/g, '_')
    .trim();
}

// More robust extraction:
// 1) Find all <h3>Title</h3>
// 2) For each, look ahead in the following HTML for "Required Materials"
// 3) Capture "Name: Number" pairs and optional "Produces: X units"
function extractRecipes(html) {
  const recipes = [];

  // Global match for <h3>...title...</h3>
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gis;
  let h3Match;

  while ((h3Match = h3Regex.exec(html)) !== null) {
    const titleRaw = h3Match[1] || '';
    const title = titleRaw.replace(/<[^>]*>/g, '').trim();
    if (!title) continue;

    // Slice of content after this <h3> to search for materials
    // Look ahead a reasonable window (page is long; 2000 chars is safe)
    const sectionStart = h3Regex.lastIndex;
    const section = html.slice(sectionStart, sectionStart + 4000);

    // Find "Required Materials" marker (h4, strong, or plain text)
    const reqIdx = section.toLowerCase().indexOf('required materials');
    if (reqIdx === -1) continue;

    const afterReq = section.slice(reqIdx, reqIdx + 2000);

    // Capture "Name: 123" lines; tolerate tags and breaks between
    const materialPairs = [];
    const lineRegex = /([A-Za-z0-9 \-\(\)]+)\s*:\s*([0-9]+)/g;
    let m;
    while ((m = lineRegex.exec(afterReq)) !== null) {
      const matName = m[1].replace(/<[^>]*>/g, '').trim();
      const qty = Number(m[2]);
      if (!matName || !Number.isFinite(qty)) continue;
      materialPairs.push({ name: matName, quantity: qty });
    }

    if (materialPairs.length === 0) continue;

    // Optional "Produces: X units"
    let producesUnits = 1;
    const producesMatch = section.match(/Produces:\s*([0-9]+)\s*units/i);
    if (producesMatch) {
      producesUnits = Number(producesMatch[1]);
    }

    const outputSlug = toSlug(title);
    const inputs = materialPairs.map(p => ({
      slug: toSlug(p.name),
      name: p.name,
      quantity: p.quantity
    }));

    recipes.push({
      output: { slug: outputSlug, quantity: producesUnits },
      inputs
    });
  }

  // Deduplicate by output.slug (keep first occurrence)
  const seen = new Set();
  const deduped = [];
  for (const r of recipes) {
    if (seen.has(r.output.slug)) continue;
    seen.add(r.output.slug);
    deduped.push(r);
  }
  return deduped;
}

async function run() {
  const res = await fetch(WIKI_URL, { headers: { 'User-Agent': 'Nomstead Importer/1.0' } });
  if (!res.ok) {
    console.error('Failed to fetch wiki:', res.status, res.statusText);
    process.exit(1);
  }
  const html = await res.text();

  const recipes = extractRecipes(html);
  const outPath = 'app/data/craftRecipes.json';
  await writeFile(outPath, JSON.stringify(recipes, null, 2), 'utf8');
  console.log(`Wrote ${recipes.length} recipes → ${outPath}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
