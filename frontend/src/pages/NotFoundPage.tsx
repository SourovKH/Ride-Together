import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '80px auto',
      padding: '0 24px',
      textAlign: 'center',
    }}>
      <div className="glass-panel" style={{ padding: '40px 32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--accent-amber)',
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>404 — Page Not Found</h2>
        <p style={{ marginBottom: '28px', color: 'var(--text-secondary)' }}>
          The page or ride URL you are looking for does not exist or has expired.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          <Home size={18} /> Return Home
        </Link>
      </div>
    </div>
  );
};
