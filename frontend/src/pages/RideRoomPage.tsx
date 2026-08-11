import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  Share2,
  MapPin,
  Navigation,
  Crown,
  UserCheck,
  RefreshCw,
  LogOut,
  Sparkles,
  Wifi,
  WifiOff,
  Play,
  Square,
  Radio,
  Compass,
  Crosshair,
  Gauge,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useRideStore } from '../store/useRideStore';
import { useRideSocket } from '../hooks/useRideSocket';
import { useGeolocation } from '../hooks/useGeolocation';

export const RideRoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentRide, fetchRide, session, leaveRide, startRide, endRide, isLoading, participantLocations } = useRideStore();

  // Geolocation tracking active ONLY when ride.status === 'ACTIVE'
  const isRideActive = currentRide?.status === 'ACTIVE';
  const { location, error: geoError, isTracking, requestPermission } = useGeolocation(isRideActive);

  const { isConnected } = useRideSocket(code, session?.participantId, location);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getHeadingDirection = (heading: number | null): string => {
    if (heading === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return `${heading}° (${directions[index]})`;
  };

  useEffect(() => {
    if (code) {
      fetchRide(code);
    }
  }, [code, fetchRide]);

  const handleCopyCode = () => {
    if (!currentRide) return;
    navigator.clipboard.writeText(currentRide.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentRide) return;
    const link = `${window.location.origin}/join/${currentRide.code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeave = async () => {
    if (!currentRide || !session) return;
    if (window.confirm('Are you sure you want to leave this ride room?')) {
      await leaveRide(currentRide.code, session.participantId);
      navigate('/');
    }
  };

  const handleStartRide = async () => {
    if (!currentRide || !session) return;
    if (window.confirm('Start the live ride now? All connected riders will be notified!')) {
      await startRide(currentRide.code, session.participantId);
    }
  };

  const handleEndRide = async () => {
    if (!currentRide || !session) return;
    if (window.confirm('End this ride? This will mark the ride as COMPLETED for all participants.')) {
      await endRide(currentRide.code, session.participantId);
    }
  };

  if (isLoading && !currentRide) {
    return (
      <div style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Ride Room...
      </div>
    );
  }

  if (!currentRide) {
    return (
      <div style={{ maxWidth: '600px', margin: '64px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Ride Room Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          We could not locate a ride with code <strong>{code}</strong>.
        </p>
        <Link to="/join" className="btn btn-primary">
          Join another ride
        </Link>
      </div>
    );
  }

  const isUserOrganizer = session?.role === 'ORGANIZER' && session?.rideCode === currentRide.code;
  const isUserParticipant = session?.rideCode === currentRide.code;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 20px 64px', width: '100%' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid var(--border-glow)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-live" style={{ padding: '6px 14px' }}>
              <span className="dot" /> Status: {currentRide.status}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: isConnected ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: isConnected ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: isConnected ? 'var(--accent-emerald)' : '#f87171',
                padding: '6px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? 'Real-Time Sync Active' : 'Connecting Sync...'}
            </span>
            {isUserOrganizer && (
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  color: 'var(--accent-amber)',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Crown size={14} /> You are the Organizer
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isUserOrganizer && currentRide.status === 'WAITING' && (
              <button
                onClick={handleStartRide}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--accent-emerald)',
                  borderColor: 'var(--accent-emerald)',
                }}
              >
                <Play size={16} /> Start Ride
              </button>
            )}

            {isUserOrganizer && currentRide.status === 'ACTIVE' && (
              <button
                onClick={handleEndRide}
                className="btn btn-secondary"
                style={{
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                  color: '#f87171',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <Square size={16} /> End Ride
              </button>
            )}

            <button
              onClick={() => code && fetchRide(code)}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
            >
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {currentRide.name}
        </h1>

        {/* Start & Destination */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--accent-emerald)" />
            <span>Start: <strong style={{ color: 'var(--text-primary)' }}>{currentRide.start.name}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="var(--accent-amber)" />
            <span>Destination: <strong style={{ color: 'var(--text-primary)' }}>{currentRide.destination.name}</strong></span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Left Column: Share & Ride Code Card */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={18} color="var(--accent-primary)" /> Ride Share Code
            </h3>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Unique Ride ID
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.15em' }}>
                {currentRide.code}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleCopyCode}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {copiedCode ? <Check size={18} color="var(--accent-emerald)" /> : <Copy size={18} />}
                {copiedCode ? 'Code Copied!' : 'Copy 6-Digit Code'}
              </button>

              <button
                onClick={handleCopyLink}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {copiedLink ? <Check size={18} /> : <Share2 size={18} />}
                {copiedLink ? 'Share Link Copied!' : 'Copy Shareable Join Link'}
              </button>
            </div>
          </div>

          {/* User Session status */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {isUserParticipant ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
                  <UserCheck size={18} />
                  <span>Logged in as <strong>{session?.participantName}</strong></span>
                </div>
              ) : (
                <div>You are viewing this ride as a guest.</div>
              )}
            </div>

            {isUserParticipant ? (
              <button
                onClick={handleLeave}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', padding: '10px' }}
              >
                <LogOut size={16} /> Leave Ride Room
              </button>
            ) : (
              <Link
                to={`/join/${currentRide.code}`}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              >
                Join This Ride Now
              </Link>
            )}
          </div>

          {/* Live GPS Tracker Card (Active when ride.status === 'ACTIVE') */}
          <div className="glass-panel" style={{ padding: '20px', marginTop: '24px', border: isRideActive ? '1px solid rgba(22, 163, 74, 0.4)' : '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Crosshair size={18} color={isRideActive ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                Live GPS Location
              </h3>
              <span
                className="badge"
                style={{
                  backgroundColor: isTracking ? 'rgba(22, 163, 74, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: isTracking ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  border: isTracking ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                }}
              >
                {isTracking ? '📡 GPS Active' : 'GPS Inactive'}
              </span>
            </div>

            {!isRideActive ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
                GPS tracking automatically activates when the organizer starts the ride.
              </div>
            ) : geoError ? (
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
                  <AlertTriangle size={16} /> GPS Error: Permission Required
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{geoError.message}</p>
                <button
                  onClick={requestPermission}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px' }}
                >
                  Retry Location Access (Standard Accuracy)
                </button>
              </div>
            ) : location ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--accent-primary)" /> Latitude
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {location.latitude.toFixed(6)}°
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--accent-primary)" /> Longitude
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {location.longitude.toFixed(6)}°
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Crosshair size={11} /> Accuracy
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '2px' }}>
                      ±{location.accuracy}m
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Gauge size={11} /> Speed
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '2px' }}>
                      {location.speed} km/h
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Compass size={11} /> Heading
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
                      {getHeadingDirection(location.heading)}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <Clock size={12} /> Updated {new Date(location.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                Acquiring GPS fix...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Participant Waiting List */}
        <div>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="var(--accent-primary)" />
                Joined Participants
              </h3>
              <span className="badge" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {(currentRide.participants || []).length} Total
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(currentRide.participants || []).map((p) => {
                const isSelf = session?.participantId === p.id;
                const isOrg = p.role === 'ORGANIZER';
                const pLoc = participantLocations[p.id];
                const isLocFresh = pLoc && Date.now() - pLoc.timestamp < 35000;

                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      backgroundColor: isSelf ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                      border: isSelf ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isOrg ? 'rgba(217, 119, 6, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isOrg ? 'var(--accent-amber)' : 'var(--accent-primary)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                          }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.name}
                            {isSelf && (
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {isOrg && (
                        <span className="badge" style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent-amber)', fontSize: '0.8rem', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                          <Crown size={12} style={{ display: 'inline', marginRight: '4px' }} /> Organizer
                        </span>
                      )}
                    </div>

                    {/* Live Rider Location Chip */}
                    {isRideActive && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: isLocFresh ? 'rgba(22, 163, 74, 0.08)' : 'rgba(148, 163, 184, 0.06)',
                          border: isLocFresh ? '1px solid rgba(22, 163, 74, 0.2)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isLocFresh ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Crosshair size={12} color={isLocFresh ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                          {isLocFresh ? (
                            <span>
                              <strong>{pLoc.speed} km/h</strong> • {pLoc.latitude.toFixed(4)}°, {pLoc.longitude.toFixed(4)} (±{pLoc.accuracy}m)
                            </span>
                          ) : (
                            <span>GPS Inactive / Signal Pending</span>
                          )}
                        </div>
                        {isLocFresh && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(pLoc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dynamic Status Notice Banner */}
            {currentRide.status === 'WAITING' && (
              <div style={{ marginTop: '24px', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.2)', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <Sparkles size={16} color="var(--accent-amber)" style={{ display: 'inline', marginRight: '6px' }} />
                {isUserOrganizer
                  ? 'Click "Start Ride" above when your group is ready to ride!'
                  : 'Waiting for the organizer to start the live ride...'}
              </div>
            )}

            {currentRide.status === 'ACTIVE' && (
              <div style={{ marginTop: '24px', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)', textAlign: 'center', fontSize: '0.88rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                <Radio size={16} style={{ display: 'inline', marginRight: '6px' }} />
                🟢 RIDE IS ACTIVE & LIVE — Group live tracking active!
              </div>
            )}

            {currentRide.status === 'COMPLETED' && (
              <div style={{ marginTop: '24px', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                🏁 RIDE COMPLETED — Thank you for riding together!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
