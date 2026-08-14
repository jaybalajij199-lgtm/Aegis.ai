import fs from 'fs';
let content = fs.readFileSync('src/components/weather/WeatherDashboard.tsx', 'utf-8');

content = content.replace(
  "const MapClickHandler = () => {",
  `const MapRecenter = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMapEvents({});
    map.setView([lat, lng], map.getZoom());
    return null;
  };

  const MapClickHandler = () => {`
);

content = content.replace(
  "<MapClickHandler />",
  "<MapRecenter lat={selectedLocation.lat} lng={selectedLocation.lng} />\n          <MapClickHandler />"
);

fs.writeFileSync('src/components/weather/WeatherDashboard.tsx', content);
