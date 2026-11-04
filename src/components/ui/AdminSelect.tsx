import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';

interface Option {
  value: string;
  label: string;
}

interface AdminSelectProps {
  options: Option[];
  value: string | number;
  onChange: (e: { target: { name?: string, value: string } }) => void;
  name?: string;
  label?: React.ReactNode;
  containerStyle?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const AdminSelect: React.FC<AdminSelectProps> = ({ 
  options, 
  value,
  onChange,
  name,
  label, 
  containerStyle, 
  className = "",
  placeholder = "Seleccionar...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        position: 'relative',
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
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          background: disabled ? 'var(--bg-app)' : 'var(--bg-input)',
          border: isOpen ? '1px solid #C85A32' : '1px solid var(--border-med)',
          borderRadius: '10px',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '0 0 0 3px rgba(200, 90, 50, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.05)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          fontFamily: "'Source Sans 3', sans-serif",
          fontWeight: 500,
          userSelect: 'none',
          opacity: disabled ? 0.7 : 1
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          marginRight: '8px'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ 
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Icons.ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-soft)',
          zIndex: 1000,
          overflowY: 'auto',
          maxHeight: '250px',
          padding: '6px',
          animation: 'selectFadeIn 0.2s ease-out',
          scrollbarWidth: 'thin'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="admin-select-option"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: value?.toString() === opt.value.toString() ? 'rgba(200, 90, 50, 0.1)' : 'transparent',
                color: value?.toString() === opt.value.toString() ? 'var(--accent-primary)' : 'var(--text-primary)',
                fontWeight: value?.toString() === opt.value.toString() ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2px'
              }}
            >
              <span>{opt.label}</span>
              {value?.toString() === opt.value.toString() && (
                <Icons.Check size={16} strokeWidth={3} />
              )}
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes selectFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-select-option:hover {
          background: var(--bg-app) !important;
          color: var(--accent-primary) !important;
          padding-left: 16px !important;
        }
        .admin-select-option:active {
          transform: scale(0.98);
        }
        /* Custom scrollbar for dropdown */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e9ecef;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default AdminSelect;

