import { useEffect } from 'react';
import { useDashboardTitle } from '../utils/DashboardTitleContext';

interface ModuleTitleProps {
  title: string;
}

/**
 * Componente que permite a cada módulo definir su propio título
 * en el encabezado del Dashboard usando Context.
 */
export default function ModuleTitle({ title }: ModuleTitleProps) {
  const { setTitle } = useDashboardTitle();

  useEffect(() => {
    setTitle(title);
    // document.title = `${title} | Comercial Flores del Campo`; // Opcional: actualizar pestaña
  }, [title, setTitle]);

  return null;
}
