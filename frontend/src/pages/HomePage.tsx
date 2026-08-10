import React from 'react';
import { PlusCircle, LogIn, MapPin, Users, Zap, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const HomePage: React.FC = () => {
  const { healthStatus } = useAppStore();

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 24px 64px',
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid var(--border-glow)',
          color: 'var(--accent-primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '28px',
        }}>
          <Zap size={15} /> Real-Time Group Riding & Tour Coordination
        </div>

        <h1 style={{
          fontSize: 'clamp(2.6rem, 5.5vw, 4rem)',
          lineHeight: 1.12,
          marginBottom: '20px',
          fontWeight: 800,
          color: 'var(--text-primary)',
        }}>
          Ride together. <br />
          <span style={{
            color: 'var(--accent-primary)',
          }}>
            Stay together.
          </span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 36px',
          fontWeight: 400,
        }}>
          Create a ride, invite your group, and see everyone live on the map.
        </p>

        {/* Floating Map Indicators (from design reference) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '36px',
        }}>
          <span className="badge badge-live" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
            <span className="dot" /> ● Live Map
          </span>
          <span className="badge" style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 16px',
            fontSize: '0.88rem',
          }}>
            👥 6 Riders Joined
          </span>
          <span className="badge" style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 16px',
            fontSize: '0.88rem',
          }}>
            📍 12.4 km to Destination
          </span>
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => alert('Ride creation form will be available in Iteration 1!')}
            className="btn btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.1rem' }}
          >
            <PlusCircle size={22} /> Create a Ride
          </button>

          <button
            onClick={() => alert('Join ride screen will be available in Iteration 2!')}
            className="btn btn-secondary"
            style={{ padding: '16px 36px', fontSize: '1.1rem' }}
          >
            <LogIn size={22} /> Join a Ride
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '16px',
      }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            marginBottom: '20px',
          }}>
            <MapPin size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Map-Centric Live View</h3>
          <p style={{ fontSize: '0.95rem' }}>
            High contrast location markers on MapLibre GL JS maps designed for visibility under outdoor sunlight.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            marginBottom: '20px',
          }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Zero Registration</h3>
          <p style={{ fontSize: '0.95rem' }}>
            No accounts or email forms needed. Join immediately with a display name via shared URL or Ride ID.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(217, 119, 6, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-amber)',
            marginBottom: '20px',
          }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>1-Tap Quick Alerts</h3>
          <p style={{ fontSize: '0.95rem' }}>
            Large touch targets for sending refueling, washroom, food break, or slowdown alerts while wearing gloves.
          </p>
        </div>
      </div>

      {/* Infrastructure Status Banner */}
      <div className="glass-panel" style={{
        marginTop: '48px',
        padding: '20px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '0.92rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Iteration 0 Status:</span>
          <span className="badge badge-live">Postgres & Redis Ready</span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Backend API: {healthStatus?.status === 'ok' ? 'Connected (5000)' : 'Connecting...'} | Frontend: Vite (5173)
        </div>
      </div>
    </div>
  );
};
