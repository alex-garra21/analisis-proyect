import React, { useState } from 'react';
import { Icons } from './Icons';

interface PasswordFieldProps {
  label?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
  error?: boolean;
  success?: boolean;
  showSuccess?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  name,
  placeholder = "Tu contraseña",
  required = false,
  style = {},
  className = "",
  error = false,
  success,
  showSuccess,
  disabled = false,
  autoComplete = "current-password"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  // El check verde ('✓') ÚNICAMENTE se muestra si la prop es estrictamente true y el campo no está vacío
  const isSuccess = (success === true || showSuccess === true) && Boolean(value && value.trim().length > 0);

  return (
    <div className={`${className}`} style={{ marginBottom: '1.5rem', ...style }}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '11px', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          color: 'var(--text-secondary)', 
          letterSpacing: '0.8px', 
          marginBottom: '6px' 
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? "text" : "password"}
          className="dashboard-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            paddingRight: isSuccess ? '68px' : '42px',
            borderColor: isSuccess ? '#16a34a' : error ? '#ef4444' : undefined,
          }}
        />
        
        {/* Check Verde de Éxito: Solo visible si isSuccess es estrictamente true */}
        {isSuccess && (
          <div
            style={{ 
              position: 'absolute', 
              right: '42px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <Icons.Check size={18} color="#16a34a" strokeWidth={2.5} />
          </div>
        )}

        {/* Botón de alternar visibilidad (Ojo) */}
        <button
          type="button"
          onClick={toggleVisibility}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            opacity: disabled ? 0.4 : 0.6,
            transition: 'opacity 0.2s',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <Icons.Eye key="eye-open" size={18} />
          ) : (
            <Icons.EyeOff key="eye-closed" size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
