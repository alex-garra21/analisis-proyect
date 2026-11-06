import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import type { UnidadMedida } from '../../../types/database';
import { useCreateUnidadMedida, useUpdateUnidadMedida } from '../../../api/hooks/useComercial';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';

interface UnidadMedidaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  unidadToEdit?: UnidadMedida | null;
}

export default function UnidadMedidaFormModal({
  isOpen,
  onClose,
  unidadToEdit,
}: UnidadMedidaFormModalProps) {
  const isEditing = Boolean(unidadToEdit);
  const createMutation = useCreateUnidadMedida();
  const updateMutation = useUpdateUnidadMedida();

  const [nombre, setNombre] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [activo, setActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setNombre('');
    setAbreviatura('');
    setActivo(true);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (unidadToEdit) {
        setNombre(unidadToEdit.nombre || '');
        setAbreviatura(unidadToEdit.abreviatura || '');
        setActivo(unidadToEdit.activo ?? true);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }, [unidadToEdit, isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      showToast('Ingresa el nombre de la unidad de medida.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && unidadToEdit) {
        await updateMutation.mutateAsync({
          id: Number(unidadToEdit.id),
          data: {
            nombre: nombre.trim(),
            abreviatura: abreviatura.trim() ? abreviatura.trim().toUpperCase() : null,
            activo,
          },
        });
        showToast('Unidad de medida actualizada exitosamente.', 'success');
      } else {
        await createMutation.mutateAsync({
          nombre: nombre.trim(),
          abreviatura: abreviatura.trim() ? abreviatura.trim().toUpperCase() : null,
          activo,
        });
        showToast('Unidad de medida registrada exitosamente.', 'success');
      }

      handleClose();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
      maxWidth="500px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isEditing
          ? 'Modifica los datos de la unidad de medida utilizada en el catálogo e inventario.'
          : 'Registra una nueva unidad de medida estándar (ej. Docena, Paquete, Caja, Ramo).'}
      </p>

      <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField label="Nombre de la Unidad">
          <input
            type="text"
            className="dashboard-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Docena, Paquete, Caja, Ramo, Mazo..."
            required
            autoFocus
          />
        </FormField>

        <FormField label="Abreviatura o Código">
          <input
            type="text"
            className="dashboard-input"
            value={abreviatura}
            onChange={(e) => setAbreviatura(e.target.value.toUpperCase())}
            placeholder="Ej. DOC, PQT, CAJ, RAM, UND..."
            maxLength={10}
            style={{ textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Sigla corta para reportes, cotizaciones e inventario (ej. DOC, CAJ).
          </span>
        </FormField>

        {/* Estado activo/inactivo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C221E', display: 'block' }}>
              Estado Operativo
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {activo
                ? 'Disponible para asignar a mercaderías y cotizaciones'
                : 'Oculta en nuevos formularios de productos'}
            </span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: activo ? '#16a34a' : 'var(--text-secondary)' }}>
              {activo ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{ padding: '10px 18px' }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting}
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
                <span>{isEditing ? 'Actualizando...' : 'Guardando...'}</span>
              </>
            ) : (
              <>
                <Icons.Check size={16} />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Unidad'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
