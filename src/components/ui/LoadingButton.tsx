import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
}

export default function LoadingButton({
  children,
  isLoading,
  loadingText,
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}: LoadingButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          boxShadow: 'none'
        };
      case 'secondary':
        return {
          background: 'var(--bg-app)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-soft)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        };
      case 'danger':
        return {
          background: '#ef4444',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
        };
      case 'success':
        return {
          background: '#10b981',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'none'
        };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    borderRadius: '14px',
    fontWeight: 700,
    fontSize: '15px',
    cursor: (isLoading || disabled) ? 'not-allowed' : 'pointer',
    opacity: (isLoading || disabled) ? 0.7 : 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: "'Source Sans 3', sans-serif",
    ...getVariantStyles(),
    ...style
  };

  return (
    <button
      disabled={isLoading || disabled}
      style={baseStyle}
      className={`loading-button ${className}`}
      {...props}
    >
      {isLoading && (
        <div className="button-spinner"></div>
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>

      <style>{`
        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: button-spin 0.8s linear infinite;
        }
        @keyframes button-spin {
          to { transform: rotate(360deg); }
        }
        .loading-button:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .loading-button:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.95);
        }
      `}</style>
    </button>
  );
}

