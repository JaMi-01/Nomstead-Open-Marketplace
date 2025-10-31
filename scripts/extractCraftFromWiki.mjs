// Node 18+ required (global fetch).
// Usage: node scripts/extractCraftFromWiki.mjs
// Output: app/data/craftRecipes.json

import { writeFile } from 'node:fs/promises';

const WIKI_URL = 'https://nomsteadwiki.web.id/items';

// Convert display name to a slug similar to API slugs
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/__+/g, '_')
    .trim();
}

// Extract item sections and parse "Required Materials" blocks
function extractSections(html) {
  const blocks = html.split(/<h3[^>]*>|<\/h3>/i);
  const results = [];

  for (let i = 1; i < blocks.length; i += 2) {
    const titleHtml = blocks[i];
    const rest = blocks[i + 1] || '';

    const titleMatch = titleHtml.match(/>([^<]+)</);
    const title = titleMatch ? titleMatch[1].trim() : null;
    if (!title) continue;

    const reqIdx = rest.toLowerCase().indexOf('required materials');
    if (reqIdx === -1) continue;

    const slice = rest.slice(reqIdx, reqIdx + 2000);

    // Lines like: "Wood Plank: 200", "Ingot Iron: 10"
    const matMatches = Array.from(slice.matchAll(/([A-Za-z0-9 \-\(\)]+)\s*:\s*([0-9]+)/g));
    if (matMatches.length === 0) continue;

    // Optional "Produces: X units"
    let producesUnits = 1;
    const producesMatch = rest.match(/Produces:\s*([0-9]+)\s*units/i);
    if (producesMatch) {
      producesUnits = Number(producesMatch[1]);
    }

    const outputSlug = toSlug(title);
    const inputs = matMatches.map((m) => {
      const matName = m[1].trim();
      const qty = Number(m[2]);
      return { slug: toSlug(matName), name: matName, quantity: qty };
    });

    results.push({
      output: { slug: outputSlug, quantity: producesUnits },
      inputs
    });
  }

  return results;
}

async function run() {
  const res = await fetch(WIKI_URL, { headers: { 'User-Agent': 'Nomstead Importer/1.0' } });
  if (!res.ok) {
    console.error('Failed to fetch wiki:', res.status, res.statusText);
    process.exit(1);
  }
  const html = await res.text();

  const recipes = extractSections(html);

  // Deduplicate by output slug
  const seen = new Set();
  const deduped = [];
  for (const r of recipes) {
    if (seen.has(r.output.slug)) continue;
    seen.add(r.output.slug);
    deduped.push(r);
  }

  const outPath = 'app/data/craftRecipes.json';
  await writeFile(outPath, JSON.stringify(deduped, null, 2), 'utf8');
  console.log(`Wrote ${deduped.length} recipes → ${outPath}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
