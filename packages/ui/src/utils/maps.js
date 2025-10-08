export function googleMapsLinkForLatLon(lat, lon) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
}
export function googleMapsDirectionsLinkLatLon(points) {
    const path = points.map((p) => `${p.lat},${p.lon}`).join("/");
    return `https://www.google.com/maps/dir/${path}`;
}
//# sourceMappingURL=maps.js.map