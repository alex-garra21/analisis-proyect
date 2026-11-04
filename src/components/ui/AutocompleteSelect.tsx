import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';

export interface AutocompleteOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

export interface AutocompleteSelectProps {
  options: AutocompleteOption[];
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function AutocompleteSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  required = false,
  emptyMessage = 'No se encontraron resultados',
  style = {},
  className = '',
}: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (opt) => String(opt.value) === (value !== null && value !== undefined ? String(value) : '')
  );

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  });

  const handleSelect = (val: string | number) => {
    onChange(String(val));
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className={`autocomplete-select-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: "'Source Sans 3', sans-serif",
        ...style,
      }}
    >
      {/* Campo Trigger / Input */}
      <div
        onClick={handleOpen}
        style={{
          width: '100%',
          background: disabled ? 'var(--status-disabled, #E2DCD5)' : '#FFFFFF',
          border: isOpen ? '1px solid #C85A32' : '1px solid var(--border-soft, #E6DFD5)',
          borderRadius: '8px',
          padding: '9px 14px',
          paddingRight: '36px',
          fontSize: '14px',
          color: selectedOption ? '#2C221E' : '#7C6E67',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s ease',
          outline: 'none',
          boxShadow: 'none',
          userSelect: 'none',
          minHeight: '42px',
          boxSizing: 'border-box',
        }}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontFamily: "'Source Sans 3', sans-serif",
              color: '#2C221E',
              padding: 0,
              margin: 0,
            }}
            onClick={(e) => e.stopPropagation()}
            required={required && !value}
          />
        ) : (
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: selectedOption ? 600 : 400,
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}

        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
            transition: 'transform 0.2s ease',
            color: '#C85A32',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.ChevronDown size={15} />
        </div>
      </div>

      {/* Menú Flotante de Opciones */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid var(--border-soft, #E6DFD5)',
            boxShadow: '0 4px 16px rgba(44, 34, 30, 0.08)',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected =
                String(opt.value) ===
                (value !== null && value !== undefined ? String(value) : '');
              return (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSelected ? 'rgba(200, 90, 50, 0.1)' : 'transparent',
                    color: isSelected ? '#C85A32' : '#2C221E',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#FDFBF7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span style={{ fontSize: '11px', color: '#7C6E67' }}>
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Icons.Check size={14} color="#C85A32" />}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '13px',
                color: '#7C6E67',
                fontStyle: 'italic',
              }}
            >
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
