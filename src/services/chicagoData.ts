export interface BenchmarkingData {
  id: string;
  row_id: string;
  property_name: string;
  address: string;
  primary_property_type: string;
  year_built: string;
  gross_floor_area_buildings_sq_ft: string;
  energy_star_score?: string;
  site_eui_kbtu_sq_ft: string;
  source_eui_kbtu_sq_ft: string;
  electricity_use_kbtu?: string;
  natural_gas_use_kbtu?: string;
  total_ghg_emissions_metric_tons_co2e: string;
  latitude?: string;
  longitude?: string;
  location?: {
    latitude: string;
    longitude: string;
  };
  data_year?: string;
  community_area?: string;
}

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getNeighborhoodData(lat: string, lon: string, radiusMeters: number = 400): Promise<BenchmarkingData[]> {
  if (!lat || !lon) return [];
  
  // Fetch up to 100 buildings within the radius to ensure we have enough for comparison
  const whereClause = `within_circle(location,${lat},${lon},${radiusMeters})`;
  const url = `https://data.cityofchicago.org/resource/xq83-jr8c.json?$where=${encodeURIComponent(whereClause)}&$limit=100&$order=${encodeURIComponent('data_year DESC')}`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 10000 });
    if (!response.ok) {
      console.error(`Neighborhood data fetch failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json() as BenchmarkingData[];
    
    // Deduplicate to get only the most recent data for each building
    const unique = new Map<string, BenchmarkingData>();
    data.forEach((b) => {
      // Ensure latitude and longitude are set from location object if missing
      if (!b.latitude && b.location?.latitude) b.latitude = b.location.latitude;
      if (!b.longitude && b.location?.longitude) b.longitude = b.location.longitude;
      
      const key = b.row_id || b.id || b.address;
      if (!unique.has(key) || (parseInt(b.data_year || '0') > parseInt(unique.get(key)!.data_year || '0'))) {
        unique.set(key, b);
      }
    });
    
    return Array.from(unique.values());
  } catch (error) {
    console.error('Error fetching neighborhood data:', error);
    return [];
  }
}

export interface ChicagoBuildingDetails {
  address: string;
  building_id: string;
  year_built?: string;
  no_of_stories?: string;
  total_units?: string;
  property_class?: string;
}

export interface ResidentialData {
  account_number: string;
  site_number: string;
  legal_name: string;
  doing_business_as_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  license_status: string;
  license_description: string;
  latitude?: string;
  longitude?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

export async function getResidentialData(lat: string, lon: string, radiusMeters: number = 400): Promise<ResidentialData[]> {
  if (!lat || !lon) return [];
  
  const whereClause = `within_circle(location,${lat},${lon},${radiusMeters})`;
  const url = `https://data.cityofchicago.org/resource/pa69-gxc6.json?$where=${encodeURIComponent(whereClause)}&$limit=100`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 10000 });
    if (!response.ok) {
      console.error(`Residential data fetch failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json() as ResidentialData[];
    return data;
  } catch (error) {
    console.error('Error fetching residential data:', error);
    return [];
  }
}

export async function searchResidentialData(query: string): Promise<ResidentialData[]> {
  if (!query || query.length < 3) return [];
  
  const upperQuery = query.toUpperCase();
  const url = `https://data.cityofchicago.org/resource/pa69-gxc6.json?$where=${encodeURIComponent(`upper(address) like '%${upperQuery}%' OR upper(doing_business_as_name) like '%${upperQuery}%'`)}&$limit=20`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 8000 });
    if (!response.ok) {
      console.error(`Residential search fetch failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json() as ResidentialData[];
    return data;
  } catch (error) {
    console.error('Error searching residential data:', error);
    return [];
  }
}

export async function getChicagoBuildingDetails(address: string): Promise<ChicagoBuildingDetails | null> {
  const upperAddress = address.toUpperCase();
  const url = `https://data.cityofchicago.org/resource/ecdk-m9re.json?address=${encodeURIComponent(upperAddress)}&$limit=1`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 5000 });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching Chicago building details:', error);
    return null;
  }
}

export interface CookCountyProperty {
  pin: string;
  age: string;
  sqft: string;
  exterior: string;
}

const COOK_COUNTY_PROXY = 'https://corsproxy.io/?';

export async function getCookCountyProperty(address: string): Promise<CookCountyProperty | null> {
  // This is a bit more complex as we usually need a PIN, but we can try searching by address
  const upperAddress = address.toUpperCase();
  // Try a more specific query first, then fallback to like
  const baseUrl = `https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json?$where=${encodeURIComponent(`address like '%${upperAddress}%'`)}&$limit=1`;
  
  // Try direct first, then proxy
  const urls = [baseUrl, `${COOK_COUNTY_PROXY}${encodeURIComponent(baseUrl)}` ];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, { timeout: 10000 });
      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) return data[0];
      }
    } catch (error) {
      console.warn(`Cook County property fetch failed for ${url}:`, error);
    }
  }

  // Fallback to Chicago Properties dataset if Cook County is unreachable
  try {
    // Try to find the PIN from Chicago Properties dataset
    const chicagoUrl = `https://data.cityofchicago.org/resource/6zsd-86n6.json?address=${encodeURIComponent(upperAddress)}&$limit=1`;
    const response = await fetchWithTimeout(chicagoUrl, { timeout: 8000 });
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return {
          pin: data[0].pin || '',
          age: '',
          sqft: data[0].sqft || '',
          exterior: ''
        };
      }
    }
  } catch (error) {
    console.warn('Error fetching fallback Chicago property data (6zsd-86n6):', error);
  }

  // Final fallback to Chicago Building Details
  try {
    const chicagoUrl = `https://data.cityofchicago.org/resource/ecdk-m9re.json?address=${encodeURIComponent(upperAddress)}&$limit=1`;
    const response = await fetchWithTimeout(chicagoUrl, { timeout: 8000 });
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return {
          pin: data[0].building_id || '', // Use building_id as fallback pin if needed
          age: data[0].year_built || '',
          sqft: '',
          exterior: ''
        };
      }
    }
  } catch (error) {
    console.error('Error fetching fallback Chicago property data (ecdk-m9re):', error);
  }
  
  return null;
}

export interface CookCountyAssessorData {
  pin: string;
  tax_code?: string;
  neighborhood_code?: string;
  town_code?: string;
}

export interface CookCountyResidentialModel {
  meta_pin: string;
  char_age?: string;
  char_use?: string;
  char_type_resd?: string;
  char_rooms?: string;
  char_beds?: string;
  char_baths?: string;
  char_apts?: string;
  econ_tax_rate?: string;
  meta_class?: string;
  geo_property_address?: string;
}

export async function getCookCountyResidentialModel(pin: string): Promise<CookCountyResidentialModel | null> {
  // Try PIN with and without hyphens, depending on how data represents it.
  const pinNoHyphens = pin.replace(/-/g, '');
  const baseUrl = `https://datacatalog.cookcountyil.gov/resource/8f9d-wy2d.json?$where=${encodeURIComponent(`meta_pin like '%${pin}%' OR meta_pin like '%${pinNoHyphens}%'`)}&$limit=1`;
  const urls = [baseUrl, `${COOK_COUNTY_PROXY}${encodeURIComponent(baseUrl)}`];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, { timeout: 10000 });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) return data[0];
      }
    } catch (error) {
      console.warn(`Cook County residential model fetch failed for ${url}:`, error);
    }
  }

  return null;
}

export interface BuildingPermit {
  id: string;
  permit_: string;
  permit_type: string;
  review_type: string;
  application_start_date: string;
  issue_date: string;
  work_description: string;
  total_fee: string;
  reported_cost: string;
  street_number: string;
  street_direction: string;
  street_name: string;
  latitude?: string;
  longitude?: string;
}

export async function getBuildingPermits(address: string, limit: number = 10): Promise<BuildingPermit[]> {
  const upperAddress = address.toUpperCase();
  // Extract just the street number and name if possible to improve matching, but direct address match is safer
  // Address is usually like '835 N MICHIGAN AVE'
  
  const searchAddress = upperAddress.replace(/,.*$/, ''); // clean up city/state
  
  // We can try to match on the concatenation of street_number + street_direction + street_name
  // but simpler to try a like matching a few parts
  
  // Simplistic approach: if we just have the full address, we break it down
  const parts = searchAddress.split(' ');
  const streetNumber = parts[0];
  const streetName = parts.slice(1).join(' ');

  let whereClause = `upper(street_name) like '%${streetName}%'`;
  if (!isNaN(Number(streetNumber))) {
    whereClause = `street_number = '${streetNumber}' AND ${whereClause}`;
  }

  const url = `https://data.cityofchicago.org/resource/ydr8-5enu.json?$where=${encodeURIComponent(whereClause)}&$limit=${limit}&$order=issue_date DESC`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 10000 });
    if (!response.ok) {
      console.error(`Building permits fetch failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json() as BuildingPermit[];
    return data;
  } catch (error) {
    console.error('Error fetching building permits:', error);
    return [];
  }
}

export async function getCookCountyAssessorData(pin: string): Promise<CookCountyAssessorData | null> {
  const baseUrl = `https://datacatalog.cookcountyil.gov/resource/tx2p-k2g9.json?pin=${pin}&$limit=1`;
  const urls = [baseUrl, `${COOK_COUNTY_PROXY}${encodeURIComponent(baseUrl)}` ];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, { timeout: 10000 });
      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) return data[0];
      }
    } catch (error) {
      console.warn(`Cook County assessor fetch failed for ${url}:`, error);
    }
  }

  // Fallback to Chicago Properties dataset
  try {
    const chicagoUrl = `https://data.cityofchicago.org/resource/6zsd-86n6.json?pin=${pin}&$limit=1`;
    const response = await fetchWithTimeout(chicagoUrl, { timeout: 8000 });
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        return {
          pin: data[0].pin || pin,
          tax_code: data[0].tax_code,
          neighborhood_code: data[0].neighborhood_code,
          town_code: data[0].town_code
        };
      }
    }
  } catch (error) {
    console.error('Error fetching fallback Chicago assessor data:', error);
  }
  
  return null;
}

export interface BuildingFootprint {
  id: number;
  type: string;
  tags: Record<string, string>;
  geometry: { lat: number; lon: number }[];
}

export async function getBuildingFootprints(lat: string, lon: string, radiusMeters: number = 400): Promise<BuildingFootprint[]> {
  if (!lat || !lon) return [];
  
  const query = `[out:json][timeout:15];\n(\n  way["building"](around:${radiusMeters},${lat},${lon});\n  relation["building"](around:${radiusMeters},${lat},${lon});\n);\nout geom;`;
  
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(query)}`,
        timeout: 15000
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.elements) {
          return data.elements.filter((el: any) => el.type === 'way' && el.geometry).map((el: any) => ({
            id: el.id,
            type: el.type,
            tags: el.tags || {},
            geometry: el.geometry
          }));
        }
      }
    } catch (error) {
      console.warn(`Overpass API endpoint ${endpoint} failed:`, error);
      // Continue to next endpoint on fetch failure
    }
  }

  console.warn('All Overpass API endpoints failed to return building footprints. Map will display without footprints.');
  
  // Fallback to Chicago Building Footprints Dataset
  try {
    const chicagoFootprintsUrl = `https://data.cityofchicago.org/resource/hz9b-7nh8.json?$where=${encodeURIComponent(`within_circle(location,${lat},${lon},${radiusMeters})`)}&$limit=50`;
    const response = await fetchWithTimeout(chicagoFootprintsUrl, { timeout: 8000 });
    if (response.ok) {
      const data = await response.json();
      return data.map((el: any) => ({
        id: el.bldg_id || Math.random(),
        type: 'way',
        tags: { name: el.address || 'Building' },
        geometry: el.the_geom?.coordinates?.[0]?.[0]?.map((coord: any) => ({ lat: coord[1], lon: coord[0] })) || []
      })).filter((el: any) => el.geometry.length > 0);
    }
  } catch (error) {
    console.error('Error fetching Chicago building footprints fallback:', error);
  }

  return [];
}

export async function searchBuilding(query: string): Promise<BenchmarkingData[]> {
  if (!query || query.length < 3) return [];
  
  const upperQuery = query.toUpperCase();
  const words = upperQuery.split(' ').filter(w => w.length > 0);
  
  // Try exact match first
  const exactMatch = `upper(property_name) like '%${upperQuery}%' OR upper(address) like '%${upperQuery}%'`;
  
  // Then try AND condition
  const andConditions = words.map(w => 
    `(upper(property_name) like '%${w}%' OR upper(address) like '%${w}%' OR upper(community_area) like '%${w}%')`
  ).join(' AND ');
  
  // Finally try OR condition
  const orConditions = words.map(w => 
    `(upper(property_name) like '%${w}%' OR upper(address) like '%${w}%' OR upper(community_area) like '%${w}%')`
  ).join(' OR ');
  
  // We can combine them or just use OR
  // Actually, if we use OR, we might get too many irrelevant results.
  // Let's use a scoring system or just return the OR results and let the user pick.
  // Since the API doesn't support scoring, we can just use the AND condition, and if no results, fallback to OR.
  
  let whereClause = andConditions;
  let url = `https://data.cityofchicago.org/resource/xq83-jr8c.json?$where=${encodeURIComponent(whereClause)}&$limit=20&$order=${encodeURIComponent('data_year DESC')}`;
  
  try {
    const response = await fetchWithTimeout(url, { timeout: 8000 });
    if (!response.ok) {
      console.error(`Search fetch failed with status: ${response.status}`);
      return [];
    }
    const data = await response.json() as BenchmarkingData[];
    
    // Deduplicate by property name and address, keeping the most recent year
    const unique = new Map<string, BenchmarkingData>();
    data.forEach((b) => {
      if (!b.latitude && b.location?.latitude) b.latitude = b.location.latitude;
      if (!b.longitude && b.location?.longitude) b.longitude = b.location.longitude;
      
      const key = `${b.property_name}-${b.address}`;
      if (!unique.has(key) || (parseInt(b.data_year || '0') > parseInt(unique.get(key)!.data_year || '0'))) {
        unique.set(key, b);
      }
    });
    
    let results = Array.from(unique.values());

    // If no results, try OR condition
    if (results.length === 0 && words.length > 1) {
      const orUrl = `https://data.cityofchicago.org/resource/xq83-jr8c.json?$where=${encodeURIComponent(orConditions)}&$limit=20&$order=${encodeURIComponent('data_year DESC')}`;
      const orResponse = await fetchWithTimeout(orUrl, { timeout: 8000 });
      if (orResponse.ok) {
        const orData = await orResponse.json() as BenchmarkingData[];
        orData.forEach((b) => {
          if (!b.latitude && b.location?.latitude) b.latitude = b.location.latitude;
          if (!b.longitude && b.location?.longitude) b.longitude = b.location.longitude;
          
          const key = `${b.property_name}-${b.address}`;
          if (!unique.has(key) || (parseInt(b.data_year || '0') > parseInt(unique.get(key)!.data_year || '0'))) {
            unique.set(key, b);
          }
        });
        results = Array.from(unique.values());
      }
    }

    // Try to geocode any results that are missing latitude/longitude
    for (const b of results) {
      if (!b.latitude || !b.longitude) {
        try {
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(b.address + ', Chicago, IL')}&limit=1`;
          const geoResponse = await fetchWithTimeout(geocodeUrl, { timeout: 3000 });
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData && geoData.length > 0) {
              b.latitude = geoData[0].lat;
              b.longitude = geoData[0].lon;
              console.log(`Geocoded ${b.address} to ${b.latitude}, ${b.longitude}`);
            }
          }
        } catch (err) {
          console.warn('Geocoding fallback failed for', b.address);
        }
      }
    }

    // If still no results in benchmarking data, try the general building footprints dataset to expand TAM
    if (results.length === 0) {
      const footprintUrl = `https://data.cityofchicago.org/resource/hz9b-7nh8.json?$where=${encodeURIComponent(`upper(address) like '%${upperQuery}%'`)}&$limit=5`;
      const footprintResponse = await fetchWithTimeout(footprintUrl, { timeout: 8000 });
      if (footprintResponse.ok) {
        const footprintData = await footprintResponse.json();
        results = footprintData.map((f: any) => ({
          id: f.bldg_id || Math.random().toString(),
          row_id: f.bldg_id || Math.random().toString(),
          property_name: f.address || 'Unknown Building',
          address: f.address || 'Unknown Address',
          primary_property_type: 'Commercial / Mixed Use (Estimated)',
          year_built: f.year_built || '1980',
          gross_floor_area_buildings_sq_ft: f.bldg_sq_ft || f.sq_ft || '25000', // Estimate if missing
          site_eui_kbtu_sq_ft: '0', // Will trigger EIA/NREL benchmarks
          source_eui_kbtu_sq_ft: '0',
          total_ghg_emissions_metric_tons_co2e: '0',
          latitude: f.the_geom?.coordinates?.[0]?.[0]?.[0]?.[1]?.toString() || '',
          longitude: f.the_geom?.coordinates?.[0]?.[0]?.[0]?.[0]?.toString() || '',
          data_year: new Date().getFullYear().toString()
        }));
      }
    }

    // Sort results by relevance (number of matched words in property name or address)
    results.sort((a, b) => {
      const aName = (a.property_name || '').toUpperCase();
      const aAddress = (a.address || '').toUpperCase();
      const bName = (b.property_name || '').toUpperCase();
      const bAddress = (b.address || '').toUpperCase();
      
      let aScore = 0;
      let bScore = 0;
      let aWordsMatched = 0;
      let bWordsMatched = 0;
      
      words.forEach((w, index) => {
        const regex = new RegExp(`\\b${w}\\b`);
        let aMatched = false;
        let bMatched = false;
        
        // Weight earlier words slightly higher
        const wordWeight = 1 - (index * 0.1);
        
        if (aName.startsWith(w)) { aScore += 3 * wordWeight; aMatched = true; }
        else if (regex.test(aName)) { aScore += 2 * wordWeight; aMatched = true; }
        else if (aName.includes(w)) { aScore += 0.5 * wordWeight; aMatched = true; }
        
        if (aAddress.startsWith(w)) { aScore += 1.5 * wordWeight; aMatched = true; }
        else if (regex.test(aAddress)) { aScore += 1 * wordWeight; aMatched = true; }
        else if (aAddress.includes(w)) { aScore += 0.25 * wordWeight; aMatched = true; }
        
        if (bName.startsWith(w)) { bScore += 3 * wordWeight; bMatched = true; }
        else if (regex.test(bName)) { bScore += 2 * wordWeight; bMatched = true; }
        else if (bName.includes(w)) { bScore += 0.5 * wordWeight; bMatched = true; }
        
        if (bAddress.startsWith(w)) { bScore += 1.5 * wordWeight; bMatched = true; }
        else if (regex.test(bAddress)) { bScore += 1 * wordWeight; bMatched = true; }
        else if (bAddress.includes(w)) { bScore += 0.25 * wordWeight; bMatched = true; }
        
        if (aMatched) aWordsMatched++;
        if (bMatched) bWordsMatched++;
      });
      
      // Big bonus for matching more words
      aScore += aWordsMatched * 10;
      bScore += bWordsMatched * 10;
      
      return bScore - aScore;
    });

    return results;
  } catch (error) {
    console.error('Error searching buildings:', error);
    return [];
  }
}
