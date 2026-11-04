import React from 'react';

interface AdminDateInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerStyle?: React.CSSProperties;
  className?: string;
}

const AdminDateInput: React.FC<AdminDateInputProps> = ({ 
  label, 
  value, 
  onChange, 
  containerStyle,
  className = "" 
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        ...containerStyle 
      }}
      className={className}
    >
      {label && (
        <label style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.8px',
          marginLeft: '4px'
        }}>
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '11px 16px',
          fontSize: '14px',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-soft)',
          borderRadius: '12px',
          color: 'var(--text-primary)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: "'Source Sans 3', sans-serif",
          fontWeight: 500,
          outline: 'none'
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1.5px solid var(--accent-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(200, 90, 50, 0.15)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1.5px solid var(--border-soft)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
};

export default AdminDateInput;

