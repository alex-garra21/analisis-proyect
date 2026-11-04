import { useState, useMemo } from 'react';
import { useCategorias, useDeleteCategoria, useMercaderias } from '../../../api/hooks/useComercial';
import type { Categoria } from '../../../types/database';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTable from '../../../components/ui/AdminTable';
import SearchBar from '../../../components/ui/SearchBar';
import { Icons } from '../../../components/Icons';
import { showToast, showConfirm } from '../../../utils/swal';
import CategoriaFormModal from './CategoriaFormModal';

export default function CategoriasModule() {
  const { data: categorias = [], isLoading } = useCategorias();
  const { data: mercaderias = [] } = useMercaderias();
  const deleteMutation = useDeleteCategoria();

  const [query, setQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calcular cantidad de mercaderías por categoría
  const countPorCategoria = useMemo(() => {
    const counts: Record<number, number> = {};
    mercaderias.forEach((m) => {
      if (m.categoria_id) {
        counts[m.categoria_id] = (counts[m.categoria_id] || 0) + 1;
      }
    });
    return counts;
  }, [mercaderias]);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(q))
    );
  }, [categorias, query]);

  const handleOpenCreate = () => {
    setSelectedCategoria(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Categoria) => {
    setSelectedCategoria(c);
    setIsModalOpen(true);
  };

  const handleDelete = async (c: Categoria) => {
    const count = countPorCategoria[c.id] || 0;
    if (count > 0) {
      showToast(
        `No se puede eliminar la categoría "${c.nombre}" porque tiene ${count} mercadería(s) asociada(s).`,
        'warning'
      );
      return;
    }

    const confirmed = await showConfirm(
      `¿Deseas eliminar la categoría "${c.nombre}"?`,
      'Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(c.id);
        showToast('Categoría eliminada correctamente.', 'success');
      } catch (err: any) {
        showToast(`Error al eliminar: ${err.message}`, 'error');
      }
    }
  };

  const headers = ['ID', 'Nombre de la Categoría', 'Descripción', 'Mercaderías Asociadas', 'Acciones'];

  return (
    <div className="categorias-module">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <ModuleTitle title="Gestión de Categorías" />

        <button
          type="button"
          className="btn-solid"
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Icons.Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '1.5rem 0',
        }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre o descripción de categoría..."
          style={{ maxWidth: '400px' }}
        />

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {filtradas.length} categoría{filtradas.length === 1 ? '' : 's'} registrada{filtradas.length === 1 ? '' : 's'}
        </div>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No se encontraron categorías registradas en la base de datos."
      >
        {filtradas.map((c) => (
          <tr key={c.id}>
            <td>
              <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-muted)', fontWeight: 600 }}>
                #{c.id}
              </span>
            </td>
            <td>
              <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{c.nombre}</strong>
            </td>
            <td style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
              {c.descripcion || <span style={{ color: 'var(--text-muted)' }}>Sin descripción</span>}
            </td>
            <td>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'rgba(200, 90, 50, 0.08)',
                  color: '#C85A32',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {countPorCategoria[c.id] || 0} producto(s)
              </span>
            </td>
            <td>
              <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="admin-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#F2ECE4',
                    color: '#2C221E',
                    borderColor: '#E6DFD5',
                  }}
                  onClick={() => handleOpenEdit(c)}
                  title="Editar categoría"
                >
                  <Icons.Edit size={14} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => handleDelete(c)}
                  title="Eliminar categoría"
                >
                  <Icons.Trash size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <CategoriaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategoria(null);
        }}
        categoriaToEdit={selectedCategoria}
      />
    </div>
  );
}
