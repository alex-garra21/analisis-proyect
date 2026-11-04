import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import type { Cliente } from '../../../types/database';
import { useCreateCliente, useUpdateCliente } from '../../../api/hooks/useComercial';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteToEdit?: Cliente | null;
}

export default function ClienteFormModal({
  isOpen,
  onClose,
  clienteToEdit,
}: ClienteFormModalProps) {
  const isEditing = Boolean(clienteToEdit);
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  const [nombreInstitucion, setNombreInstitucion] = useState('');
  const [contactoPersona, setContactoPersona] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clienteToEdit) {
      setNombreInstitucion(clienteToEdit.nombre_institucion || '');
      setContactoPersona(clienteToEdit.contacto_persona || '');
      setNit(clienteToEdit.nit || '');
      setTelefono(clienteToEdit.telefono || '');
      setDireccion(clienteToEdit.direccion || '');
    } else {
      setNombreInstitucion('');
      setContactoPersona('');
      setNit('');
      setTelefono('');
      setDireccion('');
    }
  }, [clienteToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreInstitucion.trim()) {
      showToast('Ingresa el nombre o razón social de la institución/cliente.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nombre_institucion: nombreInstitucion.trim(),
        contacto_persona: contactoPersona.trim() || null,
        nit: nit.trim() || null,
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
      };

      if (isEditing && clienteToEdit) {
        await updateMutation.mutateAsync({
          id: clienteToEdit.id,
          input: payload,
        });
        showToast('Cliente actualizado exitosamente.', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Cliente registrado exitosamente.', 'success');
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
      title={isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      maxWidth="600px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isEditing
          ? 'Actualiza los datos de contacto y facturación del cliente o institución.'
          : 'Registra un cliente para poder vincularlo a cotizaciones y despachos.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField label="Nombre de la Institución / Cliente">
          <input
            type="text"
            className="dashboard-input"
            value={nombreInstitucion}
            onChange={(e) => setNombreInstitucion(e.target.value)}
            placeholder="Ej. Escuela Oficial Rural Mixta, Hotel Antigua..."
            required
            autoFocus
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <FormField label="Persona de Contacto / Correo">
            <input
              type="text"
              className="dashboard-input"
              value={contactoPersona}
              onChange={(e) => setContactoPersona(e.target.value)}
              placeholder="Ej. Lic. Carlos Gómez o contacto@empresa.com"
            />
          </FormField>

          <FormField label="Teléfono de Contacto">
            <input
              type="text"
              className="dashboard-input"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. +502 5555-1234"
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <FormField label="NIT (Opcional)">
            <input
              type="text"
              className="dashboard-input"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Ej. 1234567-8 o C/F"
            />
          </FormField>

          <FormField label="Dirección de Entrega / Facturación">
            <input
              type="text"
              className="dashboard-input"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej. 4ta Calle 2-15 Zona 1, Guatemala"
            />
          </FormField>
        </div>

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
            disabled={isSubmitting || !nombreInstitucion.trim()}
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
                <span>{isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
