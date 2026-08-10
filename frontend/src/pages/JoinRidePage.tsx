import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LogIn, User, KeyRound, MapPin, Navigation, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRideStore } from '../store/useRideStore';
import { RideDetails } from '../services/api';

export const JoinRidePage: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { fetchRide, joinRide, isLoading, error, clearError } = useRideStore();

  const [code, setCode] = useState(routeCode ? routeCode.toUpperCase() : '');
  const [name, setName] = useState('');
  const [previewRide, setPreviewRide] = useState<RideDetails | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync route param code to input field if present
  useEffect(() => {
    if (routeCode) {
      setCode(routeCode.toUpperCase());
    }
  }, [routeCode]);

  // Fetch preview when code reaches 6 chars
  useEffect(() => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length === 6) {
      setIsFetchingPreview(true);
      setPreviewError(null);

      fetchRide(cleanCode)
        .then((ride) => {
          setIsFetchingPreview(false);
          if (ride) {
            setPreviewRide(ride);
            // Auto focus name input if ride was found
            setTimeout(() => {
              nameInputRef.current?.focus();
            }, 100);
          } else {
            setPreviewRide(null);
            setPreviewError('No active ride found with this ID');
          }
        })
        .catch(() => {
          setIsFetchingPreview(false);
          setPreviewRide(null);
          setPreviewError('Failed to load ride details');
        });
    } else {
      setPreviewRide(null);
      setPreviewError(null);
    }
  }, [code, fetchRide]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6 || !name.trim()) return;

    try {
      const joinedCode = await joinRide(cleanCode, { name: name.trim() });
      navigate(`/ride/${joinedCode}`);
    } catch {
      // Error is set in store
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '36px 20px 64px', width: '100%' }}>
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
          <LogIn size={32} color="var(--accent-primary)" />
          Join a Ride
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Enter the 6-character Ride ID or open a share link to join your group.
        </p>
      </div>

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
        {/* Ride ID Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Ride Code (6 Characters) <span style={{ color: 'var(--accent-primary)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <KeyRound
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 7K9P2X"
              value={code}
              onChange={handleCodeChange}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '1.3rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Live Ride Preview Section */}
        {isFetchingPreview && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Checking Ride Code...
          </div>
        )}

        {previewError && (
          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem', marginBottom: '20px' }}>
            {previewError}
          </div>
        )}

        {previewRide && (
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 132, 199, 0.06)',
              border: '1px solid var(--border-glow)',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="badge badge-live" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Ride Found
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Status: <strong style={{ color: 'var(--accent-emerald)' }}>{previewRide.status}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
              {previewRide.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--accent-emerald)" />
                <span>Start: <strong style={{ color: 'var(--text-primary)' }}>{previewRide.start.name}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={16} color="var(--accent-amber)" />
                <span>Destination: <strong style={{ color: 'var(--text-primary)' }}>{previewRide.destination.name}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Users size={16} color="var(--accent-primary)" />
                <span>Participants: <strong style={{ color: 'var(--text-primary)' }}>{previewRide.participants.length} Joined</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Display Name Input */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Your Display Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              ref={nameInputRef}
              type="text"
              required
              placeholder="e.g. Sourov (Rider)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 46px',
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

        <button
          type="submit"
          disabled={isLoading || code.trim().length !== 6 || !name.trim()}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            justifyContent: 'center',
            opacity: isLoading || code.trim().length !== 6 || !name.trim() ? 0.6 : 1,
            cursor: isLoading || code.trim().length !== 6 || !name.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Joining Ride...' : '🏍️ Join Ride Room'}
        </button>
      </form>
    </div>
  );
};
