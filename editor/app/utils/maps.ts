export function googleMapsLinkForLatLon(lat: number, lon: number) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export function googleMapsDirectionsLinkLatLon(
  points: Array<{ lat: number; lon: number }>
) {
  const path = points.map((p) => `${p.lat},${p.lon}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}

