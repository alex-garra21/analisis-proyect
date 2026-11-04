import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  fill?: string;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const BaseIcon = ({ 
  size = 24, 
  color = "currentColor", 
  strokeWidth = 2, 
  fill = "none", 
  className = "", 
  style = {}, 
  children 
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {children}
  </svg>
);

export const Icons = {
  Check: (props: IconProps) => (
    <BaseIcon {...props}><polyline points="20 6 9 17 4 12" /></BaseIcon>
  ),
  CheckCircle: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </BaseIcon>
  ),
  AlertTriangle: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </BaseIcon>
  ),
  ArrowLeft: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </BaseIcon>
  ),
  CreditCard: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </BaseIcon>
  ),
  Layout: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </BaseIcon>
  ),
  Users: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </BaseIcon>
  ),
  User: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </BaseIcon>
  ),
  Award: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </BaseIcon>
  ),
  Calendar: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </BaseIcon>
  ),
  Clock: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </BaseIcon>
  ),
  Search: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </BaseIcon>
  ),
  QrCode: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="7" y1="7" x2="7" y2="7" />
      <line x1="17" y1="7" x2="17" y2="7" />
      <line x1="17" y1="17" x2="17" y2="17" />
      <line x1="7" y1="17" x2="7" y2="17" />
    </BaseIcon>
  ),
  Plus: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </BaseIcon>
  ),
  Trash: (props: IconProps) => (
    <BaseIcon {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </BaseIcon>
  ),
  Edit: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z" />
    </BaseIcon>
  ),
  LogOut: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </BaseIcon>
  ),
  Settings: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </BaseIcon>
  ),
  MapPin: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </BaseIcon>
  ),
  Map: (props: IconProps) => (
    <BaseIcon {...props} fill={props.color || "currentColor"} strokeWidth={0}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </BaseIcon>
  ),

  Navigation: (props: IconProps) => (
    <BaseIcon {...props}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </BaseIcon>
  ),
  Download: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </BaseIcon>
  ),
  Eye: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  ),
  EyeOff: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </BaseIcon>
  ),
  Shield: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </BaseIcon>
  ),
  BarChart: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </BaseIcon>
  ),
  Clipboard: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </BaseIcon>
  ),
  ClipboardList: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </BaseIcon>
  ),
  Home: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </BaseIcon>
  ),
  Info: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </BaseIcon>
  ),
  Smartphone: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </BaseIcon>
  ),
  Mail: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </BaseIcon>
  ),
  Menu: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </BaseIcon>
  ),
  Mic: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </BaseIcon>
  ),
  X: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </BaseIcon>
  ),
  ChevronDown: (props: IconProps) => (
    <BaseIcon {...props}><polyline points="6 9 12 15 18 9" /></BaseIcon>
  ),
  ChevronRight: (props: IconProps) => (
    <BaseIcon {...props}><polyline points="9 18 15 12 9 6" /></BaseIcon>
  ),
  ChevronLeft: (props: IconProps) => (
    <BaseIcon {...props}><polyline points="15 18 9 12 15 6" /></BaseIcon>
  ),
  Facebook: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </BaseIcon>
  ),
  Instagram: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </BaseIcon>
  ),
  TikTok: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </BaseIcon>
  ),
  TwitterX: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m2.464-2.464l6.768-6.768" />
    </BaseIcon>
  ),
  LinkedIn: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </BaseIcon>
  ),
  Bot: (props: IconProps) => (
    <BaseIcon {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </BaseIcon>
  ),
  Zap: (props: IconProps) => (
    <BaseIcon {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </BaseIcon>
  ),
  Trophy: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
      <path d="M12 14.66C8.69 14.66 6 11.97 6 8.66V3h12v5.66c0 3.31-2.69 6-6 6z" />
    </BaseIcon>
  ),
  Camera: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </BaseIcon>
  ),
  Youtube: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </BaseIcon>
  ),
  Twitch: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13h-4l-3 3v-3H5V4h14v11z" />
      <path d="M16 7h-2v4h2V7zm-4 0h-2v4h2V7z" />
    </BaseIcon>
  ),
  Pinterest: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="8" y1="20" x2="12" y2="11" />
      <path d="M12 12c2-1 3-2.5 3-4.5A4.5 4.5 0 0 0 10.5 3 4.5 4.5 0 0 0 6 7.5c0 1.5.5 2.5 1.5 3" />
      <circle cx="12" cy="12" r="11" />
    </BaseIcon>
  ),
  Snapchat: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M12 2c1 0 3 2.5 3 4s-1 2-1 3c0 1 2 2 3 2s3-1 3-1 1 2 1 3c0 2-5 3-5 3s-1 2-4 2-4-2-4-2-5-1-5-3c0-1 1-3 1-3s2 1 3 1 3-1 3-2c0-1-1-1.5-1-3s2-4 3-4z" />
    </BaseIcon>
  ),
  WhatsApp: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 11.5z" />
      <path d="M16 11l-1.5-1.5a.5.5 0 0 0-.7 0l-1.5 1.5a2.5 2.5 0 0 1-3.5-3.5l1.5-1.5a.5.5 0 0 0 0-.7L9 4" />
    </BaseIcon>
  ),
  Reddit: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M17 16c-1 1-2.5 2-5 2s-4-1-5-2" />
      <path d="M12 3l1 2" />
      <circle cx="13.5" cy="4.5" r="1.5" />
    </BaseIcon>
  ),
  Discord: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M18 6l-1-1-2 1H9L7 5l-1 1v7c0 2 2 4 4 4h4c2 0 4-2 4-4V6z" />
      <circle cx="10" cy="11" r="1" />
      <circle cx="14" cy="11" r="1" />
      <path d="M10 15c1 1 3 1 4 0" />
    </BaseIcon>
  ),
  Behance: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M9 13H5v3h4c1 0 2-1 2-1.5S10 13 9 13z" />
      <path d="M9 6H5v4h4c1 0 2-1 2-2s-1-2-2-2z" />
      <path d="M15 11a3 3 0 1 0 3 3v-1" />
      <line x1="15" y1="8" x2="21" y2="8" />
    </BaseIcon>
  ),
  Dribbble: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="11" />
      <path d="M12 1c0 0 4 7 11 8" />
      <path d="M3 5c0 0 7 2 9 18" />
      <path d="M20 20c0 0-4-7-11-8" />
    </BaseIcon>
  ),
  Telegram: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </BaseIcon>
  ),
  Threads: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
      <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
      <path d="M12 9c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
    </BaseIcon>
  ),
  Globe: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </BaseIcon>
  ),
  ExternalLink: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </BaseIcon>
  ),
  Star: (props: IconProps) => (
    <BaseIcon {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </BaseIcon>
  ),
  Maximize: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </BaseIcon>
  ),
  Type: (props: IconProps) => (
    <BaseIcon {...props}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </BaseIcon>
  ),
  RefreshCw: (props: IconProps) => (
    <BaseIcon {...props}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </BaseIcon>
  ),
  Save: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </BaseIcon>
  ),
  ShoppingCart: (props: IconProps) => (
    <BaseIcon {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </BaseIcon>
  ),
  Package: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </BaseIcon>
  ),
  ArrowRight: (props: IconProps) => (
    <BaseIcon {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </BaseIcon>
  ),
  Layers: (props: IconProps) => (
    <BaseIcon {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </BaseIcon>
  ),
  Power: (props: IconProps) => (
    <BaseIcon {...props}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </BaseIcon>
  ),
};
