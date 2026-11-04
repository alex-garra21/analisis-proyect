import { useState, useMemo } from 'react';
import { useClientes, useDeleteCliente } from '../../../api/hooks/useComercial';
import type { Cliente } from '../../../types/database';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTable from '../../../components/ui/AdminTable';
import SearchBar from '../../../components/ui/SearchBar';
import { Icons } from '../../../components/Icons';
import { showToast, showConfirm } from '../../../utils/swal';
import ClienteFormModal from './ClienteFormModal';

export default function ClientesModule() {
  const { data: clientes = [], isLoading } = useClientes();
  const deleteMutation = useDeleteCliente();

  const [query, setQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre_institucion.toLowerCase().includes(q) ||
        (c.contacto_persona && c.contacto_persona.toLowerCase().includes(q)) ||
        (c.nit && c.nit.toLowerCase().includes(q)) ||
        (c.telefono && c.telefono.toLowerCase().includes(q)) ||
        (c.direccion && c.direccion.toLowerCase().includes(q))
    );
  }, [clientes, query]);

  const handleOpenCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Cliente) => {
    setSelectedCliente(c);
    setIsModalOpen(true);
  };

  const handleDelete = async (c: Cliente) => {
    const confirmed = await showConfirm(
      `¿Deseas eliminar el cliente "${c.nombre_institucion}"?`,
      'Solo se podrá eliminar si no cuenta con cotizaciones asociadas.'
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(c.id);
        showToast('Cliente eliminado exitosamente.', 'success');
      } catch (err: any) {
        showToast(`Error al eliminar cliente: ${err.message}`, 'error');
      }
    }
  };

  const headers = [
    'Institución / Razón Social',
    'Contacto / Correo',
    'Teléfono',
    'NIT',
    'Dirección',
    'Acciones',
  ];

  return (
    <div className="clientes-module">
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
        <ModuleTitle title="Gestión de Clientes" />

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
          <span>Nuevo Cliente</span>
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
          placeholder="Buscar por institución, contacto, nit o teléfono..."
          style={{ maxWidth: '440px' }}
        />

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {filtrados.length} cliente{filtrados.length === 1 ? '' : 's'} registrado{filtrados.length === 1 ? '' : 's'}
        </div>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No se encontraron clientes registrados en la base de datos."
      >
        {filtrados.map((c) => (
          <tr key={c.id}>
            <td>
              <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                {c.nombre_institucion}
              </strong>
            </td>
            <td>
              {c.contacto_persona ? (
                <span style={{ color: 'var(--text-primary)' }}>{c.contacto_persona}</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </td>
            <td>
              {c.telefono ? (
                <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-secondary)' }}>
                  {c.telefono}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </td>
            <td>
              <span
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-secondary)',
                }}
              >
                {c.nit || 'C/F'}
              </span>
            </td>
            <td style={{ color: 'var(--text-secondary)', maxWidth: '240px', fontSize: '13px' }}>
              {c.direccion || <span style={{ color: 'var(--text-muted)' }}>—</span>}
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
                  title="Editar cliente"
                >
                  <Icons.Edit size={14} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => handleDelete(c)}
                  title="Eliminar cliente"
                >
                  <Icons.Trash size={14} />
                  <span>Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        clienteToEdit={selectedCliente}
      />
    </div>
  );
}
