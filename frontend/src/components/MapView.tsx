import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocationInput, Participant, RiderLocationData } from '../services/api';

interface MapViewProps {
  startLocation: LocationInput;
  destinationLocation: LocationInput;
  participants: Participant[];
  participantLocations: Record<string, RiderLocationData>;
  currentParticipantId?: string;
}

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export const MapView: React.FC<MapViewProps> = ({
  startLocation,
  destinationLocation,
  participants,
  participantLocations,
  currentParticipantId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  const riderMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const startMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);

  const startLng = Number(startLocation.longitude) || 0;
  const startLat = Number(startLocation.latitude) || 0;
  const destLng = Number(destinationLocation.longitude) || 0;
  const destLat = Number(destinationLocation.latitude) || 0;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log('🗺️ Initializing MapLibre GL map at start coords:', [startLng, startLat]);

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
      zoom: 13,
    });

    instance.addControl(new maplibregl.NavigationControl(), 'top-right');

    instance.on('load', () => {
      console.log('🗺️ MapLibre GL map fully loaded!');
      setMap(instance);
    });

    // Fallback setMap if load fires fast
    setMap(instance);

    return () => {
      instance.remove();
      setMap(null);
    };
  }, []);

  // Render Start & Destination Markers
  useEffect(() => {
    if (!map) return;

    console.log('📍 Adding/Updating Start & Destination Markers:', { startLng, startLat, destLng, destLat });

    // Start Marker Element
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

    // Destination Marker Element
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

  // Update Rider Markers in real-time
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

    // Find current user's location data if available
    const selfLoc = currentParticipantId ? participantLocations[currentParticipantId] : null;

    // Render marker for EVERY participant (using live GPS or start location fallback)
    participants.forEach((participant) => {
      const liveLoc = participantLocations[participant.id];
      const lng = liveLoc ? Number(liveLoc.longitude) : startLng;
      const lat = liveLoc ? Number(liveLoc.latitude) : startLat;

      if (isNaN(lng) || isNaN(lat)) return;

      const isSelf = participant.id === currentParticipantId;
      const isOrg = participant.role === 'ORGANIZER';
      const hasLiveGps = !!liveLoc;
      const isStale = liveLoc ? Date.now() - liveLoc.timestamp > 35000 : true;

      // Distance away calculation
      let distanceText = 'N/A';
      if (!isSelf && selfLoc) {
        const dist = getHaversineDistanceKm(
          Number(selfLoc.latitude),
          Number(selfLoc.longitude),
          lat,
          lng
        );
        distanceText = `${dist} km away`;
      } else if (isSelf) {
        distanceText = 'You';
      }

      const statusColor = !hasLiveGps ? '#94a3b8' : isStale ? '#64748b' : isOrg ? '#f59e0b' : '#0284c7';
      const initial = participant.name.charAt(0).toUpperCase();

      // Popup HTML
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
                   <span style="font-size: 0.72rem; color: #64748b;">Updated ${getTimeAgo(liveLoc.timestamp)}</span>`
                : `<span style="color: #64748b; font-style: italic;">At Start Location (GPS Pending)</span>`
            }
          </div>
        </div>
      `;

      if (!activeMarkers[participant.id]) {
        console.log(`👤 Creating map marker for ${participant.name} (${participant.id}) at [${lng}, ${lat}]`);
        const el = document.createElement('div');
        el.className = 'custom-map-marker rider-marker';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.cursor = 'pointer';
        el.innerHTML = `
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

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml))
          .addTo(map);

        activeMarkers[participant.id] = marker;
      } else {
        // Update marker position & popup
        const marker = activeMarkers[participant.id];
        marker.setLngLat([lng, lat]);
        const popup = marker.getPopup();
        if (popup) {
          popup.setHTML(popupHtml);
        }
      }
    });
  }, [map, participants, participantLocations, currentParticipantId, startLng, startLat]);

  const handleRecenter = () => {
    if (!map) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([startLng, startLat]);
    bounds.extend([destLng, destLat]);

    Object.values(participantLocations).forEach((loc) => {
      bounds.extend([Number(loc.longitude), Number(loc.latitude)]);
    });

    map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glow)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

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
