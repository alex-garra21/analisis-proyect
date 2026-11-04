import React from 'react';
import { Icons } from '../Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = "",
  style
}) => {
  return (
    <div className={`search-bar-container ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '400px', ...style }}>
      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
        <Icons.Search size={17} color="var(--text-muted)" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px 10px 38px',
          fontSize: '14px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-med)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: "'Source Sans 3', sans-serif",
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
        className="search-input-focus"
      />
    </div>
  );
};

export default SearchBar;

