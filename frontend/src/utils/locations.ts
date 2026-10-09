// Clean Indian cities sorted alphabetically (A-Z) after 'All Cities in India'
const CITIES_LIST = [
  'Agra',
  'Ahmedabad',
  'Amritsar',
  'Aurangabad',
  'Bangalore',
  'Bareilly',
  'Belgaum',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Cuttack',
  'Dehradun',
  'Delhi / NCR',
  'Dhanbad',
  'Goa',
  'Guntur',
  'Guwahati',
  'Gwalior',
  'Hubli',
  'Hyderabad',
  'Indore',
  'Jabalpur',
  'Jaipur',
  'Jalandhar',
  'Jammu',
  'Jamshedpur',
  'Jodhpur',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Kolhapur',
  'Kota',
  'Lucknow',
  'Ludhiana',
  'Madurai',
  'Mangalore',
  'Meerut',
  'Mumbai',
  'Mysore',
  'Nagpur',
  'Nashik',
  'Patna',
  'Prayagraj',
  'Puducherry',
  'Pune',
  'Rajkot',
  'Ranchi',
  'Rourkela',
  'Salem',
  'Shillong',
  'Shimla',
  'Solapur',
  'Srinagar',
  'Surat',
  'Thiruvananthapuram',
  'Tirupati',
  'Trichy',
  'Udaipur',
  'Vadodara',
  'Varanasi',
  'Vijayawada',
  'Visakhapatnam',
  'Warangal'
].sort();

export const INDIAN_CITIES = [
  'All Cities in India',
  ...CITIES_LIST
];

export const LOCATION_SCOPES = [
  'India',
  'USA',
  'Europe',
  'Germany',
  'UK',
  'Canada',
  'Singapore',
  'Australia',
  'Global Remote',
  'All Locations'
];

// Comprehensive list of Indian states, Union Territories, cities, pin locations, and currency indicators
const INDIAN_STATES_AND_KEYWORDS = [
  'india', 'karnataka', 'maharashtra', 'tamil nadu', 'telangana', 'delhi', 'uttar pradesh',
  'haryana', 'rajasthan', 'kerala', 'west bengal', 'gujarat', 'punjab', 'madhya pradesh',
  'odisha', 'bihar', 'jharkhand', 'assam', 'uttarakhand', 'himachal pradesh', 'goa',
  'jammu', 'kashmir', 'andhra pradesh', 'chhattisgarh', 'chandigarh', 'puducherry', 'ncr',
  'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad',
  'jaipur', 'dehradun', 'bhopal', 'lucknow', 'indore', 'surat', 'vadodara', 'nagpur', 'patna',
  'guwahati', 'coimbatore', 'visakhapatnam', 'vizag', 'kochi', 'cochin', 'trivandrum',
  'thiruvananthapuram', 'noida', 'gurgaon', 'gurugram', 'yerwada', 'koramangala', 'richmond town',
  'agra', 'ahmednagar', 'ajmer', 'aligarh', 'amravati', 'amritsar', 'anand', 'aurangabad',
  'bareilly', 'belgaum', 'bharuch', 'bhilai', 'bhiwandi', 'bhubaneswar', 'bikaner', 'bilaspur',
  'cuttack', 'dharwad', 'dhanbad', 'durgapur', 'erode', 'faridabad', 'gandhinagar', 'ghaziabad',
  'gorakhpur', 'guntur', 'gwalior', 'haldwani', 'hubli', 'jabalpur', 'jalandhar', 'jamshedpur',
  'jhansi', 'jodhpur', 'kakinada', 'kannur', 'kanpur', 'kollam', 'kolhapur', 'kota', 'kozhikode',
  'ludhiana', 'madurai', 'mangalore', 'mathura', 'meerut', 'moradabad', 'mysore', 'mysuru',
  'nanded', 'nashik', 'nellore', 'nizamabad', 'palakkad', 'panipat', 'patiala', 'prayagraj',
  'raipur', 'rajkot', 'ranchi', 'rohtak', 'rourkela', 'salem', 'sangli', 'shillong', 'shimla',
  'siliguri', 'solapur', 'srinagar', 'thrissur', 'tiruchirappalli', 'trichy', 'tirunelveli',
  'tirupati', 'udaipur', 'ujjain', 'vellore', 'vijayawada', 'warangal', 'sadashiv peth', 'koyilandi',
  'valsad', 'srinivasapuram', 'inr', 'lpa', 'lakhs'
];

const FOREIGN_KEYWORDS = [
  'usa', 'united states', 'san francisco', 'new york', 'london', 'uk', 'united kingdom',
  'germany', 'berlin', 'singapore', 'canada', 'toronto', 'sydney', 'australia', 'europe',
  'worldwide', 'international', 'americas', 'latam', 'apac', 'emea', 'munich', 'frankfurt',
  'paris', 'amsterdam', 'zurich', 'vancouver', 'melbourne', 'dublin', 'ireland', 'poland', 'spain'
];

// City alias mappings for strict region matching
const CITY_ALIASES: Record<string, string[]> = {
  'delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'ghaziabad', 'faridabad'],
  'bangalore': ['bangalore', 'bengaluru', 'koramangala', 'whitefield', 'indiranagar', 'electronic city', 'richmond town'],
  'mumbai': ['mumbai', 'navi mumbai', 'thane', 'andheri', 'bandra', 'powai'],
  'hyderabad': ['hyderabad', 'secunderabad', 'cyberabad', 'gachibowli', 'hitech city'],
  'pune': ['pune', 'pimpri', 'yerwada', 'hinjewadi', 'hinjawadi', 'baner', 'wakad', 'viman nagar'],
  'chennai': ['chennai', 'madras', 'omr', 'velachery'],
  'kolkata': ['kolkata', 'calcutta', 'salt lake'],
  'ahmedabad': ['ahmedabad', 'gandhinagar'],
  'chandigarh': ['chandigarh', 'mohali', 'panchkula'],
  'kochi': ['kochi', 'cochin', 'kerala', 'ernakulam'],
  'thiruvananthapuram': ['thiruvananthapuram', 'trivandrum'],
  'vadodara': ['vadodara', 'baroda'],
  'visakhapatnam': ['visakhapatnam', 'vizag'],
  'mysore': ['mysore', 'mysuru'],
  'mangalore': ['mangalore', 'mangaluru'],
  'goa': ['goa', 'panaji', 'margao'],
  'aurangabad': ['aurangabad', 'sambhajinagar']
};

/**
 * Removes sub-locations (e.g. Yerwada, Richmond Town, Koramangala) and standardizes to clean city names
 */
export function cleanDisplayLocation(rawLoc: string): string {
  if (!rawLoc) return 'India';
  const locLower = rawLoc.toLowerCase().trim();

  if (locLower.includes('remote') || locLower.includes('work from home')) {
    if (locLower.includes('india')) return 'Remote (India)';
    if (locLower.includes('usa') || locLower.includes('global') || locLower.includes('worldwide')) return 'Global Remote';
    return 'Remote';
  }

  // Map sub-locations and cities to clean primary city name (NO sub-locations like Yerwada)
  if (locLower.includes('pune') || locLower.includes('yerwada') || locLower.includes('hinjewadi') || locLower.includes('hinjawadi')) return 'Pune';
  if (locLower.includes('bangalore') || locLower.includes('bengaluru') || locLower.includes('koramangala') || locLower.includes('richmond town')) return 'Bangalore';
  if (locLower.includes('delhi') || locLower.includes('gurgaon') || locLower.includes('noida') || locLower.includes('ncr')) return 'Delhi / NCR';
  if (locLower.includes('mumbai') || locLower.includes('navi mumbai') || locLower.includes('thane')) return 'Mumbai';
  if (locLower.includes('hyderabad') || locLower.includes('secunderabad')) return 'Hyderabad';
  if (locLower.includes('chennai')) return 'Chennai';
  if (locLower.includes('kolkata')) return 'Kolkata';
  if (locLower.includes('ahmedabad')) return 'Ahmedabad';
  if (locLower.includes('jaipur')) return 'Jaipur';
  if (locLower.includes('lucknow')) return 'Lucknow';
  if (locLower.includes('dehradun')) return 'Dehradun';
  if (locLower.includes('bhopal')) return 'Bhopal';
  if (locLower.includes('indore')) return 'Indore';

  return rawLoc;
}

/**
 * Normalizes city selection text to a standard search keyword
 */
export function normalizeCityName(selectedCity: string): string {
  if (!selectedCity || selectedCity.startsWith('All')) return '';
  const lower = selectedCity.toLowerCase();
  if (lower.includes('delhi') || lower.includes('gurgaon') || lower.includes('noida') || lower.includes('ncr')) return 'delhi';
  if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'bangalore';
  if (lower.includes('mumbai') || lower.includes('thane')) return 'mumbai';
  if (lower.includes('hyderabad')) return 'hyderabad';
  if (lower.includes('pune')) return 'pune';
  if (lower.includes('chennai')) return 'chennai';
  if (lower.includes('kolkata')) return 'kolkata';
  if (lower.includes('ahmedabad')) return 'ahmedabad';
  if (lower.includes('chandigarh') || lower.includes('mohali')) return 'chandigarh';
  if (lower.includes('kochi') || lower.includes('cochin') || lower.includes('kerala')) return 'kochi';
  if (lower.includes('trivandrum') || lower.includes('thiruvananthapuram')) return 'thiruvananthapuram';
  
  const firstPart = selectedCity.split('/')[0].split('(')[0].trim().toLowerCase();
  return firstPart;
}

/**
 * Strictly evaluates if a job location matches the selected scope and city
 */
export function matchesLocationFilter(
  jobLocationRaw: string,
  scope: string,
  selectedCity: string
): boolean {
  const loc = (jobLocationRaw || '').toLowerCase().trim();
  
  const isIndia = INDIAN_STATES_AND_KEYWORDS.some(k => loc.includes(k));
  const isForeignExplicit = FOREIGN_KEYWORDS.some(k => loc.includes(k));

  // 1. Scope = All Locations
  if (scope === 'All Locations') {
    return true;
  }

  // 2. Scope = Global Remote
  if (scope === 'Global Remote') {
    return (loc.includes('remote') || loc.includes('work from home') || loc.includes('anywhere') || loc.includes('global') || loc.includes('worldwide')) && !isIndia;
  }

  // 3. Scope = USA
  if (scope === 'USA') {
    if (isIndia) return false;
    return loc.includes('usa') || loc.includes('united states') || loc.includes('us') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('nyc') || loc.includes('seattle') || loc.includes('austin') || loc.includes('california') || loc.includes('texas') || loc.includes('chicago') || loc.includes('boston') || loc.includes('silicon valley');
  }

  // 4. Scope = Europe
  if (scope === 'Europe') {
    if (isIndia) return false;
    return loc.includes('europe') || loc.includes('eu') || loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('uk') || loc.includes('london') || loc.includes('france') || loc.includes('paris') || loc.includes('netherlands') || loc.includes('amsterdam') || loc.includes('switzerland') || loc.includes('zurich') || loc.includes('poland') || loc.includes('spain') || loc.includes('ireland') || loc.includes('dublin');
  }

  // 5. Scope = Germany
  if (scope === 'Germany') {
    if (isIndia) return false;
    return loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('frankfurt') || loc.includes('hamburg') || loc.includes('cologne') || loc.includes('stuttgart');
  }

  // 6. Scope = UK
  if (scope === 'UK') {
    if (isIndia) return false;
    return loc.includes('uk') || loc.includes('united kingdom') || loc.includes('london') || loc.includes('manchester') || loc.includes('edinburgh') || loc.includes('birmingham') || loc.includes('bristol');
  }

  // 7. Scope = Canada
  if (scope === 'Canada') {
    if (isIndia) return false;
    return loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver') || loc.includes('montreal') || loc.includes('ottawa') || loc.includes('calgary');
  }

  // 8. Scope = Singapore
  if (scope === 'Singapore') {
    if (isIndia) return false;
    return loc.includes('singapore') || loc.includes('sg');
  }

  // 9. Scope = Australia
  if (scope === 'Australia') {
    if (isIndia) return false;
    return loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne') || loc.includes('brisbane') || loc.includes('perth');
  }

  // 10. Scope = India
  if (scope === 'India') {
    if (isForeignExplicit && !isIndia) return false;
    if (!isIndia && !loc.includes('remote')) return false;

    // If a specific Indian city is selected (after India is chosen)
    const normCity = normalizeCityName(selectedCity);
    if (!normCity) return true; // "All Cities in India"

    const aliases = CITY_ALIASES[normCity] || [normCity];
    return aliases.some(alias => loc.includes(alias));
  }

  return true;
}
