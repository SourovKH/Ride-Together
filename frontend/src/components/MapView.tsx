import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocationInput, Participant, RiderLocationData } from '../services/api';
import { getHaversineDistanceKm, formatDistance } from '../utils/distance';

interface MapViewProps {
  startLocation: LocationInput;
  destinationLocation: LocationInput;
  participants: Participant[];
  participantLocations: Record<string, RiderLocationData>;
  currentParticipantId?: string;
  routeGeometry?: [number, number][];
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** Fetch an OSRM driving route between two points. Returns [lng, lat][] or null on error. */
async function fetchOsrmRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;

    return data.routes[0].geometry.coordinates as [number, number][];
  } catch {
    return null;
  }
}

export const MapView: React.FC<MapViewProps> = ({
  startLocation,
  destinationLocation,
  participants,
  participantLocations,
  currentParticipantId,
  routeGeometry,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const riderMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const startMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Cache the rider-to-source route geometry so we don't re-fetch on every render
  const riderRouteRef = useRef<[number, number][] | null>(null);
  const riderRouteFetchKeyRef = useRef<string>('');
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLng = Number(startLocation.longitude) || 0;
  const startLat = Number(startLocation.latitude) || 0;
  const destLng = Number(destinationLocation.longitude) || 0;
  const destLat = Number(destinationLocation.latitude) || 0;

  // ─── Initialize MapLibre Map ───
  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log('🗺️ Initializing MapLibre GL map:', [startLng, startLat]);

    const instance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-tiles',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [startLng, startLat],
      zoom: 12,
    });

    instance.addControl(new maplibregl.NavigationControl(), 'top-right');

    instance.on('load', () => {
      console.log('🗺️ MapLibre GL map fully loaded!');

      // Add GeoJSON sources for route lines
      instance.addSource('main-route-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      instance.addSource('rider-to-source-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Main route: Source → Destination (bold neon blue)
      instance.addLayer({
        id: 'main-route-layer',
        type: 'line',
        source: 'main-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 6,
          'line-opacity': 0.95,
        },
      });

      // Rider → Source route (dashed emerald green)
      instance.addLayer({
        id: 'rider-to-source-layer',
        type: 'line',
        source: 'rider-to-source-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10b981',
          'line-width': 4,
          'line-dasharray': [2, 2],
          'line-opacity': 0.9,
        },
      });



      setMap(instance);
    });

    return () => {
      instance.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render Start & Destination Markers ───
  useEffect(() => {
    if (!map) return;

    if (!startMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-map-marker start-marker';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="background-color: #10b981; border: 2px solid #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(16,185,129,0.8); color: white; font-weight: bold; font-size: 16px;">
          🚀
        </div>
      `;
      startMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([startLng, startLat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #0f172a; padding: 4px;">
              <strong style="color: #059669;">🚀 Start Location</strong><br/>
              ${startLocation.name}
            </div>
          `)
        )
        .addTo(map);
    } else {
      startMarkerRef.current.setLngLat([startLng, startLat]);
    }

    if (!destMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'custom-map-marker dest-marker';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="background-color: #f59e0b; border: 2px solid #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(245,158,11,0.8); color: white; font-weight: bold; font-size: 16px;">
          🏁
        </div>
      `;
      destMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([destLng, destLat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="color: #0f172a; padding: 4px;">
              <strong style="color: #d97706;">🏁 Destination</strong><br/>
              ${destinationLocation.name}
            </div>
          `)
        )
        .addTo(map);
    } else {
      destMarkerRef.current.setLngLat([destLng, destLat]);
    }
  }, [map, startLng, startLat, destLng, destLat, startLocation.name, destinationLocation.name]);

  // ─── Update Rider Markers ───
  useEffect(() => {
    if (!map) return;

    const currentRiderIds = new Set(participants.map((p) => p.id));
    const activeMarkers = riderMarkersRef.current;

    // Remove markers for participants who left
    Object.keys(activeMarkers).forEach((id) => {
      if (!currentRiderIds.has(id)) {
        activeMarkers[id].remove();
        delete activeMarkers[id];
      }
    });

    const selfLoc = currentParticipantId ? participantLocations[currentParticipantId] : null;

    participants.forEach((participant) => {
      const liveLoc = participantLocations[participant.id];
      const lng = liveLoc ? Number(liveLoc.longitude) : startLng;
      const lat = liveLoc ? Number(liveLoc.latitude) : startLat;

      if (isNaN(lng) || isNaN(lat)) return;

      const isSelf = participant.id === currentParticipantId;
      const isOrg = participant.role === 'ORGANIZER';
      const hasLiveGps = !!liveLoc;
      const isStale = liveLoc ? Date.now() - liveLoc.timestamp > 35000 : true;

      let distanceText = 'N/A';
      if (!isSelf && selfLoc) {
        const dist = getHaversineDistanceKm(
          Number(selfLoc.latitude),
          Number(selfLoc.longitude),
          lat,
          lng
        );
        distanceText = `${formatDistance(dist)} away`;
      } else if (isSelf) {
        distanceText = 'You';
      }

      const statusColor = !hasLiveGps ? '#94a3b8' : isStale ? '#64748b' : isOrg ? '#f59e0b' : '#0284c7';
      const initial = participant.name.charAt(0).toUpperCase();
      const heading = liveLoc?.heading ?? null;
      const hasHeading = heading !== null && heading !== undefined;

      const popupHtml = `
        <div style="color: #0f172a; padding: 6px; min-width: 150px;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px;">
            ${participant.name} ${isSelf ? '(You)' : ''}
          </div>
          <div style="font-size: 0.78rem; color: #475569; margin-bottom: 6px;">
            ${isOrg ? '👑 Organizer' : '🏍️ Rider'} • ${distanceText}
          </div>
          <div style="font-size: 0.8rem; background: #f1f5f9; padding: 6px; border-radius: 6px;">
            ${
              hasLiveGps
                ? `Speed: <strong>${liveLoc.speed ?? 0} km/h</strong><br/>
                   Accuracy: <strong>±${liveLoc.accuracy}m</strong><br/>
                   ${hasHeading ? `Heading: <strong>${Math.round(heading)}°</strong><br/>` : ''}
                   <span style="font-size: 0.72rem; color: #64748b;">Updated ${getTimeAgo(liveLoc.timestamp)}</span>`
                : `<span style="color: #64748b; font-style: italic;">At Start Location (GPS Pending)</span>`
            }
          </div>
        </div>
      `;

      // Build the heading arrow HTML — only shown when heading data is available
      const arrowHtml = hasHeading
        ? `<div style="
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%) rotate(${heading}deg);
            transform-origin: center 30px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 14px solid ${statusColor};
            filter: drop-shadow(0 0 4px ${isSelf ? 'rgba(56,189,248,0.8)' : 'rgba(0,0,0,0.5)'});
            z-index: 1;
          "></div>`
        : '';

      if (!activeMarkers[participant.id]) {
        const el = document.createElement('div');
        el.className = 'custom-map-marker rider-marker';
        el.style.width = '48px';
        el.style.height = '48px';
        el.style.cursor = 'pointer';
        el.style.position = 'relative';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.innerHTML = `
          ${arrowHtml}
          <div style="
            background-color: ${statusColor};
            border: 2.5px solid ${isSelf ? '#38bdf8' : '#ffffff'};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px ${isSelf ? 'rgba(56,189,248,0.9)' : 'rgba(0,0,0,0.6)'};
            color: white;
            font-weight: 800;
            font-size: 14px;
            position: relative;
          ">
            ${initial}
            ${isOrg ? '<span style="position:absolute; top:-7px; right:-4px; font-size:11px;">👑</span>' : ''}
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml))
          .addTo(map);

        activeMarkers[participant.id] = marker;
      } else {
        const marker = activeMarkers[participant.id];
        marker.setLngLat([lng, lat]);

        // Update the marker element's inner HTML to reflect new heading & color
        const el = marker.getElement();
        el.innerHTML = `
          ${arrowHtml}
          <div style="
            background-color: ${statusColor};
            border: 2.5px solid ${isSelf ? '#38bdf8' : '#ffffff'};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px ${isSelf ? 'rgba(56,189,248,0.9)' : 'rgba(0,0,0,0.6)'};
            color: white;
            font-weight: 800;
            font-size: 14px;
            position: relative;
          ">
            ${initial}
            ${isOrg ? '<span style="position:absolute; top:-7px; right:-4px; font-size:11px;">👑</span>' : ''}
          </div>
        `;

        const popup = marker.getPopup();
        if (popup) {
          popup.setHTML(popupHtml);
        }
      }
    });
  }, [map, participants, participantLocations, currentParticipantId, startLng, startLat]);

  // ─── Update Source → Destination Route ───
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    try {
      const mainSrc = map.getSource('main-route-source') as maplibregl.GeoJSONSource | undefined;
      if (!mainSrc) return;

      const effectiveRoute =
        routeGeometry && routeGeometry.length > 0
          ? routeGeometry
          : [
              [startLng, startLat],
              [destLng, destLat],
            ];

      console.log(`🗺️ Updating main route (source → dest): ${effectiveRoute.length} points`);

      mainSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: effectiveRoute,
        },
      });
    } catch (err) {
      console.warn('Error updating main route:', err);
    }
  }, [map, routeGeometry, startLng, startLat, destLng, destLat]);

  // ─── Fetch & Render Rider → Source OSRM Routes (debounced) ───
  const updateRiderToSourceRoute = useCallback(async () => {
    if (!map || !map.isStyleLoaded()) return;

    const r2sSrc = map.getSource('rider-to-source-source') as maplibregl.GeoJSONSource | undefined;
    if (!r2sSrc) return;

    // Get current rider's live location
    const selfLoc = currentParticipantId ? participantLocations[currentParticipantId] : null;
    if (!selfLoc) {
      // No live location — clear the rider-to-source route
      r2sSrc.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const riderLat = Number(selfLoc.latitude);
    const riderLng = Number(selfLoc.longitude);
    if (isNaN(riderLat) || isNaN(riderLng)) return;

    // Construct a key to avoid re-fetching the same route
    const fetchKey = `${riderLat.toFixed(4)},${riderLng.toFixed(4)}->${startLat.toFixed(4)},${startLng.toFixed(4)}`;

    if (fetchKey === riderRouteFetchKeyRef.current && riderRouteRef.current) {
      // Same position (within ~11m precision), reuse cached route
      r2sSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: riderRouteRef.current,
        },
      } as any);
      return;
    }

    console.log(`🛤️ Fetching OSRM route: Rider (${riderLat.toFixed(4)}, ${riderLng.toFixed(4)}) → Source (${startLat.toFixed(4)}, ${startLng.toFixed(4)})`);

    const osrmCoords = await fetchOsrmRoute(riderLat, riderLng, startLat, startLng);

    if (osrmCoords && osrmCoords.length > 0) {
      riderRouteRef.current = osrmCoords;
      riderRouteFetchKeyRef.current = fetchKey;

      r2sSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: osrmCoords,
        },
      } as any);

      console.log(`🛤️ Rider→Source OSRM route rendered: ${osrmCoords.length} points`);
    } else {
      // Fallback: draw a straight line
      r2sSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [riderLng, riderLat],
            [startLng, startLat],
          ],
        },
      } as any);
      console.log('🛤️ OSRM failed, drew straight-line fallback for rider→source');
    }
  }, [map, participantLocations, currentParticipantId, startLat, startLng]);

  useEffect(() => {
    // Debounce to avoid flooding OSRM on every location tick
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    fetchTimerRef.current = setTimeout(() => {
      updateRiderToSourceRoute();
    }, 2000); // Wait 2s after last location change

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [updateRiderToSourceRoute]);



  // ─── Recenter Map ───
  const handleRecenter = () => {
    if (!map) return;

    const selfLoc = currentParticipantId ? participantLocations[currentParticipantId] : null;
    if (selfLoc) {
      map.flyTo({
        center: [Number(selfLoc.longitude), Number(selfLoc.latitude)],
        zoom: 15,
        duration: 800,
      });
    } else {
      // Fallback to start location if no live GPS yet
      map.flyTo({
        center: [startLng, startLat],
        zoom: 14,
        duration: 800,
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glow)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Route Legend */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          color: '#e2e8f0',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '0.72rem',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '3px', backgroundColor: '#38bdf8', borderRadius: '2px' }} />
          <span>Source → Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '3px', backgroundColor: '#10b981', borderRadius: '2px', borderTop: '2px dashed #10b981', background: 'transparent' }} />
          <span>You → Source</span>
        </div>

      </div>

      {/* Map Control Recenter Button */}
      <button
        onClick={handleRecenter}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          color: 'var(--accent-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        🎯 Recenter Map
      </button>
    </div>
  );
};
