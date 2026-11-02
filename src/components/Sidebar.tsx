import { useNavigate, useLocation } from 'react-router-dom';
import { maskPath, plainPath } from '../routes/routeMap';
import { supabase } from '../utils/supabase';
import React, { useState } from 'react';
import { useAuth } from '../api/hooks/useAuth';
import logoUMG from '../assets/UMG-LOGO.svg';
import logoSistemas from '../assets/LogoSistemas.svg';
import { Icons } from './Icons';
import { getParticipantLabel } from '../data/userTypes';
import { isStaff } from '../utils/auth';
import { getInitials as getInitialsUtil } from '../utils/stringUtils';

interface SidebarProps {
  onModuleChange?: (moduleId: string) => void;
}

export default function Sidebar({ onModuleChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStaffMember = isStaff(user?.rol);
  const isOnlyAdmin = user?.rol === 'admin';

  interface MenuItem {
    id: string;
    label: string;
    Icon: React.FC<any>;
    section: string;
    badge?: string;
  }

  const menuItems: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', Icon: Icons.Home, section: 'GENERAL' },
    { id: 'perfil', label: 'Mi perfil', Icon: Icons.User, section: 'GENERAL' },
  ];

  // Módulos de Comercial Flores del Campo (personal)
  menuItems.push(
    { id: 'inventario', label: 'Inventario', Icon: Icons.Clipboard, section: 'COMERCIAL' },
    { id: 'bandeja-cotizaciones', label: 'Bandeja de cotizaciones', Icon: Icons.CreditCard, section: 'COMERCIAL' }
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return '??';
    return getInitialsUtil(`${user.nombres || ''} ${user.apellidos || ''}`);
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} role-${user?.rol || 'participante'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {isExpanded ? (
            <div className="logo-full">
              <span className="logo-main">FLORES DEL CAMPO</span>
              <img src={logoSistemas} alt="Sistemas UMG" className="logo-img-sub" />
            </div>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              title="Expandir"
            >
              <img src={logoUMG} alt="UMG" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
            </button>
          )}
        </div>
        {isExpanded && (
          <button className="expand-toggle" onClick={() => setIsExpanded(false)}>
            <Icons.ChevronLeft size={16} />
          </button>
        )}
      </div>

      <div
        className="sidebar-user"
        onClick={() => navigate(maskPath('/dashboard/perfil'))}
      >
        <div className={`user-avatar ${user?.rol || 'participante'}`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials()
          )}
        </div>
        {isExpanded && (
          <div className="user-info" key={`${user?.correo}-${user?.nombres}-${user?.tipoParticipante}`}>
            <span className="user-name">
              {user?.nombres || 'Colaborador'} {user?.apellidos || ''}
            </span>
            <span className="user-role">
              {getParticipantLabel(user?.tipoParticipante)}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {['GENERAL', 'COMERCIAL', 'INSCRIPCIÓN', 'ADMINISTRACIÓN', 'PERSONALIZACIÓN']
          .filter(section => {
            if (section === 'ADMINISTRACIÓN' && !isStaffMember) return false;
            if (section === 'PERSONALIZACIÓN' && !isOnlyAdmin) return false;
            return true;
          })
          .map(section => (
            <div key={section} className="nav-section">
              {isExpanded && <span className="section-title">{section}</span>}
              <ul className="nav-list">
                {menuItems.filter(item => item.section === section).map(item => (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${plainPath(location.pathname).includes(item.id) ? 'active' : (item.id === 'inicio' && plainPath(location.pathname) === '/dashboard' ? 'active' : '')}`}
                      onClick={() => {
                        navigate(maskPath(`/dashboard/${item.id}`));
                        onModuleChange?.(item.id);
                      }}
                    >
                      <span className="nav-icon"><item.Icon size={18} /></span>
                      {isExpanded && <span className="nav-label">{item.label}</span>}
                      {isExpanded && item.badge && (
                        <span className={`nav-badge ${item.badge === 'PEND' ? 'pending' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><Icons.LogOut size={18} /></span>
          {isExpanded && <span className="nav-label">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
