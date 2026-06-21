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

  // === EXPANDED: All countries with commercial aviation ===

  // --- Georgia (the country) ---
  { iata: "TBS", name: "Shota Rustaveli Tbilisi Intl", city: "Tbilisi", country: "Georgia", cc: "GE", region: "AS", lat: 41.6692, lng: 44.9547 },
  { iata: "KUT", name: "David the Builder Kutaisi Intl", city: "Kutaisi", country: "Georgia", cc: "GE", region: "AS", lat: 42.1760, lng: 42.4822 },
  { iata: "BUS", name: "Batumi Intl", city: "Batumi", country: "Georgia", cc: "GE", region: "AS", lat: 41.6029, lng: 41.5990 },

  // --- Armenia ---
  { iata: "EVN", name: "Zvartnots Intl", city: "Yerevan", country: "Armenia", cc: "AM", region: "AS", lat: 40.1473, lng: 44.3959 },

  // --- Azerbaijan ---
  { iata: "GYD", name: "Heydar Aliyev Intl", city: "Baku", country: "Azerbaijan", cc: "AZ", region: "AS", lat: 40.4675, lng: 50.0467 },

  // --- Central Asia: Kazakhstan, Uzbekistan, etc. ---
  { iata: "ALA", name: "Almaty Intl", city: "Almaty", country: "Kazakhstan", cc: "KZ", region: "AS", lat: 43.3521, lng: 77.0405 },
  { iata: "NQZ", name: "Astana Intl (Nursultan Nazarbayev)", city: "Astana", country: "Kazakhstan", cc: "KZ", region: "AS", lat: 51.0222, lng: 71.4669 },
  { iata: "TAS", name: "Tashkent Intl (Islam Karimov)", city: "Tashkent", country: "Uzbekistan", cc: "UZ", region: "AS", lat: 41.2579, lng: 69.2812 },
  { iata: "FRU", name: "Manas Intl", city: "Bishkek", country: "Kyrgyzstan", cc: "KG", region: "AS", lat: 43.0612, lng: 74.4776 },
  { iata: "DYU", name: "Dushanbe Intl", city: "Dushanbe", country: "Tajikistan", cc: "TJ", region: "AS", lat: 38.5433, lng: 68.8250 },
  { iata: "ASB", name: "Ashgabat Intl", city: "Ashgabat", country: "Turkmenistan", cc: "TM", region: "AS", lat: 37.9869, lng: 58.3610 },

  // --- Afghanistan ---
  { iata: "KBL", name: "Hamid Karzai Intl", city: "Kabul", country: "Afghanistan", cc: "AF", region: "AS", lat: 34.5658, lng: 69.2122 },

  // --- Nepal ---
  { iata: "KTM", name: "Tribhuvan Intl", city: "Kathmandu", country: "Nepal", cc: "NP", region: "AS", lat: 27.6966, lng: 85.3591 },

  // --- Bhutan ---
  { iata: "PBH", name: "Paro Intl", city: "Paro", country: "Bhutan", cc: "BT", region: "AS", lat: 27.4032, lng: 89.4246 },

  // --- Maldives ---
  { iata: "MLE", name: "Velana Intl", city: "Malé", country: "Maldives", cc: "MV", region: "AS", lat: 4.1918, lng: 73.5290 },

  // --- Brunei ---
  { iata: "BWN", name: "Brunei Intl", city: "Bandar Seri Begawan", country: "Brunei", cc: "BN", region: "AS", lat: 4.9442, lng: 114.9283 },

  // --- Timor-Leste ---
  { iata: "DIL", name: "Presidente Nicolau Lobato Intl", city: "Dili", country: "Timor-Leste", cc: "TL", region: "AS", lat: -8.5466, lng: 125.5275 },

  // --- Laos ---
  { iata: "VTE", name: "Wattay Intl", city: "Vientiane", country: "Laos", cc: "LA", region: "AS", lat: 17.9883, lng: 102.5630 },

  // --- Cambodia (extra) ---
  { iata: "REP", name: "Siem Reap-Angkor Intl", city: "Siem Reap", country: "Cambodia", cc: "KH", region: "AS", lat: 13.4106, lng: 103.8130 },

  // --- Vietnam (extra) ---
  { iata: "DAD", name: "Da Nang Intl", city: "Da Nang", country: "Vietnam", cc: "VN", region: "AS", lat: 16.1044, lng: 108.1994 },

  // --- Macau, Taiwan (extra) ---
  { iata: "MFM", name: "Macau Intl", city: "Macau", country: "Macau", cc: "MO", region: "AS", lat: 22.1496, lng: 113.5916 },
  { iata: "KHH", name: "Kaohsiung Intl", city: "Kaohsiung", country: "Taiwan", cc: "TW", region: "AS", lat: 22.5771, lng: 120.3499 },

  // --- Japan (extra) ---
  { iata: "ITM", name: "Osaka Itami", city: "Osaka", country: "Japan", cc: "JP", region: "AS", lat: 34.7855, lng: 135.4382 },
  { iata: "SDJ", name: "Sendai", city: "Sendai", country: "Japan", cc: "JP", region: "AS", lat: 38.1397, lng: 140.9170 },
  { iata: "FUK", name: "Fukuoka", city: "Fukuoka", country: "Japan", cc: "JP", region: "AS", lat: 33.5859, lng: 130.4509 },
  { iata: "OKA", name: "Naha", city: "Okinawa", country: "Japan", cc: "JP", region: "AS", lat: 26.1958, lng: 127.6458 },

  // --- South Korea (extra) ---
  { iata: "PUS", name: "Gimhae Intl", city: "Busan", country: "South Korea", cc: "KR", region: "AS", lat: 35.1795, lng: 128.9376 },
  { iata: "CJU", name: "Jeju Intl", city: "Jeju", country: "South Korea", cc: "KR", region: "AS", lat: 33.5113, lng: 126.4930 },

  // --- China (extra) ---
  { iata: "HGH", name: "Hangzhou Xiaoshan", city: "Hangzhou", country: "China", cc: "CN", region: "AS", lat: 30.2295, lng: 120.4344 },
  { iata: "XIY", name: "Xi'an Xianyang", city: "Xi'an", country: "China", cc: "CN", region: "AS", lat: 34.4471, lng: 108.7517 },
  { iata: "KMG", name: "Kunming Changshui", city: "Kunming", country: "China", cc: "CN", region: "AS", lat: 25.1019, lng: 102.9292 },
  { iata: "XMN", name: "Xiamen Gaoqi", city: "Xiamen", country: "China", cc: "CN", region: "AS", lat: 24.5440, lng: 118.1273 },
  { iata: "WUH", name: "Wuhan Tianhe", city: "Wuhan", country: "China", cc: "CN", region: "AS", lat: 30.7838, lng: 114.2081 },
  { iata: "SHE", name: "Shenyang Taoxian", city: "Shenyang", country: "China", cc: "CN", region: "AS", lat: 41.6398, lng: 123.4836 },

  // --- Hong Kong, Macau, etc. already covered ---

  // --- Malaysia (extra) ---
  { iata: "PEN", name: "Penang Intl", city: "Penang", country: "Malaysia", cc: "MY", region: "AS", lat: 5.2971, lng: 100.2767 },
  { iata: "BKI", name: "Kota Kinabalu Intl", city: "Kota Kinabalu", country: "Malaysia", cc: "MY", region: "AS", lat: 5.9372, lng: 116.0511 },
  { iata: "KCH", name: "Kuching Intl", city: "Kuching", country: "Malaysia", cc: "MY", region: "AS", lat: 1.4847, lng: 110.3469 },

  // --- Indonesia (extra) ---
  { iata: "UPG", name: "Sultan Hasanuddin", city: "Makassar", country: "Indonesia", cc: "ID", region: "AS", lat: -5.0617, lng: 119.5540 },
  { iata: "SUB", name: "Juanda Intl", city: "Surabaya", country: "Indonesia", cc: "ID", region: "AS", lat: -7.3797, lng: 112.7869 },
  { iata: "LOP", name: "Lombok Intl", city: "Lombok", country: "Indonesia", cc: "ID", region: "AS", lat: -8.7572, lng: 116.2767 },

  // --- Philippines (extra) ---
  { iata: "MNL", name: "Ninoy Aquino Intl", city: "Manila", country: "Philippines", cc: "PH", region: "AS", lat: 14.5086, lng: 121.0194 },
  { iata: "CRK", name: "Clark Intl", city: "Angeles City", country: "Philippines", cc: "PH", region: "AS", lat: 15.1860, lng: 120.5602 },

  // --- Thailand (extra) ---
  { iata: "HKT", name: "Phuket Intl", city: "Phuket", country: "Thailand", cc: "TH", region: "AS", lat: 7.8900, lng: 98.2917 },
  { iata: "CNX", name: "Chiang Mai Intl", city: "Chiang Mai", country: "Thailand", cc: "TH", region: "AS", lat: 18.7669, lng: 98.9627 },
  { iata: "USM", name: "Samui Intl", city: "Koh Samui", country: "Thailand", cc: "TH", region: "AS", lat: 9.5479, lng: 100.0623 },

  // --- Myanmar (extra) ---
  { iata: "RGN", name: "Yangon Intl", city: "Yangon", country: "Myanmar", cc: "MM", region: "AS", lat: 16.9073, lng: 96.1332 },
  { iata: "MDL", name: "Mandalay Intl", city: "Mandalay", country: "Myanmar", cc: "MM", region: "AS", lat: 21.7022, lng: 95.9779 },

  // --- Africa expanded ---
  { iata: "ABV", name: "Nnamdi Azikiwe Intl", city: "Abuja", country: "Nigeria", cc: "NG", region: "AF", lat: 9.0068, lng: 7.2632 },
  { iata: "KAN", name: "Mallam Aminu Kano Intl", city: "Kano", country: "Nigeria", cc: "NG", region: "AF", lat: 12.0476, lng: 8.5246 },
  { iata: "JRO", name: "Kilimanjaro Intl", city: "Moshi", country: "Tanzania", cc: "TZ", region: "AF", lat: -3.4291, lng: 37.0745 },
  { iata: "ZNZ", name: "Abeid Amani Karume Intl", city: "Zanzibar", country: "Tanzania", cc: "TZ", region: "AF", lat: -6.2220, lng: 39.2249 },
  { iata: "KGL", name: "Kigali Intl", city: "Kigali", country: "Rwanda", cc: "RW", region: "AF", lat: -1.9686, lng: 30.1395 },
  { iata: "BJM", name: "Bujumbura Intl", city: "Bujumbura", country: "Burundi", cc: "BI", region: "AF", lat: -3.3240, lng: 29.3185 },
  { iata: "FIH", name: "N'djili (Kinshasa Intl)", city: "Kinshasa", country: "DR Congo", cc: "CD", region: "AF", lat: -4.3858, lng: 15.4446 },
  { iata: "FBM", name: "Lubumbashi Intl", city: "Lubumbashi", country: "DR Congo", cc: "CD", region: "AF", lat: -11.5913, lng: 27.5309 },
  { iata: "BZV", name: "Maya-Maya", city: "Brazzaville", country: "Republic of the Congo", cc: "CG", region: "AF", lat: -4.2515, lng: 15.2530 },
  { iata: "LBV", name: "Libreville Intl", city: "Libreville", country: "Gabon", cc: "GA", region: "AF", lat: 0.4586, lng: 9.4123 },
  { iata: "DLA", name: "Douala Intl", city: "Douala", country: "Cameroon", cc: "CM", region: "AF", lat: 4.0061, lng: 9.7195 },
  { iata: "NSI", name: "Yaoundé Nsimalen", city: "Yaoundé", country: "Cameroon", cc: "CM", region: "AF", lat: 3.7226, lng: 11.5532 },
  { iata: "ABJ", name: "Félix-Houphouët-Boigny Intl", city: "Abidjan", country: "Côte d'Ivoire", cc: "CI", region: "AF", lat: 5.2614, lng: -3.9263 },
  { iata: "DKR", name: "Blaise Diagne Intl", city: "Dakar", country: "Senegal", cc: "SN", region: "AF", lat: 14.6708, lng: -17.0729 },
  { iata: "BKO", name: "Bamako-Sénou", city: "Bamako", country: "Mali", cc: "ML", region: "AF", lat: 12.5335, lng: -7.9499 },
  { iata: "NIM", name: "Diori Hamani Intl", city: "Niamey", country: "Niger", cc: "NE", region: "AF", lat: 13.4815, lng: 2.1836 },
  { iata: "OUA", name: "Ouagadougou Intl", city: "Ouagadougou", country: "Burkina Faso", cc: "BF", region: "AF", lat: 12.3532, lng: -1.5125 },
  { iata: "LFW", name: "Lomé-Tokoin (Gnassingbé Eyadéma)", city: "Lomé", country: "Togo", cc: "TG", region: "AF", lat: 6.1656, lng: 1.2545 },
  { iata: "COO", name: "Cotonou Cadjehoun", city: "Cotonou", country: "Benin", cc: "BJ", region: "AF", lat: 6.3573, lng: 2.3844 },
  { iata: "FNA", name: "Lungi Intl", city: "Freetown", country: "Sierra Leone", cc: "SL", region: "AF", lat: 8.6164, lng: -13.1956 },
  { iata: "ROB", name: "Roberts Intl", city: "Monrovia", country: "Liberia", cc: "LR", region: "AF", lat: 6.2337, lng: -10.3623 },
  { iata: "BJL", name: "Banjul Intl", city: "Banjul", country: "Gambia", cc: "GM", region: "AF", lat: 13.3380, lng: -16.6522 },
  { iata: "NKC", name: "Nouakchott–Oumtounsy Intl", city: "Nouakchott", country: "Mauritania", cc: "MR", region: "AF", lat: 18.3137, lng: -15.9697 },
  { iata: "NDJ", name: "N'Djamena Intl", city: "N'Djamena", country: "Chad", cc: "TD", region: "AF", lat: 12.1337, lng: 15.0340 },
  { iata: "KRT", name: "Khartoum Intl", city: "Khartoum", country: "Sudan", cc: "SD", region: "AF", lat: 15.5895, lng: 32.5532 },
  { iata: "MGQ", name: "Aden Adde Intl", city: "Mogadishu", country: "Somalia", cc: "SO", region: "AF", lat: 2.0144, lng: 45.3046 },
  { iata: "HAH", name: "Prince Said Ibrahim Intl", city: "Moroni", country: "Comoros", cc: "KM", region: "AF", lat: -11.5360, lng: 43.2746 },
  { iata: "TNR", name: "Ivato Intl", city: "Antananarivo", country: "Madagascar", cc: "MG", region: "AF", lat: -18.7969, lng: 47.4788 },
  { iata: "RUN", name: "Roland Garros", city: "Saint-Denis", country: "Réunion", cc: "RE", region: "AF", lat: -20.8871, lng: 55.5103 },
  { iata: "SEZ", name: "Seychelles Intl", city: "Mahé", country: "Seychelles", cc: "SC", region: "AF", lat: -4.6743, lng: 55.5218 },
  { iata: "MPM", name: "Maputo Intl", city: "Maputo", country: "Mozambique", cc: "MZ", region: "AF", lat: -25.9208, lng: 32.5726 },
  { iata: "LAD", name: "Quatro de Fevereiro", city: "Luanda", country: "Angola", cc: "AO", region: "AF", lat: -8.8584, lng: 13.2309 },
  { iata: "WDH", name: "Hosea Kutako Intl", city: "Windhoek", country: "Namibia", cc: "NA", region: "AF", lat: -22.4799, lng: 17.4709 },
  { iata: "GBE", name: "Sir Seretse Khama Intl", city: "Gaborone", country: "Botswana", cc: "BW", region: "AF", lat: -24.5553, lng: 25.9182 },
  { iata: "LLW", name: "Lilongwe Intl", city: "Lilongwe", country: "Malawi", cc: "MW", region: "AF", lat: -13.7894, lng: 33.7811 },
  { iata: "HRE", name: "Robert Gabriel Mugabe Intl", city: "Harare", country: "Zimbabwe", cc: "ZW", region: "AF", lat: -17.9319, lng: 31.0928 },
  { iata: "BUQ", name: "Joshua Mqabuko Nkomo Intl", city: "Bulawayo", country: "Zimbabwe", cc: "ZW", region: "AF", lat: -20.0169, lng: 28.6106 },
  { iata: "LUN", name: "Kenneth Kaunda Intl", city: "Lusaka", country: "Zambia", cc: "ZM", region: "AF", lat: -15.3308, lng: 28.4526 },
  { iata: "KMI", name: "Kamembe", city: "Cyangugu", country: "Rwanda", cc: "RW", region: "AF", lat: -2.4621, lng: 28.9100 },
  { iata: "EBB", name: "Entebbe Intl", city: "Entebbe", country: "Uganda", cc: "UG", region: "AF", lat: 0.0424, lng: 32.4435 },
  { iata: "MBA", name: "Moi Intl", city: "Mombasa", country: "Kenya", cc: "KE", region: "AF", lat: -4.0348, lng: 39.5942 },
  { iata: "ZNZ", name: "Abeid Amani Karume Intl", city: "Zanzibar", country: "Tanzania", cc: "TZ", region: "AF", lat: -6.2220, lng: 39.2249 },
  { iata: "DUR", name: "King Shaka Intl", city: "Durban", country: "South Africa", cc: "ZA", region: "AF", lat: -29.6144, lng: 31.1197 },
  { iata: "GBE", name: "Sir Seretse Khama Intl", city: "Gaborone", country: "Botswana", cc: "BW", region: "AF", lat: -24.5553, lng: 25.9182 },
  { iata: "SHO", name: "King Mswati III Intl", city: "Manzini", country: "Eswatini", cc: "SZ", region: "AF", lat: -26.5290, lng: 31.7022 },
  { iata: "MSU", name: "Moshoeshoe I Intl", city: "Maseru", country: "Lesotho", cc: "LS", region: "AF", lat: -29.4622, lng: 27.5490 },

  // --- Europe expanded ---
  { iata: "LCA", name: "Larnaca Intl (Hermes)", city: "Larnaca", country: "Cyprus", cc: "CY", region: "EU", lat: 34.8751, lng: 33.6249 },
  { iata: "PFO", name: "Paphos Intl", city: "Paphos", country: "Cyprus", cc: "CY", region: "EU", lat: 34.7180, lng: 32.4857 },
  { iata: "MLA", name: "Malta Intl", city: "Luqa", country: "Malta", cc: "MT", region: "EU", lat: 35.8597, lng: 14.4777 },
  { iata: "BFS", name: "Belfast Intl", city: "Belfast", country: "United Kingdom", cc: "GB", region: "EU", lat: 54.6575, lng: -6.2158 },
  { iata: "GLA", name: "Glasgow Intl", city: "Glasgow", country: "United Kingdom", cc: "GB", region: "EU", lat: 55.8719, lng: -4.4331 },
  { iata: "BHX", name: "Birmingham", city: "Birmingham", country: "United Kingdom", cc: "GB", region: "EU", lat: 52.4539, lng: -1.7480 },
  { iata: "LTN", name: "London Luton", city: "London", country: "United Kingdom", cc: "GB", region: "EU", lat: 51.8747, lng: -0.3683 },
  { iata: "LYS", name: "Lyon-Saint Exupéry", city: "Lyon", country: "France", cc: "FR", region: "EU", lat: 45.7256, lng: 5.0811 },
  { iata: "MRS", name: "Marseille Provence", city: "Marseille", country: "France", cc: "FR", region: "EU", lat: 43.4393, lng: 5.2214 },
  { iata: "BOD", name: "Bordeaux-Mérignac", city: "Bordeaux", country: "France", cc: "FR", region: "EU", lat: 44.8283, lng: -0.7156 },
  { iata: "TLS", name: "Toulouse-Blagnac", city: "Toulouse", country: "France", cc: "FR", region: "EU", lat: 43.6293, lng: 1.3638 },
  { iata: "DUS", name: "Düsseldorf Intl", city: "Düsseldorf", country: "Germany", cc: "DE", region: "EU", lat: 51.2895, lng: 6.7668 },
  { iata: "STR", name: "Stuttgart", city: "Stuttgart", country: "Germany", cc: "DE", region: "EU", lat: 48.6899, lng: 9.2220 },
  { iata: "CGN", name: "Cologne Bonn", city: "Cologne", country: "Germany", cc: "DE", region: "EU", lat: 50.8659, lng: 7.1427 },
  { iata: "HAJ", name: "Hannover", city: "Hannover", country: "Germany", cc: "DE", region: "EU", lat: 52.4611, lng: 9.6850 },
  { iata: "NUE", name: "Nuremberg", city: "Nuremberg", country: "Germany", cc: "DE", region: "EU", lat: 49.4987, lng: 11.0670 },
  { iata: "DRS", name: "Dresden", city: "Dresden", country: "Germany", cc: "DE", region: "EU", lat: 51.1328, lng: 13.7672 },
  { iata: "FCO", name: "Rome-Fiumicino", city: "Rome", country: "Italy", cc: "IT", region: "EU", lat: 41.8003, lng: 12.2389 },
  { iata: "BLQ", name: "Bologna Guglielmo Marconi", city: "Bologna", country: "Italy", cc: "IT", region: "EU", lat: 44.5354, lng: 11.2887 },
  { iata: "NAP", name: "Naples Intl", city: "Naples", country: "Italy", cc: "IT", region: "EU", lat: 40.8860, lng: 14.2908 },
  { iata: "FLR", name: "Florence Peretola", city: "Florence", country: "Italy", cc: "IT", region: "EU", lat: 43.8100, lng: 11.2051 },
  { iata: "CTA", name: "Catania-Fontanarossa", city: "Catania", country: "Italy", cc: "IT", region: "EU", lat: 37.4668, lng: 15.0664 },
  { iata: "PMO", name: "Palermo Falcone-Borsellino", city: "Palermo", country: "Italy", cc: "IT", region: "EU", lat: 38.1759, lng: 13.0910 },
  { iata: "OLB", name: "Olbia Costa Smeralda", city: "Olbia", country: "Italy", cc: "IT", region: "EU", lat: 40.8987, lng: 9.5176 },
  { iata: "CRL", name: "Brussels South Charleroi", city: "Charleroi", country: "Belgium", cc: "BE", region: "EU", lat: 50.4592, lng: 4.4538 },
  { iata: "LIL", name: "Lille-Lesquin", city: "Lille", country: "France", cc: "FR", region: "EU", lat: 50.5641, lng: 3.0975 },
  { iata: "RTM", name: "Rotterdam The Hague", city: "Rotterdam", country: "Netherlands", cc: "NL", region: "EU", lat: 51.9569, lng: 4.4372 },
  { iata: "EIN", name: "Eindhoven", city: "Eindhoven", country: "Netherlands", cc: "NL", region: "EU", lat: 51.4583, lng: 5.3917 },
  { iata: "LUX", name: "Luxembourg (Findel)", city: "Luxembourg", country: "Luxembourg", cc: "LU", region: "EU", lat: 49.6233, lng: 6.2044 },
  { iata: "KEF", name: "Keflavík Intl", city: "Reykjavík", country: "Iceland", cc: "IS", region: "EU", lat: 63.9850, lng: -22.6056 },
  { iata: "GOT", name: "Gothenburg Landvetter", city: "Gothenburg", country: "Sweden", cc: "SE", region: "EU", lat: 57.6628, lng: 12.2798 },
  { iata: "BGO", name: "Bergen Flesland", city: "Bergen", country: "Norway", cc: "NO", region: "EU", lat: 60.2934, lng: 5.2181 },
  { iata: "TRD", name: "Trondheim Værnes", city: "Trondheim", country: "Norway", cc: "NO", region: "EU", lat: 63.4578, lng: 10.9239 },
  { iata: "BLL", name: "Billund", city: "Billund", country: "Denmark", cc: "DK", region: "EU", lat: 55.7403, lng: 9.1518 },
  { iata: "GOT", name: "Gothenburg Landvetter", city: "Gothenburg", country: "Sweden", cc: "SE", region: "EU", lat: 57.6628, lng: 12.2798 },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland", cc: "FI", region: "EU", lat: 60.3172, lng: 24.9633 },
  { iata: "TLL", name: "Lennart Meri Tallinn", city: "Tallinn", country: "Estonia", cc: "EE", region: "EU", lat: 59.4133, lng: 24.8328 },
  { iata: "RIX", name: "Riga Intl", city: "Riga", country: "Latvia", cc: "LV", region: "EU", lat: 56.9236, lng: 23.9711 },
  { iata: "VNO", name: "Vilnius Intl", city: "Vilnius", country: "Lithuania", cc: "LT", region: "EU", lat: 54.6341, lng: 25.2858 },
  { iata: "KUN", name: "Kaunas", city: "Kaunas", country: "Lithuania", cc: "LT", region: "EU", lat: 54.9639, lng: 24.0848 },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", cc: "PL", region: "EU", lat: 52.1657, lng: 20.9671 },
  { iata: "KRK", name: "Kraków John Paul II", city: "Kraków", country: "Poland", cc: "PL", region: "EU", lat: 50.0777, lng: 19.7848 },
  { iata: "GDN", name: "Gdańsk Lech Wałęsa", city: "Gdańsk", country: "Poland", cc: "PL", region: "EU", lat: 54.3776, lng: 18.4662 },
  { iata: "KTW", name: "Katowice (Pyrzowice)", city: "Katowice", country: "Poland", cc: "PL", region: "EU", lat: 50.4742, lng: 19.0800 },
  { iata: "PRG", name: "Prague Václav Havel", city: "Prague", country: "Czech Republic", cc: "CZ", region: "EU", lat: 50.1008, lng: 14.2600 },
  { iata: "BTS", name: "Bratislava M. R. Štefánik", city: "Bratislava", country: "Slovakia", cc: "SK", region: "EU", lat: 48.1703, lng: 17.2127 },
  { iata: "BUD", name: "Budapest Ferenc Liszt", city: "Budapest", country: "Hungary", cc: "HU", region: "EU", lat: 47.4369, lng: 19.2556 },
  { iata: "OTP", name: "Bucharest Henri Coandă", city: "Bucharest", country: "Romania", cc: "RO", region: "EU", lat: 44.5711, lng: 26.0858 },
  { iata: "CLJ", name: "Cluj-Napoca Intl", city: "Cluj-Napoca", country: "Romania", cc: "RO", region: "EU", lat: 46.7853, lng: 23.6862 },
  { iata: "SOF", name: "Sofia", city: "Sofia", country: "Bulgaria", cc: "BG", region: "EU", lat: 42.6951, lng: 23.4061 },
  { iata: "VAR", name: "Varna", city: "Varna", country: "Bulgaria", cc: "BG", region: "EU", lat: 43.2321, lng: 27.8251 },
  { iata: "BEG", name: "Belgrade Nikola Tesla", city: "Belgrade", country: "Serbia", cc: "RS", region: "EU", lat: 44.8184, lng: 20.3091 },
  { iata: "ZAG", name: "Zagreb Franjo Tuđman", city: "Zagreb", country: "Croatia", cc: "HR", region: "EU", lat: 45.7429, lng: 16.0688 },
  { iata: "SPU", name: "Split", city: "Split", country: "Croatia", cc: "HR", region: "EU", lat: 43.5389, lng: 16.2980 },
  { iata: "DBV", name: "Dubrovnik", city: "Dubrovnik", country: "Croatia", cc: "HR", region: "EU", lat: 42.5614, lng: 18.2682 },
  { iata: "SJJ", name: "Sarajevo Intl", city: "Sarajevo", country: "Bosnia and Herzegovina", cc: "BA", region: "EU", lat: 43.8246, lng: 18.3315 },
  { iata: "TGD", name: "Podgorica", city: "Podgorica", country: "Montenegro", cc: "ME", region: "EU", lat: 42.3594, lng: 19.2519 },
  { iata: "TIV", name: "Tivat", city: "Tivat", country: "Montenegro", cc: "ME", region: "EU", lat: 42.4049, lng: 18.7244 },
  { iata: "PRN", name: "Pristina Intl (Adem Jashari)", city: "Pristina", country: "Kosovo", cc: "XK", region: "EU", lat: 42.5784, lng: 21.0359 },
  { iata: "SKP", name: "Skopje Intl", city: "Skopje", country: "North Macedonia", cc: "MK", region: "EU", lat: 41.9619, lng: 21.6214 },
  { iata: "TIA", name: "Tirana Intl (Nënë Tereza)", city: "Tirana", country: "Albania", cc: "AL", region: "EU", lat: 41.4147, lng: 19.7206 },
  { iata: "KIV", name: "Chișinău Intl", city: "Chișinău", country: "Moldova", cc: "MD", region: "EU", lat: 46.9277, lng: 28.9310 },
  { iata: "SVO", name: "Moscow Sheremetyevo", city: "Moscow", country: "Russia", cc: "RU", region: "EU", lat: 55.9728, lng: 37.4147 },
  { iata: "DME", name: "Moscow Domodedovo", city: "Moscow", country: "Russia", cc: "RU", region: "EU", lat: 55.4146, lng: 37.9019 },
  { iata: "VKO", name: "Moscow Vnukovo", city: "Moscow", country: "Russia", cc: "RU", region: "EU", lat: 55.5915, lng: 37.2615 },
  { iata: "LED", name: "Saint Petersburg Pulkovo", city: "Saint Petersburg", country: "Russia", cc: "RU", region: "EU", lat: 59.8003, lng: 30.2625 },
  { iata: "KZN", name: "Kazan", city: "Kazan", country: "Russia", cc: "RU", region: "EU", lat: 55.6062, lng: 49.2787 },
  { iata: "AER", name: "Sochi", city: "Sochi", country: "Russia", cc: "RU", region: "EU", lat: 43.4499, lng: 39.9566 },
  { iata: "SVX", name: "Yekaterinburg Koltsovo", city: "Yekaterinburg", country: "Russia", cc: "RU", region: "EU", lat: 56.7430, lng: 60.8027 },
  { iata: "OVB", name: "Novosibirsk Tolmachevo", city: "Novosibirsk", country: "Russia", cc: "RU", region: "AS", lat: 55.0125, lng: 82.6507 },
  { iata: "VVO", name: "Vladivostok Intl", city: "Vladivostok", country: "Russia", cc: "RU", region: "AS", lat: 43.3990, lng: 132.1483 },
  { iata: "KBP", name: "Boryspil Intl", city: "Kyiv", country: "Ukraine", cc: "UA", region: "EU", lat: 50.3450, lng: 30.8947 },
  { iata: "IEV", name: "Kyiv Zhuliany", city: "Kyiv", country: "Ukraine", cc: "UA", region: "EU", lat: 50.4017, lng: 30.4497 },
  { iata: "LWO", name: "Lviv Danylo Halytskyi", city: "Lviv", country: "Ukraine", cc: "UA", region: "EU", lat: 49.8125, lng: 23.9561 },
  { iata: "MSK", name: "Minsk Intl", city: "Minsk", country: "Belarus", cc: "BY", region: "EU", lat: 53.8825, lng: 28.0307 },

  // --- Middle East expanded ---
  { iata: "DAE", name: "Dammam King Fahd Intl", city: "Dammam", country: "Saudi Arabia", cc: "SA", region: "ME", lat: 26.4712, lng: 49.7979 },
  { iata: "MED", name: "Prince Mohammad bin Abdulaziz", city: "Medina", country: "Saudi Arabia", cc: "SA", region: "ME", lat: 24.5534, lng: 39.7051 },
  { iata: "AHB", name: "Abha Regional", city: "Abha", country: "Saudi Arabia", cc: "SA", region: "ME", lat: 18.2404, lng: 42.6566 },
  { iata: "EBL", name: "Erbil Intl", city: "Erbil", country: "Iraq", cc: "IQ", region: "ME", lat: 36.2376, lng: 43.9632 },
  { iata: "BSR", name: "Basra Intl", city: "Basra", country: "Iraq", cc: "IQ", region: "ME", lat: 30.5491, lng: 47.6621 },
  { iata: "IKA", name: "Tehran Imam Khomeini Intl", city: "Tehran", country: "Iran", cc: "IR", region: "ME", lat: 35.4161, lng: 51.1522 },
  { iata: "THR", name: "Tehran Mehrabad", city: "Tehran", country: "Iran", cc: "IR", region: "ME", lat: 35.6892, lng: 51.3134 },
  { iata: "MHD", name: "Mashhad Hashemi Nezhad", city: "Mashhad", country: "Iran", cc: "IR", region: "ME", lat: 36.2353, lng: 59.6410 },
  { iata: "SYZ", name: "Shiraz Intl", city: "Shiraz", country: "Iran", cc: "IR", region: "ME", lat: 29.5392, lng: 52.5896 },
  { iata: "KBL", name: "Hamid Karzai Intl", city: "Kabul", country: "Afghanistan", cc: "AF", region: "AS", lat: 34.5658, lng: 69.2122 },
  { iata: "RKT", name: "Ras Al Khaimah Intl", city: "Ras Al Khaimah", country: "United Arab Emirates", cc: "AE", region: "ME", lat: 25.6129, lng: 55.9383 },
  { iata: "SHJ", name: "Sharjah Intl", city: "Sharjah", country: "United Arab Emirates", cc: "AE", region: "ME", lat: 25.3286, lng: 55.5172 },
  { iata: "DMM", name: "Daman", city: "Daman", country: "India", cc: "IN", region: "AS", lat: 20.4054, lng: 72.8245 },
  { iata: "GOI", name: "Goa Dabolim", city: "Goa", country: "India", cc: "IN", region: "AS", lat: 15.3808, lng: 73.8314 },
  { iata: "GAU", name: "Guwahati Lokpriya Gopinath Bordoloi", city: "Guwahati", country: "India", cc: "IN", region: "AS", lat: 26.1061, lng: 91.5859 },
  { iata: "TRV", name: "Thiruvananthapuram Intl", city: "Thiruvananthapuram", country: "India", cc: "IN", region: "AS", lat: 8.4821, lng: 76.9200 },
  { iata: "COK", name: "Cochin Intl", city: "Kochi", country: "India", cc: "IN", region: "AS", lat: 10.1520, lng: 76.4019 },
  { iata: "IXR", name: "Ranchi Birsa Munda", city: "Ranchi", country: "India", cc: "IN", region: "AS", lat: 23.3143, lng: 85.3217 },
  { iata: "PNQ", name: "Pune", city: "Pune", country: "India", cc: "IN", region: "AS", lat: 18.5793, lng: 73.9089 },
  { iata: "AMD", name: "Ahmedabad Sardar Vallabhbhai Patel", city: "Ahmedabad", country: "India", cc: "IN", region: "AS", lat: 23.0772, lng: 72.6347 },
  { iata: "JAI", name: "Jaipur Intl", city: "Jaipur", country: "India", cc: "IN", region: "AS", lat: 26.8242, lng: 75.8122 },

  // --- South America expanded ---
  { iata: "CNF", name: "Belo Horizonte Tancredo Neves (Confins)", city: "Belo Horizonte", country: "Brazil", cc: "BR", region: "SA", lat: -19.6336, lng: -43.9686 },
  { iata: "BSB", name: "Brília Presidente Juscelino Kubitschek", city: "Brasília", country: "Brazil", cc: "BR", region: "SA", lat: -15.8697, lng: -47.9208 },
  { iata: "SSA", name: "Salvador Dep. Luís Eduardo Magalhães", city: "Salvador", country: "Brazil", cc: "BR", region: "SA", lat: -12.9086, lng: -38.3225 },
  { iata: "REC", name: "Recife Guararapes-Gilberto Freyre", city: "Recife", country: "Brazil", cc: "BR", region: "SA", lat: -8.1264, lng: -34.9236 },
  { iata: "FOR", name: "Fortaleza Pinto Martins", city: "Fortaleza", country: "Brazil", cc: "BR", region: "SA", lat: -3.7763, lng: -38.5326 },
  { iata: "POA", name: "Porto Alegre Salgado Filho", city: "Porto Alegre", country: "Brazil", cc: "BR", region: "SA", lat: -29.9939, lng: -51.1714 },
  { iata: "CWB", name: "Curitiba Afonso Pena", city: "Curitiba", country: "Brazil", cc: "BR", region: "SA", lat: -25.5285, lng: -49.1758 },
  { iata: "MAO", name: "Manaus Eduardo Gomes", city: "Manaus", country: "Brazil", cc: "BR", region: "SA", lat: -3.0386, lng: -60.0497 },
  { iata: "VCP", name: "Campinas Viracopos", city: "Campinas", country: "Brazil", cc: "BR", region: "SA", lat: -23.0066, lng: -47.1345 },
  { iata: "CGB", name: "Cuiabá Marechal Rondon", city: "Cuiabá", country: "Brazil", cc: "BR", region: "SA", lat: -15.6529, lng: -56.1167 },
  { iata: "CTG", name: "Cartagena Rafael Núñez", city: "Cartagena", country: "Colombia", cc: "CO", region: "SA", lat: 10.4424, lng: -75.5130 },
  { iata: "MDE", name: "Medellín José María Córdova", city: "Medellín", country: "Colombia", cc: "CO", region: "SA", lat: 6.1645, lng: -75.4231 },
  { iata: "CLO", name: "Cali Alfonso Bonilla Aragón", city: "Cali", country: "Colombia", cc: "CO", region: "SA", lat: 3.5432, lng: -76.3815 },
  { iata: "GYE", name: "Guayaquil José Joaquín de Olmedo", city: "Guayaquil", country: "Ecuador", cc: "EC", region: "SA", lat: -2.1574, lng: -79.8836 },
  { iata: "UIO", name: "Quito Mariscal Sucre", city: "Quito", country: "Ecuador", cc: "EC", region: "SA", lat: -0.1292, lng: -78.3575 },
  { iata: "CJC", name: "Calama El Loa", city: "Calama", country: "Chile", cc: "CL", region: "SA", lat: -22.4982, lng: -68.9036 },
  { iata: "IPC", name: "Isla de Pascua (Mataveri)", city: "Easter Island", country: "Chile", cc: "CL", region: "SA", lat: -27.1648, lng: -109.4218 },
  { iata: "VVI", name: "Viru Viru Intl", city: "Santa Cruz", country: "Bolivia", cc: "BO", region: "SA", lat: -17.6448, lng: -63.1354 },
  { iata: "LPB", name: "La Paz El Alto Intl", city: "La Paz", country: "Bolivia", cc: "BO", region: "SA", lat: -16.5133, lng: -68.1925 },
  { iata: "ASU", name: "Silvio Pettirossi Intl", city: "Asunción", country: "Paraguay", cc: "PY", region: "SA", lat: -25.2400, lng: -57.5193 },
  { iata: "PDP", name: "Punta del Este (Capitán Corbeta CA Curbelo)", city: "Punta del Este", country: "Uruguay", cc: "UY", region: "SA", lat: -34.8551, lng: -55.0944 },
  { iata: "CCS", name: "Caracas Simón Bolívar", city: "Caracas", country: "Venezuela", cc: "VE", region: "SA", lat: 10.6013, lng: -66.9911 },
  { iata: "MAR", name: "Maracaibo La Chinita", city: "Maracaibo", country: "Venezuela", cc: "VE", region: "SA", lat: 10.5582, lng: -71.7279 },
  { iata: "GEO", name: "Cheddi Jagan Intl", city: "Georgetown", country: "Guyana", cc: "GY", region: "SA", lat: 6.4985, lng: -58.2541 },
  { iata: "PBM", name: "Paramaribo Johan Adolf Pengel Intl", city: "Paramaribo", country: "Suriname", cc: "SR", region: "SA", lat: 5.4528, lng: -55.1878 },
  { iata: "CAY", name: "Cayenne Félix Eboué", city: "Cayenne", country: "French Guiana", cc: "GF", region: "SA", lat: 4.8224, lng: -52.3653 },

  // --- Central America & Caribbean ---
  { iata: "GUA", name: "Guatemala City La Aurora", city: "Guatemala City", country: "Guatemala", cc: "GT", region: "NA", lat: 14.5833, lng: -90.5275 },
  { iata: "SAL", name: "San Salvador Monseñor Óscar Arnulfo Romero", city: "San Salvador", country: "El Salvador", cc: "SV", region: "NA", lat: 13.4409, lng: -89.0557 },
  { iata: "TGU", name: "Tegucigalpa Toncontín", city: "Tegucigalpa", country: "Honduras", cc: "HN", region: "NA", lat: 14.0608, lng: -87.2172 },
  { iata: "SAP", name: "San Pedro Sula Ramón Villeda Morales", city: "San Pedro Sula", country: "Honduras", cc: "HN", region: "NA", lat: 15.4525, lng: -87.9234 },
  { iata: "MGA", name: "Managua Augusto C. Sandino", city: "Managua", country: "Nicaragua", cc: "NI", region: "NA", lat: 12.1415, lng: -86.1681 },
  { iata: "SJO", name: "San José Juan Santamaría", city: "San José", country: "Costa Rica", cc: "CR", region: "NA", lat: 9.9939, lng: -84.2088 },
  { iata: "LIR", name: "Liberia Daniel Oduber Quirós", city: "Liberia", country: "Costa Rica", cc: "CR", region: "NA", lat: 10.5933, lng: -85.5444 },
  { iata: "PTY", name: "Tocumen Intl", city: "Panama City", country: "Panama", cc: "PA", region: "SA", lat: 9.0714, lng: -79.3835 },
  { iata: "PAP", name: "Port-au-Prince Toussaint Louverture", city: "Port-au-Prince", country: "Haiti", cc: "HT", region: "NA", lat: 18.5800, lng: -72.2925 },
  { iata: "SDQ", name: "Santo Domingo Las Américas", city: "Santo Domingo", country: "Dominican Republic", cc: "DO", region: "NA", lat: 18.4297, lng: -69.6689 },
  { iata: "PUJ", name: "Punta Cana", city: "Punta Cana", country: "Dominican Republic", cc: "DO", region: "NA", lat: 18.5674, lng: -68.3634 },
  { iata: "SJU", name: "San Juan Luis Muñoz Marín", city: "San Juan", country: "Puerto Rico", cc: "PR", region: "NA", lat: 18.4394, lng: -66.0018 },
  { iata: "KIN", name: "Kingston Norman Manley", city: "Kingston", country: "Jamaica", cc: "JM", region: "NA", lat: 17.9357, lng: -76.7875 },
  { iata: "MBJ", name: "Montego Bay Sangster", city: "Montego Bay", country: "Jamaica", cc: "JM", region: "NA", lat: 18.5037, lng: -77.9134 },
  { iata: "HAV", name: "Havana José Martí", city: "Havana", country: "Cuba", cc: "CU", region: "NA", lat: 22.9933, lng: -82.4091 },
  { iata: "NAS", name: "Nassau Lynden Pindling", city: "Nassau", country: "Bahamas", cc: "BS", region: "NA", lat: 25.0389, lng: -77.4661 },
  { iata: "FPO", name: "Freeport Grand Bahama", city: "Freeport", country: "Bahamas", cc: "BS", region: "NA", lat: 26.5587, lng: -78.6956 },
  { iata: "GCM", name: "Grand Cayman Owen Roberts Intl", city: "George Town", country: "Cayman Islands", cc: "KY", region: "NA", lat: 19.2929, lng: -81.3576 },
  { iata: "AUA", name: "Aruba Queen Beatrix Intl", city: "Oranjestad", country: "Aruba", cc: "AW", region: "NA", lat: 12.5014, lng: -70.0152 },
  { iata: "CUR", name: "Curaçao Hato Intl", city: "Willemstad", country: "Curaçao", cc: "CW", region: "NA", lat: 12.1889, lng: -68.9598 },
  { iata: "BON", name: "Bonaire Flamingo Intl", city: "Kralendijk", country: "Bonaire", cc: "BQ", region: "NA", lat: 12.1310, lng: -68.2685 },
  { iata: "SXM", name: "Sint Maarten Princess Juliana Intl", city: "Philipsburg", country: "Sint Maarten", cc: "SX", region: "NA", lat: 18.0410, lng: -63.1089 },
  { iata: "BGI", name: "Barbados Grantley Adams Intl", city: "Bridgetown", country: "Barbados", cc: "BB", region: "NA", lat: 13.0746, lng: -59.4925 },
  { iata: "ANU", name: "Antigua V. C. Bird Intl", city: "St. John's", country: "Antigua and Barbuda", cc: "AG", region: "NA", lat: 17.1367, lng: -61.7926 },
  { iata: "SLU", name: "St. Lucia Hewanorra Intl", city: "Vieux Fort", country: "Saint Lucia", cc: "LC", region: "NA", lat: 13.7332, lng: -60.9526 },
  { iata: "GND", name: "Grenada Maurice Bishop Intl", city: "St. George's", country: "Grenada", cc: "GD", region: "NA", lat: 12.0042, lng: -61.7862 },
  { iata: "BGI", name: "Barbados Grantley Adams Intl", city: "Bridgetown", country: "Barbados", cc: "BB", region: "NA", lat: 13.0746, lng: -59.4925 },
  { iata: "PTP", name: "Pointe-à-Pitre Pôle Caraïbe", city: "Pointe-à-Pitre", country: "Guadeloupe", cc: "GP", region: "NA", lat: 16.2653, lng: -61.5313 },
  { iata: "FDF", name: "Fort-de-France Aimé Césaire", city: "Fort-de-France", country: "Martinique", cc: "MQ", region: "NA", lat: 14.5953, lng: -60.9933 },

  // --- North America expanded (more US cities + Canada + Mexico) ---
  { iata: "PHL", name: "Philadelphia Intl", city: "Philadelphia", country: "United States", cc: "US", region: "NA", lat: 39.8744, lng: -75.2424 },
  { iata: "DTW", name: "Detroit Metropolitan", city: "Detroit", country: "United States", cc: "US", region: "NA", lat: 42.2162, lng: -83.3554 },
  { iata: "MSP", name: "Minneapolis-Saint Paul Intl", city: "Minneapolis", country: "United States", cc: "US", region: "NA", lat: 44.8848, lng: -93.2223 },
  { iata: "CLT", name: "Charlotte Douglas Intl", city: "Charlotte", country: "United States", cc: "US", region: "NA", lat: 35.2140, lng: -80.9431 },
  { iata: "TPA", name: "Tampa Intl", city: "Tampa", country: "United States", cc: "US", region: "NA", lat: 27.9755, lng: -82.5332 },
  { iata: "MCO", name: "Orlando Intl", city: "Orlando", country: "United States", cc: "US", region: "NA", lat: 28.4312, lng: -81.3081 },
  { iata: "FLL", name: "Fort Lauderdale-Hollywood Intl", city: "Fort Lauderdale", country: "United States", cc: "US", region: "NA", lat: 26.0742, lng: -80.1506 },
  { iata: "AUS", name: "Austin-Bergstrom Intl", city: "Austin", country: "United States", cc: "US", region: "NA", lat: 30.1945, lng: -97.6699 },
  { iata: "SAT", name: "San Antonio Intl", city: "San Antonio", country: "United States", cc: "US", region: "NA", lat: 29.5337, lng: -98.4698 },
  { iata: "PDX", name: "Portland Intl", city: "Portland", country: "United States", cc: "US", region: "NA", lat: 45.5887, lng: -122.5975 },
  { iata: "SLC", name: "Salt Lake City Intl", city: "Salt Lake City", country: "United States", cc: "US", region: "NA", lat: 40.7884, lng: -111.9778 },
  { iata: "HNL", name: "Daniel K. Inouye Intl", city: "Honolulu", country: "United States", cc: "US", region: "NA", lat: 21.3187, lng: -157.9225 },
  { iata: "OGG", name: "Kahului", city: "Maui", country: "United States", cc: "US", region: "NA", lat: 20.8986, lng: -156.4305 },
  { iata: "ANC", name: "Ted Stevens Anchorage Intl", city: "Anchorage", country: "United States", cc: "US", region: "NA", lat: 61.1744, lng: -149.9961 },
  { iata: "YYC", name: "Calgary Intl", city: "Calgary", country: "Canada", cc: "CA", region: "NA", lat: 51.1215, lng: -114.0076 },
  { iata: "YEG", name: "Edmonton Intl", city: "Edmonton", country: "Canada", cc: "CA", region: "NA", lat: 53.3097, lng: -113.5801 },
  { iata: "YOW", name: "Ottawa Macdonald-Cartier Intl", city: "Ottawa", country: "Canada", cc: "CA", region: "NA", lat: 45.3225, lng: -75.6690 },
  { iata: "YHZ", name: "Halifax Stanfield Intl", city: "Halifax", country: "Canada", cc: "CA", region: "NA", lat: 44.8808, lng: -63.5086 },
  { iata: "YYJ", name: "Victoria Intl", city: "Victoria", country: "Canada", cc: "CA", region: "NA", lat: 48.6469, lng: -123.4259 },
  { iata: "GDL", name: "Guadalajara Miguel Hidalgo y Costilla", city: "Guadalajara", country: "Mexico", cc: "MX", region: "NA", lat: 20.5218, lng: -103.3111 },
  { iata: "MTY", name: "Monterrey Mariano Escobedo", city: "Monterrey", country: "Mexico", cc: "MX", region: "NA", lat: 25.7785, lng: -100.1067 },
  { iata: "PVR", name: "Puerto Vallarta Gustavo Díaz Ordaz", city: "Puerto Vallarta", country: "Mexico", cc: "MX", region: "NA", lat: 20.6801, lng: -105.2542 },
  { iata: "SJD", name: "Los Cabos Intl", city: "Los Cabos", country: "Mexico", cc: "MX", region: "NA", lat: 23.1518, lng: -109.7212 },

  // --- Oceania expanded ---
  { iata: "OOL", name: "Gold Coast", city: "Gold Coast", country: "Australia", cc: "AU", region: "OC", lat: -28.1644, lng: 153.5050 },
  { iata: "MCY", name: "Sunshine Coast", city: "Maroochydore", country: "Australia", cc: "AU", region: "OC", lat: -26.6033, lng: 153.0911 },
  { iata: "HBA", name: "Hobart", city: "Hobart", country: "Australia", cc: "AU", region: "OC", lat: -42.8358, lng: 147.5103 },
  { iata: "ZQN", name: "Queenstown", city: "Queenstown", country: "New Zealand", cc: "NZ", region: "OC", lat: -45.0211, lng: 168.7392 },
  { iata: "NPL", name: "Nadi Intl", city: "Nadi", country: "Fiji", cc: "FJ", region: "OC", lat: -17.7554, lng: 177.4434 },
  { iata: "SUV", name: "Nausori Intl", city: "Suva", country: "Fiji", cc: "FJ", region: "OC", lat: -18.0433, lng: 178.5594 },
  { iata: "APW", name: "Faleolo Intl", city: "Apia", country: "Samoa", cc: "WS", region: "OC", lat: -13.8300, lng: -172.0083 },
  { iata: "TBU", name: "Fua'amotu Intl", city: "Nuku'alofa", country: "Tonga", cc: "TO", region: "OC", lat: -21.2412, lng: -175.1496 },
  { iata: "VLI", name: "Bauerfield Intl", city: "Port Vila", country: "Vanuatu", cc: "VU", region: "OC", lat: -17.6993, lng: 168.3198 },
  { iata: "HIR", name: "Henderson (Solomon Islands)", city: "Honiara", country: "Solomon Islands", cc: "SB", region: "OC", lat: -9.4280, lng: 160.0549 },
  { iata: "POM", name: "Jacksons Intl", city: "Port Moresby", country: "Papua New Guinea", cc: "PG", region: "OC", lat: -9.4434, lng: 147.2200 },
  { iata: "NOU", name: "La Tontouta Intl", city: "Nouméa", country: "New Caledonia", cc: "NC", region: "OC", lat: -22.0146, lng: 166.2129 },
  { iata: "GIU", name: "Guam (Antonio B. Won Pat Intl)", city: "Guam", country: "Guam", cc: "GU", region: "OC", lat: 13.4834, lng: 144.7960 },
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
