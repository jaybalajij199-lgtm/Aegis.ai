import fs from 'fs';

let content = fs.readFileSync('temp_WeatherDashboard.tsx', 'utf-8');

// Replace imports
content = content.replace(
  "import { Card } from '../ui/Card';",
  "import { Card } from '../ui/Card';\nimport { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';\nimport L from 'leaflet';"
);

// Update state
content = content.replace(
  "const [selectedDistrictKey, setSelectedDistrictKey] = useState<string>('Cuttack');",
  `const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string}>({lat: 20.4625, lng: 85.8828, name: 'Cuttack'});`
);

// Update loadWeather
content = content.replace(
  "const loadWeather = async (district: string) => {",
  "const loadWeather = async (lat: number, lng: number, name: string) => {"
);
content = content.replace(
  "const data = await fetchLiveWeather(district);",
  "const data = await fetchLiveWeather(lat, lng, name);"
);
content = content.replace(
  "fetchAiAdvisory(district, data.telemetry.precipitationMm, data.telemetry.windSpeedKmH);",
  "fetchAiAdvisory(name, data.telemetry.precipitationMm, data.telemetry.windSpeedKmH);"
);

// Update useEffect
content = content.replace(
  "useEffect(() => {\n    loadWeather(selectedDistrictKey);\n  }, [selectedDistrictKey]);",
  "useEffect(() => {\n    loadWeather(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);\n  }, [selectedLocation]);"
);

// Handle Search
const searchFunc = `
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(\`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(searchQuery)}&count=1\`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name, country } = data.results[0];
        setSelectedLocation({ lat: latitude, lng: longitude, name: \`\${name}, \${country}\` });
      } else {
        alert('Location not found');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        // Optionally reverse geocode or just show coordinates
        setSelectedLocation({ lat, lng, name: \`Lat: \${lat.toFixed(4)}, Lng: \${lng.toFixed(4)}\` });
      }
    });
    return null;
  };

  const customIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: '<div style="background-color: #ef4444;" class="w-5 h-5 rounded-full border-2 border-white shadow-lg"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
`;

content = content.replace(
  "  if (loading || !weatherData) {",
  searchFunc + "\n  if (loading || !weatherData) {"
);

// Find the presets div block
const startIdx = content.indexOf('<div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-xs">');
const endStr = '</button>\n        ))}\n      </div>';
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

if (startIdx !== -1 && endIdx > startIdx) {
  const replacement = `{/* Location Search Navigation */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search city, region, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono text-xs"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <Button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black whitespace-nowrap">
          Search Location
        </Button>
      </div>
      <div className="h-64 rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={[selectedLocation.lat, selectedLocation.lng]} zoom={5} style={{ height: '100%', width: '100%', background: '#09090b' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapClickHandler />
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={customIcon}>
            <Popup>{selectedLocation.name}</Popup>
          </Marker>
        </MapContainer>
      </div>`;
      
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
} else {
  console.log("Could not find the presets block");
}

fs.writeFileSync('src/components/weather/WeatherDashboard.tsx', content);
