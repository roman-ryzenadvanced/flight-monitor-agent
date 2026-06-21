// Global airport database — ~200 major airports across all continents
// Used for searchable airport picker in the New Tracker dialog

export interface Airport {
  iata: string;
  icao?: string;
  name: string;
  city: string;
  country: string;
  cc: string; // ISO 3166-1 alpha-2
  region: "NA" | "SA" | "EU" | "ME" | "AF" | "AS" | "OC";
  lat: number;
  lng: number;
  tz?: string;
}

// Region labels (multi-language: en, ru, ka, he, ar, es)
export const regionLabels: Record<Airport["region"], { en: string; ru: string; ka: string; he: string; ar: string; es: string }> = {
  NA: { en: "North America", ru: "Северная Америка", ka: "ჩრდილოეთ ამერიკა", he: "צפון אמריקה", ar: "أمريكا الشمالية", es: "América del Norte" },
  SA: { en: "South America", ru: "Южная Америка", ka: "სამხრეთ ამერიკა", he: "דרום אמריקה", ar: "أمريكا الجنوبية", es: "América del Sur" },
  EU: { en: "Europe", ru: "Европа", ka: "ევროპა", he: "אירופה", ar: "أوروبا", es: "Europa" },
  ME: { en: "Middle East", ru: "Ближний Восток", ka: "ახლო აღმოსავლეთი", he: "מזרח תיכון", ar: "الشرق الأوسط", es: "Oriente Medio" },
  AF: { en: "Africa", ru: "Африка", ka: "აფრიკა", he: "אפריקה", ar: "أفريقيا", es: "África" },
  AS: { en: "Asia", ru: "Азия", ka: "აზია", he: "אסיה", ar: "آسيا", es: "Asia" },
  OC: { en: "Oceania", ru: "Океания", ka: "ოკეანეთი", he: "אוקיאניה", ar: "أوقيانوسيا", es: "Oceanía" },
};

// Country code → flag emoji
export function ccToFlag(cc: string): string {
  if (!cc || cc.length !== 2) return "🏳️";
  const codePoints = cc
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

export const airports: Airport[] = [
  // === North America ===
  { iata: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "United States", cc: "US", region: "NA", lat: 40.6413, lng: -73.7781 },
  { iata: "LGA", name: "LaGuardia", city: "New York", country: "United States", cc: "US", region: "NA", lat: 40.7769, lng: -73.8740 },
  { iata: "EWR", name: "Newark Liberty", city: "Newark", country: "United States", cc: "US", region: "NA", lat: 40.6895, lng: -74.1745 },
  { iata: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "United States", cc: "US", region: "NA", lat: 33.9416, lng: -118.4085 },
  { iata: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "United States", cc: "US", region: "NA", lat: 37.6213, lng: -122.3790 },
  { iata: "SEA", name: "Seattle-Tacoma", city: "Seattle", country: "United States", cc: "US", region: "NA", lat: 47.4502, lng: -122.3088 },
  { iata: "ORD", name: "O'Hare Intl", city: "Chicago", country: "United States", cc: "US", region: "NA", lat: 41.9742, lng: -87.9073 },
  { iata: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "United States", cc: "US", region: "NA", lat: 33.6407, lng: -84.4277 },
  { iata: "MIA", name: "Miami Intl", city: "Miami", country: "United States", cc: "US", region: "NA", lat: 25.7959, lng: -80.2870 },
  { iata: "BOS", name: "Logan Intl", city: "Boston", country: "United States", cc: "US", region: "NA", lat: 42.3656, lng: -71.0096 },
  { iata: "IAD", name: "Dulles Intl", city: "Washington", country: "United States", cc: "US", region: "NA", lat: 38.9531, lng: -77.4565 },
  { iata: "DCA", name: "Reagan National", city: "Washington", country: "United States", cc: "US", region: "NA", lat: 38.8512, lng: -77.0402 },
  { iata: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "United States", cc: "US", region: "NA", lat: 32.8998, lng: -97.0403 },
  { iata: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "United States", cc: "US", region: "NA", lat: 29.9844, lng: -95.3414 },
  { iata: "DEN", name: "Denver Intl", city: "Denver", country: "United States", cc: "US", region: "NA", lat: 39.8561, lng: -104.6737 },
  { iata: "LAS", name: "Harry Reid Intl", city: "Las Vegas", country: "United States", cc: "US", region: "NA", lat: 36.0840, lng: -115.1537 },
  { iata: "PHX", name: "Sky Harbor", city: "Phoenix", country: "United States", cc: "US", region: "NA", lat: 33.4373, lng: -112.0078 },
  { iata: "SAN", name: "San Diego Intl", city: "San Diego", country: "United States", cc: "US", region: "NA", lat: 32.7338, lng: -117.1933 },
  { iata: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada", cc: "CA", region: "NA", lat: 43.6777, lng: -79.6248 },
  { iata: "YVR", name: "Vancouver Intl", city: "Vancouver", country: "Canada", cc: "CA", region: "NA", lat: 49.1939, lng: -123.1844 },
  { iata: "YUL", name: "Montréal-Trudeau", city: "Montreal", country: "Canada", cc: "CA", region: "NA", lat: 45.4706, lng: -73.7408 },
  { iata: "MEX", name: "Mexico City Intl", city: "Mexico City", country: "Mexico", cc: "MX", region: "NA", lat: 19.4361, lng: -99.0719 },
  { iata: "CUN", name: "Cancún Intl", city: "Cancún", country: "Mexico", cc: "MX", region: "NA", lat: 21.0365, lng: -86.8770 },

  // === South America ===
  { iata: "GRU", name: "São Paulo-Guarulhos", city: "São Paulo", country: "Brazil", cc: "BR", region: "SA", lat: -23.4356, lng: -46.4731 },
  { iata: "GIG", name: "Rio de Janeiro-Galeão", city: "Rio de Janeiro", country: "Brazil", cc: "BR", region: "SA", lat: -22.8089, lng: -43.2436 },
  { iata: "EZE", name: "Ezeiza Intl", city: "Buenos Aires", country: "Argentina", cc: "AR", region: "SA", lat: -34.8222, lng: -58.5358 },
  { iata: "SCL", name: "Arturo Merino Benítez", city: "Santiago", country: "Chile", cc: "CL", region: "SA", lat: -33.3930, lng: -70.7858 },
  { iata: "LIM", name: "Jorge Chávez", city: "Lima", country: "Peru", cc: "PE", region: "SA", lat: -12.0219, lng: -77.1143 },
  { iata: "BOG", name: "El Dorado", city: "Bogotá", country: "Colombia", cc: "CO", region: "SA", lat: 4.7016, lng: -74.1469 },
  { iata: "PTY", name: "Tocumen Intl", city: "Panama City", country: "Panama", cc: "PA", region: "SA", lat: 9.0714, lng: -79.3835 },
  { iata: "UIO", name: "Mariscal Sucre", city: "Quito", country: "Ecuador", cc: "EC", region: "SA", lat: -0.1292, lng: -78.3575 },
  { iata: "MVD", name: "Carrasco", city: "Montevideo", country: "Uruguay", cc: "UY", region: "SA", lat: -34.8384, lng: -56.0308 },

  // === Europe ===
  { iata: "LHR", name: "London Heathrow", city: "London", country: "United Kingdom", cc: "GB", region: "EU", lat: 51.4700, lng: -0.4543 },
  { iata: "LGW", name: "London Gatwick", city: "London", country: "United Kingdom", cc: "GB", region: "EU", lat: 51.1481, lng: -0.1903 },
  { iata: "STN", name: "London Stansted", city: "London", country: "United Kingdom", cc: "GB", region: "EU", lat: 51.8850, lng: 0.2350 },
  { iata: "MAN", name: "Manchester", city: "Manchester", country: "United Kingdom", cc: "GB", region: "EU", lat: 53.3537, lng: -2.2750 },
  { iata: "EDI", name: "Edinburgh", city: "Edinburgh", country: "United Kingdom", cc: "GB", region: "EU", lat: 55.9500, lng: -3.3725 },
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", cc: "FR", region: "EU", lat: 49.0097, lng: 2.5479 },
  { iata: "ORY", name: "Paris-Orly", city: "Paris", country: "France", cc: "FR", region: "EU", lat: 48.7233, lng: 2.3795 },
  { iata: "NCE", name: "Nice Côte d'Azur", city: "Nice", country: "France", cc: "FR", region: "EU", lat: 43.6584, lng: 7.2159 },
  { iata: "FRA", name: "Frankfurt am Main", city: "Frankfurt", country: "Germany", cc: "DE", region: "EU", lat: 50.0379, lng: 8.5622 },
  { iata: "MUC", name: "Munich", city: "Munich", country: "Germany", cc: "DE", region: "EU", lat: 48.3538, lng: 11.7861 },
  { iata: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany", cc: "DE", region: "EU", lat: 52.3667, lng: 13.5033 },
  { iata: "HAM", name: "Hamburg", city: "Hamburg", country: "Germany", cc: "DE", region: "EU", lat: 53.6304, lng: 9.9882 },
  { iata: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands", cc: "NL", region: "EU", lat: 52.3105, lng: 4.7683 },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium", cc: "BE", region: "EU", lat: 50.9014, lng: 4.4844 },
  { iata: "MAD", name: "Madrid-Barajas", city: "Madrid", country: "Spain", cc: "ES", region: "EU", lat: 40.4839, lng: -3.5680 },
  { iata: "BCN", name: "Barcelona-El Prat", city: "Barcelona", country: "Spain", cc: "ES", region: "EU", lat: 41.2974, lng: 2.0833 },
  { iata: "AGP", name: "Málaga-Costa del Sol", city: "Málaga", country: "Spain", cc: "ES", region: "EU", lat: 36.6749, lng: -4.4991 },
  { iata: "FCO", name: "Rome-Fiumicino", city: "Rome", country: "Italy", cc: "IT", region: "EU", lat: 41.8003, lng: 12.2389 },
  { iata: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy", cc: "IT", region: "EU", lat: 45.6306, lng: 8.7281 },
  { iata: "VCE", name: "Venice Marco Polo", city: "Venice", country: "Italy", cc: "IT", region: "EU", lat: 45.5053, lng: 12.3519 },
  { iata: "VIE", name: "Vienna Intl", city: "Vienna", country: "Austria", cc: "AT", region: "EU", lat: 48.1103, lng: 16.5697 },
  { iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", cc: "CH", region: "EU", lat: 47.4647, lng: 8.5492 },
  { iata: "GVA", name: "Geneva Airport", city: "Geneva", country: "Switzerland", cc: "CH", region: "EU", lat: 46.2381, lng: 6.1090 },
  { iata: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland", cc: "IE", region: "EU", lat: 53.4213, lng: -6.2701 },
  { iata: "LIS", name: "Lisbon Humberto Delgado", city: "Lisbon", country: "Portugal", cc: "PT", region: "EU", lat: 38.7742, lng: -9.1342 },
  { iata: "OPO", name: "Porto", city: "Porto", country: "Portugal", cc: "PT", region: "EU", lat: 41.2481, lng: -8.6814 },
  { iata: "ATH", name: "Athens Eleftherios Venizelos", city: "Athens", country: "Greece", cc: "GR", region: "EU", lat: 37.9364, lng: 23.9445 },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", cc: "PL", region: "EU", lat: 52.1657, lng: 20.9671 },
  { iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", cc: "DK", region: "EU", lat: 55.6181, lng: 12.6562 },
  { iata: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden", cc: "SE", region: "EU", lat: 59.6519, lng: 17.9186 },
  { iata: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway", cc: "NO", region: "EU", lat: 60.1939, lng: 11.1004 },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland", cc: "FI", region: "EU", lat: 60.3172, lng: 24.9633 },
  { iata: "PRG", name: "Prague Václav Havel", city: "Prague", country: "Czech Republic", cc: "CZ", region: "EU", lat: 50.1008, lng: 14.2600 },
  { iata: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "Hungary", cc: "HU", region: "EU", lat: 47.4369, lng: 19.2556 },
  { iata: "OTP", name: "Bucharest Henri Coandă", city: "Bucharest", country: "Romania", cc: "RO", region: "EU", lat: 44.5711, lng: 26.0858 },
  { iata: "SOF", name: "Sofia Airport", city: "Sofia", country: "Bulgaria", cc: "BG", region: "EU", lat: 42.6952, lng: 23.4061 },
  { iata: "BEG", name: "Belgrade Nikola Tesla", city: "Belgrade", country: "Serbia", cc: "RS", region: "EU", lat: 44.8184, lng: 20.3091 },
  { iata: "REK", name: "Reykjavík-Keflavík", city: "Reykjavík", country: "Iceland", cc: "IS", region: "EU", lat: 63.9850, lng: -22.6056 },
  { iata: "SVO", name: "Moscow Sheremetyevo", city: "Moscow", country: "Russia", cc: "RU", region: "EU", lat: 55.9728, lng: 37.4147 },
  { iata: "LED", name: "Saint Petersburg Pulkovo", city: "Saint Petersburg", country: "Russia", cc: "RU", region: "EU", lat: 59.8003, lng: 30.2625 },
  { iata: "KBP", name: "Boryspil Intl", city: "Kyiv", country: "Ukraine", cc: "UA", region: "EU", lat: 50.3450, lng: 30.8947 },

  // === Middle East ===
  { iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel", cc: "IL", region: "ME", lat: 32.0114, lng: 34.8867 },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", cc: "TR", region: "ME", lat: 41.2753, lng: 28.7519 },
  { iata: "SAW", name: "Sabiha Gökçen", city: "Istanbul", country: "Turkey", cc: "TR", region: "ME", lat: 40.8986, lng: 29.3092 },
  { iata: "DXB", name: "Dubai Intl", city: "Dubai", country: "United Arab Emirates", cc: "AE", region: "ME", lat: 25.2532, lng: 55.3657 },
  { iata: "AUH", name: "Abu Dhabi Intl", city: "Abu Dhabi", country: "United Arab Emirates", cc: "AE", region: "ME", lat: 24.4330, lng: 54.6511 },
  { iata: "DOH", name: "Hamad Intl", city: "Doha", country: "Qatar", cc: "QA", region: "ME", lat: 25.2731, lng: 51.6080 },
  { iata: "MCT", name: "Muscat Intl", city: "Muscat", country: "Oman", cc: "OM", region: "ME", lat: 23.5933, lng: 58.2844 },
  { iata: "BAH", name: "Bahrain Intl", city: "Manama", country: "Bahrain", cc: "BH", region: "ME", lat: 26.2708, lng: 50.6336 },
  { iata: "JED", name: "King Abdulaziz Intl", city: "Jeddah", country: "Saudi Arabia", cc: "SA", region: "ME", lat: 21.6796, lng: 39.1565 },
  { iata: "RUH", name: "King Khalid Intl", city: "Riyadh", country: "Saudi Arabia", cc: "SA", region: "ME", lat: 24.9576, lng: 46.6988 },
  { iata: "AMM", name: "Queen Alia Intl", city: "Amman", country: "Jordan", cc: "JO", region: "ME", lat: 31.7226, lng: 35.9933 },
  { iata: "BEY", name: "Beirut Rafic Hariri", city: "Beirut", country: "Lebanon", cc: "LB", region: "ME", lat: 33.8208, lng: 35.4884 },
  { iata: "KWI", name: "Kuwait Intl", city: "Kuwait City", country: "Kuwait", cc: "KW", region: "ME", lat: 29.2266, lng: 47.9689 },
  { iata: "BGW", name: "Baghdad Intl", city: "Baghdad", country: "Iraq", cc: "IQ", region: "ME", lat: 33.2625, lng: 44.2346 },

  // === Africa ===
  { iata: "JNB", name: "O.R. Tambo", city: "Johannesburg", country: "South Africa", cc: "ZA", region: "AF", lat: -26.1392, lng: 28.2460 },
  { iata: "CPT", name: "Cape Town Intl", city: "Cape Town", country: "South Africa", cc: "ZA", region: "AF", lat: -33.9648, lng: 18.6017 },
  { iata: "CAI", name: "Cairo Intl", city: "Cairo", country: "Egypt", cc: "EG", region: "AF", lat: 30.1219, lng: 31.4056 },
  { iata: "ADD", name: "Addis Ababa Bole", city: "Addis Ababa", country: "Ethiopia", cc: "ET", region: "AF", lat: 8.9779, lng: 38.7993 },
  { iata: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya", cc: "KE", region: "AF", lat: -1.3192, lng: 36.9278 },
  { iata: "CMN", name: "Mohammed V", city: "Casablanca", country: "Morocco", cc: "MA", region: "AF", lat: 33.3675, lng: -7.5897 },
  { iata: "RAK", name: "Marrakech Menara", city: "Marrakech", country: "Morocco", cc: "MA", region: "AF", lat: 31.6069, lng: -8.0363 },
  { iata: "ALG", name: "Houari Boumediene", city: "Algiers", country: "Algeria", cc: "DZ", region: "AF", lat: 36.6910, lng: 3.2154 },
  { iata: "TUN", name: "Tunis-Carthage", city: "Tunis", country: "Tunisia", cc: "TN", region: "AF", lat: 36.8510, lng: 10.2272 },
  { iata: "LOS", name: "Murtala Muhammed", city: "Lagos", country: "Nigeria", cc: "NG", region: "AF", lat: 6.5774, lng: 3.3211 },
  { iata: "ACC", name: "Kotoka Intl", city: "Accra", country: "Ghana", cc: "GH", region: "AF", lat: 5.6051, lng: -0.1668 },
  { iata: "DAR", name: "Julius Nyerere", city: "Dar es Salaam", country: "Tanzania", cc: "TZ", region: "AF", lat: -6.8781, lng: 39.2026 },
  { iata: "MRU", name: "Sir Seewoosagur Ramgoolam", city: "Mauritius", country: "Mauritius", cc: "MU", region: "AF", lat: -20.4302, lng: 57.6836 },

  // === Asia ===
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", cc: "TH", region: "AS", lat: 13.6900, lng: 100.7501 },
  { iata: "HKT", name: "Phuket Intl", city: "Phuket", country: "Thailand", cc: "TH", region: "AS", lat: 7.8900, lng: 98.2917 },
  { iata: "CNX", name: "Chiang Mai Intl", city: "Chiang Mai", country: "Thailand", cc: "TH", region: "AS", lat: 18.7669, lng: 98.9627 },
  { iata: "SIN", name: "Singapore Changi", city: "Singapore", country: "Singapore", cc: "SG", region: "AS", lat: 1.3644, lng: 103.9915 },
  { iata: "KUL", name: "Kuala Lumpur Intl", city: "Kuala Lumpur", country: "Malaysia", cc: "MY", region: "AS", lat: 2.7456, lng: 101.7099 },
  { iata: "PEN", name: "Penang Intl", city: "Penang", country: "Malaysia", cc: "MY", region: "AS", lat: 5.2971, lng: 100.2767 },
  { iata: "CGK", name: "Soekarno-Hatta", city: "Jakarta", country: "Indonesia", cc: "ID", region: "AS", lat: -6.1256, lng: 106.6559 },
  { iata: "DPS", name: "Ngurah Rai (Bali)", city: "Denpasar", country: "Indonesia", cc: "ID", region: "AS", lat: -8.7482, lng: 115.1672 },
  { iata: "MNL", name: "Ninoy Aquino Intl", city: "Manila", country: "Philippines", cc: "PH", region: "AS", lat: 14.5086, lng: 121.0194 },
  { iata: "CEB", name: "Mactan-Cebu Intl", city: "Cebu", country: "Philippines", cc: "PH", region: "AS", lat: 10.3075, lng: 123.9789 },
  { iata: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "Hong Kong", cc: "HK", region: "AS", lat: 22.3080, lng: 113.9185 },
  { iata: "TPE", name: "Taiwan Taoyuan", city: "Taipei", country: "Taiwan", cc: "TW", region: "AS", lat: 25.0777, lng: 121.2328 },
  { iata: "NRT", name: "Tokyo Narita", city: "Tokyo", country: "Japan", cc: "JP", region: "AS", lat: 35.7647, lng: 140.3863 },
  { iata: "HND", name: "Tokyo Haneda", city: "Tokyo", country: "Japan", cc: "JP", region: "AS", lat: 35.5494, lng: 139.7798 },
  { iata: "KIX", name: "Kansai Intl", city: "Osaka", country: "Japan", cc: "JP", region: "AS", lat: 34.4347, lng: 135.2329 },
  { iata: "CTS", name: "New Chitose", city: "Sapporo", country: "Japan", cc: "JP", region: "AS", lat: 42.7752, lng: 141.6923 },
  { iata: "ICN", name: "Incheon Intl", city: "Seoul", country: "South Korea", cc: "KR", region: "AS", lat: 37.4602, lng: 126.4407 },
  { iata: "PVG", name: "Shanghai Pudong", city: "Shanghai", country: "China", cc: "CN", region: "AS", lat: 31.1443, lng: 121.8083 },
  { iata: "SHA", name: "Shanghai Hongqiao", city: "Shanghai", country: "China", cc: "CN", region: "AS", lat: 31.1979, lng: 121.3364 },
  { iata: "PEK", name: "Beijing Capital", city: "Beijing", country: "China", cc: "CN", region: "AS", lat: 40.0801, lng: 116.5846 },
  { iata: "PKX", name: "Beijing Daxing", city: "Beijing", country: "China", cc: "CN", region: "AS", lat: 39.5098, lng: 116.4106 },
  { iata: "CAN", name: "Guangzhou Baiyun", city: "Guangzhou", country: "China", cc: "CN", region: "AS", lat: 23.3924, lng: 113.2988 },
  { iata: "CTU", name: "Chengdu Tianfu", city: "Chengdu", country: "China", cc: "CN", region: "AS", lat: 30.3128, lng: 103.9390 },
  { iata: "SZX", name: "Shenzhen Bao'an", city: "Shenzhen", country: "China", cc: "CN", region: "AS", lat: 22.6394, lng: 113.8108 },
  { iata: "DEL", name: "Indira Gandhi", city: "Delhi", country: "India", cc: "IN", region: "AS", lat: 28.5562, lng: 77.1000 },
  { iata: "BOM", name: "Chhatrapati Shivaji", city: "Mumbai", country: "India", cc: "IN", region: "AS", lat: 19.0896, lng: 72.8656 },
  { iata: "MAA", name: "Chennai Intl", city: "Chennai", country: "India", cc: "IN", region: "AS", lat: 12.9941, lng: 80.1709 },
  { iata: "BLR", name: "Kempegowda Intl", city: "Bengaluru", country: "India", cc: "IN", region: "AS", lat: 13.1986, lng: 77.7066 },
  { iata: "HYD", name: "Rajiv Gandhi Intl", city: "Hyderabad", country: "India", cc: "IN", region: "AS", lat: 17.2403, lng: 78.4294 },
  { iata: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata", country: "India", cc: "IN", region: "AS", lat: 22.6547, lng: 88.4467 },
  { iata: "CMB", name: "Bandaranaike Intl", city: "Colombo", country: "Sri Lanka", cc: "LK", region: "AS", lat: 7.1808, lng: 79.8842 },
  { iata: "DAC", name: "Hazrat Shahjalal", city: "Dhaka", country: "Bangladesh", cc: "BD", region: "AS", lat: 23.8433, lng: 90.4005 },
  { iata: "KHI", name: "Jinnah Intl", city: "Karachi", country: "Pakistan", cc: "PK", region: "AS", lat: 24.9008, lng: 67.1681 },
  { iata: "ISB", name: "Islamabad Intl", city: "Islamabad", country: "Pakistan", cc: "PK", region: "AS", lat: 33.5495, lng: 72.8260 },
  { iata: "RGN", name: "Yangon Intl", city: "Yangon", country: "Myanmar", cc: "MM", region: "AS", lat: 16.9073, lng: 96.1332 },
  { iata: "PNH", name: "Phnom Penh Intl", city: "Phnom Penh", country: "Cambodia", cc: "KH", region: "AS", lat: 11.5466, lng: 104.8443 },
  { iata: "HAN", name: "Noi Bai", city: "Hanoi", country: "Vietnam", cc: "VN", region: "AS", lat: 21.2212, lng: 105.8071 },
  { iata: "SGN", name: "Tan Son Nhat", city: "Ho Chi Minh City", country: "Vietnam", cc: "VN", region: "AS", lat: 10.8189, lng: 106.6520 },
  { iata: "ULN", name: "Chinggis Khaan", city: "Ulaanbaatar", country: "Mongolia", cc: "MN", region: "AS", lat: 47.6433, lng: 106.8203 },

  // === Oceania ===
  { iata: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia", cc: "AU", region: "OC", lat: -33.9399, lng: 151.1753 },
  { iata: "MEL", name: "Melbourne Tullamarine", city: "Melbourne", country: "Australia", cc: "AU", region: "OC", lat: -37.6733, lng: 144.8433 },
  { iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia", cc: "AU", region: "OC", lat: -27.3942, lng: 153.1218 },
  { iata: "PER", name: "Perth Airport", city: "Perth", country: "Australia", cc: "AU", region: "OC", lat: -31.9385, lng: 115.9672 },
  { iata: "ADL", name: "Adelaide Airport", city: "Adelaide", country: "Australia", cc: "AU", region: "OC", lat: -34.9461, lng: 138.5306 },
  { iata: "CNS", name: "Cairns Airport", city: "Cairns", country: "Australia", cc: "AU", region: "OC", lat: -16.8858, lng: 145.7553 },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", cc: "NZ", region: "OC", lat: -37.0082, lng: 174.7850 },
  { iata: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", cc: "NZ", region: "OC", lat: -43.4894, lng: 172.5322 },
  { iata: "WLG", name: "Wellington Airport", city: "Wellington", country: "New Zealand", cc: "NZ", region: "OC", lat: -41.3272, lng: 174.8053 },
  { iata: "NAN", name: "Nadi Intl", city: "Nadi", country: "Fiji", cc: "FJ", region: "OC", lat: -17.7554, lng: 177.4434 },
  { iata: "PPT", name: "Faa'a Intl", city: "Papeete", country: "French Polynesia", cc: "PF", region: "OC", lat: -17.5537, lng: -149.6072 },
];

// Build a lookup map by IATA code
export const airportByIata: Record<string, Airport> = airports.reduce(
  (acc, a) => {
    acc[a.iata] = a;
    return acc;
  },
  {} as Record<string, Airport>
);

// Group airports by region for the picker UI
export const airportsByRegion: Record<Airport["region"], Airport[]> = airports.reduce(
  (acc, a) => {
    (acc[a.region] ||= []).push(a);
    return acc;
  },
  {} as Record<Airport["region"], Airport[]>
);

// Get airport by IATA, return null if not found
export function getAirport(iata: string): Airport | null {
  return airportByIata[iata.toUpperCase()] ?? null;
}

// Format airport for display
export function formatAirport(a: Airport): string {
  return `${a.iata} · ${a.city} · ${a.country}`;
}

// Format airport short (for compact UI)
export function formatAirportShort(a: Airport): string {
  return `${a.city} (${a.iata})`;
}
