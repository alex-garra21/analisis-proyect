import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import type { Categoria } from '../../../types/database';
import { useCreateCategoria, useUpdateCategoria } from '../../../api/hooks/useComercial';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';

interface CategoriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaToEdit?: Categoria | null;
}

export default function CategoriaFormModal({
  isOpen,
  onClose,
  categoriaToEdit,
}: CategoriaFormModalProps) {
  const isEditing = Boolean(categoriaToEdit);
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoriaToEdit) {
      setNombre(categoriaToEdit.nombre || '');
      setDescripcion(categoriaToEdit.descripcion || '');
    } else {
      setNombre('');
      setDescripcion('');
    }
  }, [categoriaToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      showToast('Ingresa el nombre de la categoría.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && categoriaToEdit) {
        await updateMutation.mutateAsync({
          id: categoriaToEdit.id,
          data: {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
          },
        });
        showToast('Categoría actualizada exitosamente.', 'success');
      } else {
        await createMutation.mutateAsync({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });
        showToast('Categoría registrada exitosamente.', 'success');
      }

      onClose();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      maxWidth="500px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isEditing
          ? 'Modifica los datos de la categoría para la clasificación de mercaderías.'
          : 'Registra una nueva categoría para organizar el catálogo e inventario.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField label="Nombre de la Categoría">
          <input
            type="text"
            className="dashboard-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Flores de Temporada, Follajes, Arreglos..."
            required
            autoFocus
          />
        </FormField>

        <FormField label="Descripción (Opcional)">
          <textarea
            className="dashboard-input"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción o uso de la categoría..."
            style={{ resize: 'vertical' }}
          />
        </FormField>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '10px 18px' }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting || !nombre.trim()}
            style={{
              padding: '10px 22px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Icons.RefreshCw size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Icons.Check size={16} />
                <span>{isEditing ? 'Guardar Cambios' : 'Registrar Categoría'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
