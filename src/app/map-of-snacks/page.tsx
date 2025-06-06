// app/map-of-snacks/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface Place {
  identifier: string
  name: string
  lng: number
  lat: number
}

export default function MapOfSnacksPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  // Fetch all places on mount
  useEffect(() => {
    async function fetchPlaces() {
      try {
        const res = await fetch('/api/place')
        const data = (await res.json()) as Place[]
        setPlaces(data)
      } catch (err) {
        console.error('Failed to fetch places:', err)
      }
    }
    fetchPlaces()
  }, [])

  return (
    <div className="w-full h-screen relative">
      <SearchBar onSelectPlace={(id) => setSelectedPlaceId(id)} places={places} />
      <MapContainer
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={(id) => setSelectedPlaceId(id)}
      />
      {/* PlaceDetailPanel and AddCheapieModal to be added later */}
    </div>
  )
}

/**
 * SearchBar component: floating input for searching places or snacks.
 * Currently placeholder only; full dropdown logic to be added later.
 */
function SearchBar({
  onSelectPlace,
  places,
}: {
  onSelectPlace: (id: string) => void
  places: Place[]
}) {
  // `isOpen` controls whether the dropdown is shown
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simple filtered suggestions: match places by name (case-insensitive)
  const filtered = Array.isArray(places)
    ? places
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 32) // limited to 32 for performance
    : []

  return (
    <div className="absolute top-4 right-4 w-1/4 z-20 sm:w-3/4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search place or snacks..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="mt-1 max-h-64 overflow-auto bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-lg"
        >
          {filtered.length === 0 ? (
            <div className="p-4 text-gray-500">No results</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.identifier}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelectPlace(p.identifier)
                  setIsOpen(false)
                  setQuery('')
                }}
              >
                {p.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/**
 * MapContainer component: renders Mapbox GL map with clustering markers.
 * Props:
 *  - places: list of Place to plot
 *  - selectedPlaceId: identifier of currently selected place
 *  - onSelectPlace: callback when user clicks a marker
 */
function MapContainer({
  places,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[]
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  // Initialize map only once
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    if (!places.length) return; // Force need something to start creating

    const MELBOURNE_CENTER: [number, number] = [144.9631, -37.8136];

    function createMap(center: [number, number]) {
      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom: 12,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl(), 'top-left');

      map.on('load', () => {
        // (1) Create 'places' source using the current `places` array:
        map.addSource('places', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: places.map((p) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: { id: p.identifier, name: p.name },
          })),
        },
        cluster: true,
        clusterRadius: 30,
        clusterMaxZoom: 12,
      });

        // (2) Clustered circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'places',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#51bbd6',
            'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
            'circle-opacity': 0.75,
          },
        });

        // (3) Cluster count labels
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'places',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        });

        // (4) Unclustered points
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'places',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#f28cb1',
            'circle-radius': [
              'case',
              ['==', ['get', 'id'], selectedPlaceId],
              12,
              8,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // (5) Place name labels
        map.addLayer({
          id: 'place-labels',
          type: 'symbol',
          source: 'places',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': [
              'case',
              ['==', ['get', 'id'], selectedPlaceId],
              14,
              12,
            ],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
          },
          paint: { 'text-color': '#202' },
        });

        // Cluster click → expand cluster  
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          if (!features.length) return;
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('places') as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return;
            map.easeTo({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              center: (features[0].geometry as any).coordinates,
              zoom,
            });
          });
        });

        // Unclustered point click → notify parent
        map.on('click', 'unclustered-point', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['unclustered-point'],
          });
          if (!features.length) return;
          const clickedId = features[0].properties?.id as string;
          onSelectPlace(clickedId);
        });

        // Change cursor on hover  
        ['clusters', 'unclustered-point'].forEach((layer) => {
          map.on('mouseenter', layer, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = '';
          });
        });
      });

      return map;
    }

    // Attempt geolocation first; fallback to Melbourne
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCenter: [number, number] = [
            pos.coords.longitude,
            pos.coords.latitude,
          ];
          createMap(userCenter);
        },
        (err) => {
          console.warn(
            'Geolocation failed or denied, using Melbourne center:',
            err
          );
          createMap(MELBOURNE_CENTER);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      createMap(MELBOURNE_CENTER);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Update the 'places' source data whenever `places` array changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('places') as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (!source) return;

    source.setData({
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: { id: p.identifier, name: p.name },
      })),
    });
  }, [places]);


  // Whenever selectedPlaceId changes, center map & update styles
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedPlaceId) return

    // Find the place coordinates
    const place = places.find((p) => p.identifier === selectedPlaceId)
    if (!place) return

    map.easeTo({
      center: [place.lng, place.lat],
      zoom: 15,
      duration: 1000,
    })

    // Update circle radius for selected vs non-selected
    map.setPaintProperty('unclustered-point', 'circle-radius', [
      'case',
      ['==', ['get', 'id'], selectedPlaceId],
      12,
      8,
    ])
    // Update label size
    map.setLayoutProperty('place-labels', 'text-size', [
      'case',
      ['==', ['get', 'id'], selectedPlaceId],
      14,
      12,
    ])
  }, [selectedPlaceId, places])

  if (!places.length) { return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Fetching latest data for you...</p>
      </div>
  )}

  return <div ref={mapContainer} className="w-full h-full" />
}
