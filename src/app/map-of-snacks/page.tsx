"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Make sure to set your Mapbox token in .env.local as NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export default function SnackMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [144.9675495, -37.8122359], // [lng, lat]
      zoom: 15,
    });

    // add a single pin/marker
    new mapboxgl.Marker()
      .setLngLat([144.9675495, -37.8122359])
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-screen h-screen"
    />
  );
}
