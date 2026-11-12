
const KEY_ID = 'ruAnq82VlEjc';       // regenerate after testing, don't hardcode long-term
 const KEY_SECRET = '0c09e41a-9e3d-48ee-bac7-aa4e428b02bd';

// ===== YOUR SOIL TABLES (unchanged) =====

// The healthy moisture % range for each soil type
const soilTypeMoistureRanges = {
  sandy:  { min: 20, max: 35 },
  chalky: { min: 23, max: 42 },
  loamy:  { min: 29, max: 48 },
  silty:  { min: 38, max: 55 },
  clay:   { min: 40, max: 60 },
  peaty:  { min: 49, max: 77 },
};

// How many days between waterings for each soil type
const wateringInterval = {
  sandy: 2,
  chalky: 3,
  loamy: 4,
  silty: 5,
  clay: 6,
  peaty: 7,
};

// Used by the picker on the Input screen
export const SOIL_TYPES = ['sandy', 'chalky', 'loamy', 'silty', 'clay', 'peaty'];

// Your soils -> the 3 groups the API uses ("Light", "Medium", "Heavy")
const soilCategory = {
  sandy:  'light',
  chalky: 'medium',
  loamy:  'medium',
  silty:  'medium',
  peaty:  'medium',
  clay:   'heavy',
};

// ===== PLANT LOOKUP (Permapeople API) =====

// Used when the plant can't be found, so the app still works
const emptyProfile = (plantName) => ({
  found: false,
  waterKnown: false,
  name: plantName,
  scientificName: null,
  image: null,
  description: null,
  water: null,
  light: null,
  soilTolerance: null,
  hardiness: null,
  height: null,
  warning: null,
  modifier: 1.0,       // changes the healthy moisture range
  intervalFactor: 1.0, // changes the days between waterings
});

// Read one field from the API's "data" array (case-insensitive key)
function getField(data, key) {
  const item = (data || []).find(
    (d) => (d.key || '').toLowerCase() === key.toLowerCase()
  );
  return item ? String(item.value).trim() : null;
}

// Turn the API's water text into numbers.
//  modifier       -> multiplies your soil moisture range
//  intervalFactor -> multiplies your soil watering interval
function mapWaterRequirement(value) {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.includes('wet'))                       return { modifier: 1.3, intervalFactor: 0.6 };
  if (v.includes('dry') && !v.includes('moist')) return { modifier: 0.5, intervalFactor: 1.8 };
  if (v.includes('moist'))                     return { modifier: 1.0, intervalFactor: 1.0 };
  return null;
}

// Higher score = better match for what the user typed
function scorePlant(p, query) {
  const name = (p.name || '').toLowerCase();
  const sci = (p.scientific_name || '').toLowerCase();
  let score = 0;
  if (name === query) score += 50;                 // exact name
  else if (name.startsWith(query)) score += 20;    // "Tomato ..." beats "Cherry tomato"
  if (sci.includes(query)) score += 5;
  if (p.type === 'Plant') score += 15;             // main plant, not a variety
  if (getField(p.data, 'Water requirement')) score += 30; // has the data we need
  score -= name.length * 0.1;                      // prefer shorter names
  return score;
}

async function postSearch(query) {
  try {
    console.log('SEARCHING FOR:', query);
    console.log('KEY ID:', KEY_ID);
    console.log('SECRET EXISTS:', !!KEY_SECRET);

    const res = await fetch('https://permapeople.org/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-permapeople-key-id': KEY_ID,
        'x-permapeople-key-secret': KEY_SECRET,
      },
      body: JSON.stringify({
        q: query,
      }),
    });

    console.log('STATUS:', res.status);

    const text = await res.text();

    console.log('RAW RESPONSE:', text);

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status} - ${text}`);
    }

    return JSON.parse(text);

  } catch (error) {
    console.log('POST SEARCH ERROR:', error);
    throw error;
  }
}
// Call this ONCE per analysis. Returns a clean profile object.
export async function fetchPlantProfile(plantName) {
  const query = (plantName || '').trim().toLowerCase();
  if (!query) return emptyProfile(plantName);

  try {
    const json = await postSearch(query);
    const plants = json.plants || [];

    // keep only results that really match what was typed
    const candidates = plants.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.scientific_name || '').toLowerCase().includes(query)
    );
    if (candidates.length === 0) return emptyProfile(plantName);

    candidates.sort((a, b) => scorePlant(b, query) - scorePlant(a, query));
    const best = candidates[0];

    // Varieties often have no data, so borrow it from the parent plant
    let dataSource = best;
    if (!getField(best.data, 'Water requirement') && best.parent_id) {
      const parent = plants.find((p) => p.id === best.parent_id);
      if (parent) dataSource = parent;
    }

    const water = getField(dataSource.data, 'Water requirement');
    const mapped = mapWaterRequirement(water);
    const image = best.images && best.images.thumb;
    const description = (best.description || dataSource.description || '').trim();

    return {
      found: true,
      waterKnown: !!mapped,
      name: best.name,
      scientificName: best.scientific_name,
      image: image && !image.includes('blank') ? image : null,
      description: description ? description.split('\n')[0] : null, // first paragraph only
      water,
      light: getField(dataSource.data, 'Light requirement'),
      soilTolerance: getField(dataSource.data, 'Soil type'),
      hardiness: getField(dataSource.data, 'USDA Hardiness zone'),
      height: getField(dataSource.data, 'Height'),
      warning: getField(dataSource.data, 'Warning'),
      modifier: mapped ? mapped.modifier : 1.0,
      intervalFactor: mapped ? mapped.intervalFactor : 1.0,
    };
  } catch (e) {
    console.log('Plant lookup failed:', e.message);
    return { ...emptyProfile(plantName), error: true };
  }
}

// ===== SOIL COMPATIBILITY (API soil list vs the user's soil) =====
// Returns null if the API has no soil info for this plant.
export function getSoilCompatibility(soilType, profile) {
  if (!profile || !profile.soilTolerance) return null;
  const soilKey = (soilType || '').trim().toLowerCase();
  const category = soilCategory[soilKey];
  if (!category) return null;

  const tolerated = profile.soilTolerance.toLowerCase();
  const ok = tolerated.includes(category);
  const label = soilKey.charAt(0).toUpperCase() + soilKey.slice(1);

  return ok
    ? { ok: true, message: `${profile.name} tolerates ${label} soil.` }
    : {
        ok: false,
        message: `${profile.name} prefers ${profile.soilTolerance.toLowerCase()} soil, so ${label} soil may not suit it. Water carefully.`,
      };
}

// ===== HEALTH CHECK (now takes the profile, no extra API call) =====
export function getPlantHealth(moisture, soilType, profile) {
  const soilKey = (soilType || '').trim().toLowerCase();
  const soilRange = soilTypeMoistureRanges[soilKey] || soilTypeMoistureRanges.loamy;
  const modifier = profile ? profile.modifier : 1.0;

  const range = {
    min: Math.round(soilRange.min * modifier),
    max: Math.round(soilRange.max * modifier),
  };

  let result;
  if (moisture < range.min * 0.5) {
    result = { status: 'Critical', message: 'Your plant needs water immediately!', color: '#e74c3c' };
  } else if (moisture < range.min) {
    result = { status: 'Low', message: 'Water soon.', color: '#f39c12' };
  } else if (moisture > range.max) {
    result = { status: 'Overwatered', message: 'Hold off watering for now.', color: '#3498db' };
  } else {
    result = { status: 'Healthy', message: 'Moisture level looks good!', color: '#27ae60' };
  }

  return { ...result, range };
}

// ===== WATERING CALENDAR =====
// Soil sets the base interval, the plant's water need stretches or shrinks it.
function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateWateringSchedule(soilType, profile, startDate = new Date(), rainForecast = []) {
  const soilKey = (soilType || '').trim().toLowerCase();
  const soilInterval = wateringInterval[soilKey] || 3;
  const factor = profile ? profile.intervalFactor : 1.0;
  const interval = Math.max(1, Math.round(soilInterval * factor));

  const schedule = [];
  for (let i = 0; i < 30; i += interval) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const rainChance = rainForecast[i];
    const skip = rainChance && rainChance > 60;
    schedule.push({
      date: toLocalDateString(date),
      action: skip ? 'Skip (rain expected)' : 'Water',
    });
  }
  return { interval, schedule };
}