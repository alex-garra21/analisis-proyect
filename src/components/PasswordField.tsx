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
  success = false,
  disabled = false,
  autoComplete = "current-password"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            paddingRight: (success || showPassword || !showPassword) ? '45px' : '16px',
            borderColor: success ? 'var(--accent-primary)' : error ? '#ef4444' : undefined,
          }}
        />
        
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

        {success && !showPassword && (
          <div style={{ 
            position: 'absolute', 
            right: '45px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            display: 'flex' 
          }}>
            <Icons.Check size={18} color="var(--accent-primary)" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordField;
