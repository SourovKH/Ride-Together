import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
      padding: '24px 24px',
      textAlign: 'center',
      marginTop: 'auto',
      color: 'var(--text-muted)',
      fontSize: '0.88rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>RideTogether &copy; 2026 — Real-time Group Riding & Tour Coordination</p>
      </div>
    </footer>
  );
};
