import React, { useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Header: React.FC = () => {
  const { healthStatus, isCheckingHealth, healthError, fetchHealth } = useAppStore();

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const isOk = healthStatus?.status === 'ok';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '14px 24px',
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}>
            <Navigation size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Ride<span style={{ color: 'var(--accent-primary)' }}>Together</span>
            </span>
          </div>
        </div>

        {/* Server System Health Status */}
        <div>
          {isCheckingHealth && !healthStatus ? (
            <span className="badge badge-warning">Connecting...</span>
          ) : isOk ? (
            <span className="badge badge-live" title="Backend, PostgreSQL & Redis operational">
              <span className="dot" /> System Online
            </span>
          ) : (
            <span className="badge badge-error" title={healthError || 'Server offline'}>
              System Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
