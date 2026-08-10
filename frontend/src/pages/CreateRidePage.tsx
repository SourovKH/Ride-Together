import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Navigation, User, ArrowLeft, PlusCircle, Compass } from 'lucide-react';
import { useRideStore } from '../store/useRideStore';

const PRESETS = [
  {
    title: 'Kolkata → Digha',
    name: 'Weekend Beach Tour',
    start: { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
    destination: { name: 'Digha Beach', latitude: 21.6278, longitude: 87.5074 },
  },
  {
    title: 'Mumbai → Lonavala',
    name: 'Monsoon Ghat Ride',
    start: { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
    destination: { name: 'Lonavala', latitude: 18.7557, longitude: 73.4091 },
  },
  {
    title: 'Bengaluru → Nandi Hills',
    name: 'Sunrise Hill Climb',
    start: { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
    destination: { name: 'Nandi Hills', latitude: 13.3702, longitude: 77.6835 },
  },
];

export const CreateRidePage: React.FC = () => {
  const navigate = useNavigate();
  const { createRide, isLoading, error, clearError } = useRideStore();

  const [name, setName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [startName, setStartName] = useState('');
  const [startLat, setStartLat] = useState('22.5726');
  const [startLng, setStartLng] = useState('88.3639');

  const [destName, setDestName] = useState('');
  const [destLat, setDestLat] = useState('21.6278');
  const [destLng, setDestLng] = useState('87.5074');

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setStartName(preset.start.name);
    setStartLat(preset.start.latitude.toString());
    setStartLng(preset.start.longitude.toString());
    setDestName(preset.destination.name);
    setDestLat(preset.destination.latitude.toString());
    setDestLng(preset.destination.longitude.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!name.trim() || !startName.trim() || !destName.trim()) {
      return;
    }

    try {
      const code = await createRide({
        name: name.trim(),
        organizerName: organizerName.trim() || 'Organizer',
        start: {
          name: startName.trim(),
          latitude: parseFloat(startLat) || 0,
          longitude: parseFloat(startLng) || 0,
        },
        destination: {
          name: destName.trim(),
          latitude: parseFloat(destLat) || 0,
          longitude: parseFloat(destLng) || 0,
        },
      });

      navigate(`/ride/${code}`);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '36px 20px 64px', width: '100%' }}>
      {/* Top Back Link */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          marginBottom: '24px',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PlusCircle size={32} color="var(--accent-primary)" />
          Create a New Ride
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Set up your ride details and generate a shareable Ride ID for your group.
        </p>
      </div>

      {/* Preset Suggestions */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Presets
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="badge"
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Compass size={14} color="var(--accent-primary)" /> {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.95rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
        {/* Ride Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Ride Title <span style={{ color: 'var(--accent-primary)' }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Weekend Coastal Tour"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Organizer Name */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Your Display Name (Organizer)
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="e.g. Rahul (Lead Rider)"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 42px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Start Location */}
        <div style={{ marginBottom: '28px', padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            <MapPin size={20} /> Start Location
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Location Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kolkata Airport Roundabout"
              value={startName}
              onChange={(e) => setStartName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={startLng}
                onChange={(e) => setStartLng(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Destination Location */}
        <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 600, color: 'var(--accent-amber)' }}>
            <Navigation size={20} /> Destination Location
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Destination Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Digha Sea Beach"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={destLng}
                onChange={(e) => setDestLng(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            justifyContent: 'center',
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Creating Ride Room...' : '🚀 Create Ride Room'}
        </button>
      </form>
    </div>
  );
};
