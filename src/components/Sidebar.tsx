import { useNavigate, useLocation } from 'react-router-dom';
import { maskPath, plainPath } from '../routes/routeMap';
import { supabase } from '../utils/supabase';
import React, { useState } from 'react';
import { useAuth } from '../api/hooks/useAuth';
import { useDashboardTitle } from '../utils/DashboardTitleContext';
import { Icons } from './Icons';
import { getInitials as getInitialsUtil } from '../utils/stringUtils';

interface SidebarProps {
  onModuleChange?: (moduleId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  Icon: React.FC<any>;
  section: string;
  badge?: string;
  path?: string;
}

export default function Sidebar({ onModuleChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { setTitle } = useDashboardTitle();
  const navigate = useNavigate();
  const location = useLocation();

  // Rol determinado estrictamente desde public.roles ('sistemas' | 'administrador' | 'colaborador')
  const rawRole = (user?.rol || 'colaborador').toLowerCase().trim();
  const isUserSistemas = rawRole === 'sistemas' || user?.correo === 'salexanderr2@gmail.com';
  const isUserAdmin = rawRole === 'administrador';
  const roleKey = isUserSistemas ? 'sistemas' : isUserAdmin ? 'administrador' : 'colaborador';

  const menuItems: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', Icon: Icons.Home, section: 'GENERAL' },
    { id: 'perfil', label: 'Mi perfil', Icon: Icons.User, section: 'GENERAL' },
  ];

  // Módulos Comerciales:
  // - Colaborador: Catálogo interno y Bandeja de cotizaciones
  menuItems.push(
    { id: 'catalogo-admin', label: 'Catálogo de Mercaderías', Icon: Icons.Package, section: 'COMERCIAL' },
    { id: 'bandeja-cotizaciones', label: 'Bandeja de Cotizaciones', Icon: Icons.CreditCard, section: 'COMERCIAL' }
  );

  // - Colaborador, Administrador y Sistemas: Clientes
  menuItems.push(
    { id: 'clientes', label: 'Gestión de Clientes', Icon: Icons.Users, section: 'COMERCIAL' }
  );

  // - Administrador y Sistemas: Gestión completa de Inventario, Categorías y Unidades de Medida
  if (isUserSistemas || isUserAdmin) {
    menuItems.push(
      { id: 'inventario', label: 'Gestión de Inventario', Icon: Icons.Clipboard, section: 'COMERCIAL' },
      { id: 'categorias', label: 'Gestión de Categorías', Icon: Icons.Layers, section: 'COMERCIAL' },
      { id: 'unidades-medida', label: 'Gestión de Unidades de Medida', Icon: Icons.ClipboardList, section: 'COMERCIAL' }
    );
  }

  // - Solo Sistemas: Gestión de Usuarios / Roles y Auditoría del Sistema
  if (isUserSistemas) {
    menuItems.push(
      { id: 'usuarios', label: 'Usuarios y Roles', Icon: Icons.Users, section: 'SISTEMAS' },
      { id: 'auditoria', label: 'Auditoría del Sistema', Icon: Icons.Shield, section: 'SISTEMAS' }
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return '??';
    return getInitialsUtil(user.nombre || user.correo || 'Usuario');
  };

  const formatRoleLabel = (role: string) => {
    switch (role) {
      case 'sistemas': return 'Sistemas (Superadmin)';
      case 'administrador': return 'Administrador';
      case 'colaborador': return 'Colaborador';
      default: return role;
    }
  };

  const visibleSections = Array.from(new Set(menuItems.map(item => item.section)));

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} role-${roleKey}`}>
      <div
        className="sidebar-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: isExpanded ? '1.5rem' : '1rem 0.5rem',
        }}
      >
        {isExpanded ? (
          <>
            <div className="sidebar-logo">
              <span className="logo-main">FLORES DEL CAMPO</span>
            </div>
            <button
              type="button"
              className="expand-toggle"
              onClick={() => setIsExpanded(false)}
              title="Contraer barra lateral"
              aria-label="Contraer barra lateral"
            >
              <Icons.ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="expand-toggle"
            onClick={() => setIsExpanded(true)}
            title="Expandir barra lateral"
            aria-label="Expandir barra lateral"
          >
            <Icons.ChevronRight size={18} />
          </button>
        )}
      </div>

      <div
        className="sidebar-user"
        onClick={() => navigate(maskPath('/dashboard/perfil'))}
      >
        <div className={`user-avatar ${roleKey}`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getInitials()}
        </div>
        {isExpanded && (
          <div className="user-info" key={`${user?.correo}-${user?.nombre}`}>
            <span className="user-name">
              {user?.nombre || user?.correo || 'Colaborador'}
            </span>
            <span className="user-role" style={{ textTransform: 'capitalize' }}>
              {formatRoleLabel(roleKey)}
            </span>
            {user?.telegram_username && (
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>
                @{user.telegram_username}
              </span>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {visibleSections.map(section => (
          <div key={section} className="nav-section">
            {isExpanded && <span className="section-title">{section}</span>}
            <ul className="nav-list">
              {menuItems.filter(item => item.section === section).map(item => {
                const targetUrl = item.path ? maskPath(item.path) : maskPath(`/dashboard/${item.id}`);
                const currentLogical = plainPath(location.pathname);
                const isActive = item.path
                  ? currentLogical === item.path || currentLogical.startsWith(item.path + '/')
                  : currentLogical.includes(item.id) || (item.id === 'inicio' && currentLogical === '/dashboard');

                return (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setTitle(item.label);
                        navigate(targetUrl);
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
                );
              })}
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
