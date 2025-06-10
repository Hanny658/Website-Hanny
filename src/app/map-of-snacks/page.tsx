// app/map-of-snacks/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import SearchBar from 'src/components/SearchBar'
import PlaceDetailPanel from 'src/components/PlaceDetailPanel'
import AddCheapieModal from 'src/components/AddCheapieModal'
import RegLogModal from 'src/components/RegLog'

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
  const [isAddOpen, setIsAddOpen] = useState(false)

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
      {/*  Login Btn positioned top-left */}
      <div className='fixed left-4 md:left-12 top-20 z-50'>
        <RegLogModal />
      </div>
      {/* SearchBar positioned top-right */}
      <SearchBar onSelectPlace={(id) => setSelectedPlaceId(id)} />
      <MapContainer
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={(id) => setSelectedPlaceId(id)}
      />
      {/*  Conditionally render the detail panel */}
      {selectedPlaceId && (
        <PlaceDetailPanel
          placeName={places.find((p) => p.identifier === selectedPlaceId)?.name ?? ''}
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
          onAdd={() => setIsAddOpen(true)}
        />
      )}
      {isAddOpen && selectedPlaceId && (
      <AddCheapieModal
        placeId={selectedPlaceId}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => {
          setIsAddOpen(false)
          // force re-fetch in PlaceDetailPanel by toggling selection
          const pid = selectedPlaceId
          setSelectedPlaceId(null)
          setTimeout(() => setSelectedPlaceId(pid), 10)
        }}
      />
    )}
      {/* More going here */}
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
