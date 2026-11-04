import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AutocompleteSelect from '../../../components/ui/AutocompleteSelect';
import { useClientes, useMercaderias, useCreateCotizacionManual } from '../../../api/hooks/useComercial';
import { useAuth } from '../../../api/hooks/useAuth';
import { formatQuetzales } from '../../../types/database';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';

interface CotizacionManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  mercaderia_id: number;
  codigo_mercaderia: string;
  nombre: string;
  cantidad: number;
  precio_aplicado: number;
  subtotal: number;
}

export default function CotizacionManualModal({ isOpen, onClose }: CotizacionManualModalProps) {
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  const { data: mercaderias = [], isLoading: isLoadingMercaderias } = useMercaderias();
  const createCotizacionMutation = useCreateCotizacionManual();
  const { user } = useAuth();

  // Cliente
  const [isNuevoCliente, setIsNuevoCliente] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [nuevoNombreInstitucion, setNuevoNombreInstitucion] = useState('');
  const [nuevoContacto, setNuevoContacto] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoNit, setNuevoNit] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');

  // Selector de insumos para agregar
  const [selectedMercaderiaId, setSelectedMercaderiaId] = useState<string>('');
  const [itemCantidad, setItemCantidad] = useState<string>('1');
  const [itemPrecio, setItemPrecio] = useState<string>('');

  // Lista de items en la cotización
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al seleccionar un producto en el dropdown, prellenar su precio unitario automáticamente
  const handleSelectMercaderia = (idStr: string) => {
    setSelectedMercaderiaId(idStr);
    const found = mercaderias.find((m) => String(m.id) === String(idStr));
    if (found) {
      // Formatear el precio unitario oficial con dos decimales o valor limpio
      const precioNum = Number(found.precio_unitario) || 0;
      setItemPrecio(precioNum.toFixed(2));
    } else {
      setItemPrecio('');
    }
  };

  const handleAddItem = () => {
    const mId = Number(selectedMercaderiaId);
    if (!mId) {
      showToast('Selecciona un producto o insumo.', 'warning');
      return;
    }

    const mercaderia = mercaderias.find((m) => m.id === mId);
    if (!mercaderia) return;

    const cant = parseInt(itemCantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      showToast('La cantidad debe ser mayor a 0.', 'warning');
      return;
    }

    const prec = parseFloat(itemPrecio);
    if (isNaN(prec) || prec < 0) {
      showToast('El precio aplicado debe ser válido.', 'warning');
      return;
    }

    // Verificar si ya existe en la lista para sumar cantidad
    const existingIndex = items.findIndex((it) => it.mercaderia_id === mId);
    if (existingIndex >= 0) {
      const updated = [...items];
      const newCant = updated[existingIndex].cantidad + cant;
      updated[existingIndex].cantidad = newCant;
      updated[existingIndex].precio_aplicado = prec;
      updated[existingIndex].subtotal = newCant * prec;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          mercaderia_id: mId,
          codigo_mercaderia: mercaderia.codigo_mercaderia,
          nombre: mercaderia.nombre,
          cantidad: cant,
          precio_aplicado: prec,
          subtotal: cant * prec,
        },
      ]);
    }

    // Reset selector
    setSelectedMercaderiaId('');
    setItemCantidad('1');
    setItemPrecio('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuetzales = items.reduce((sum, it) => sum + it.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast('Debes agregar al menos un insumo a la cotización.', 'warning');
      return;
    }

    if (!isNuevoCliente && !selectedClienteId) {
      showToast('Selecciona un cliente o marca la opción para registrar uno nuevo.', 'warning');
      return;
    }

    if (isNuevoCliente && !nuevoNombreInstitucion.trim()) {
      showToast('Ingresa el nombre o institución del nuevo cliente.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCotizacionMutation.mutateAsync({
        cliente_id: isNuevoCliente ? undefined : Number(selectedClienteId),
        nuevo_cliente: isNuevoCliente
          ? {
              nombre_institucion: nuevoNombreInstitucion.trim(),
              contacto_persona: nuevoContacto.trim() || null,
              telefono: nuevoTelefono.trim() || null,
              nit: nuevoNit.trim() || null,
              direccion: nuevaDireccion.trim() || null,
            }
          : undefined,
        colaborador_id: user?.id || null,
        canal_origen: 'web',
        items: items.map((it) => ({
          mercaderia_id: it.mercaderia_id,
          cantidad: it.cantidad,
          precio_aplicado: it.precio_aplicado,
        })),
      });

      showToast('Cotización registrada exitosamente.', 'success');
      // Reset
      setItems([]);
      setSelectedClienteId('');
      setIsNuevoCliente(false);
      setNuevoNombreInstitucion('');
      setNuevoContacto('');
      setNuevoTelefono('');
      setNuevoNit('');
      setNuevaDireccion('');
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
      title="Crear Nueva Cotización Manual"
      maxWidth="840px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Registra una cotización oficial en el sistema seleccionando un cliente y los insumos requeridos.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECCIÓN 1: CLIENTE */}
        <div
          style={{
            padding: '1.25rem',
            background: 'var(--bg-app)',
            borderRadius: '12px',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2C221E' }}>
              1. Datos del Cliente / Institución
            </h4>

            <button
              type="button"
              onClick={() => setIsNuevoCliente(!isNuevoCliente)}
              style={{
                background: 'none',
                border: 'none',
                color: '#C85A32',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isNuevoCliente ? '← Seleccionar cliente existente' : '+ Registrar nuevo cliente'}
            </button>
          </div>

          {!isNuevoCliente ? (
            <FormField label="Cliente Registrado">
              <AutocompleteSelect
                options={clientes.map((c) => ({
                  value: String(c.id),
                  label: c.nombre_institucion,
                  sublabel: [c.contacto_persona, c.telefono, c.nit ? `NIT: ${c.nit}` : null]
                    .filter(Boolean)
                    .join(' • '),
                }))}
                value={selectedClienteId}
                onChange={(val) => setSelectedClienteId(val)}
                placeholder="Buscar o seleccionar cliente registrado..."
                disabled={isLoadingClientes}
              />
            </FormField>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormField label="Institución / Empresa">
                <input
                  type="text"
                  className="dashboard-input"
                  value={nuevoNombreInstitucion}
                  onChange={(e) => setNuevoNombreInstitucion(e.target.value)}
                  placeholder="Ej. Escuela Oficial No. 44 o Flores de Oriente"
                  required={isNuevoCliente}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <FormField label="Persona de Contacto">
                  <input
                    type="text"
                    className="dashboard-input"
                    value={nuevoContacto}
                    onChange={(e) => setNuevoContacto(e.target.value)}
                    placeholder="Ej. Lic. Carlos Méndez"
                  />
                </FormField>

                <FormField label="Teléfono">
                  <input
                    type="text"
                    className="dashboard-input"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="Ej. +502 5555-4321"
                  />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <FormField label="NIT (Opcional)">
                  <input
                    type="text"
                    className="dashboard-input"
                    value={nuevoNit}
                    onChange={(e) => setNuevoNit(e.target.value)}
                    placeholder="Ej. 1234567-8"
                  />
                </FormField>

                <FormField label="Dirección de Entrega">
                  <input
                    type="text"
                    className="dashboard-input"
                    value={nuevaDireccion}
                    onChange={(e) => setNuevaDireccion(e.target.value)}
                    placeholder="Ej. Zona 10, Ciudad de Guatemala"
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: INSUMOS Y MERCADERÍAS */}
        <div
          style={{
            padding: '1.25rem',
            background: 'var(--bg-app)',
            borderRadius: '12px',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2C221E' }}>
              2. Insumos y Mercaderías a Cotizar
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              El precio oficial del inventario se carga automáticamente al seleccionar el insumo.
            </span>
          </div>

          {/* Grilla flexible y adaptativa para agregar productos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end',
              background: '#FFFFFF',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Campo Mercadería: Mayor ancho disponible */}
            <div style={{ minWidth: '260px' }}>
              <FormField label="Mercadería / Insumo">
                <AutocompleteSelect
                  options={mercaderias.map((m) => ({
                    value: String(m.id),
                    label: `${m.codigo_mercaderia} — ${m.nombre}`,
                    sublabel: `Stock: ${m.stock_actual} | Precio sugerido: Q. ${Number(m.precio_unitario).toFixed(2)}`,
                  }))}
                  value={selectedMercaderiaId}
                  onChange={(val) => handleSelectMercaderia(val)}
                  placeholder="Buscar por código o nombre..."
                  disabled={isLoadingMercaderias}
                />
              </FormField>
            </div>

            {/* Fila compacta de Cantidad, Precio y Botón Añadir */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(80px, 100px) minmax(110px, 130px) auto',
                gap: '0.75rem',
                alignItems: 'flex-end',
              }}
            >
              <FormField label="Cantidad">
                <input
                  type="number"
                  min="1"
                  className="dashboard-input"
                  value={itemCantidad}
                  onChange={(e) => setItemCantidad(e.target.value)}
                  style={{ textAlign: 'center' }}
                />
              </FormField>

              <FormField label="Precio Unitario (Q.)">
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      pointerEvents: 'none',
                    }}
                  >
                    Q.
                  </span>
                  <input
                    type="text"
                    readOnly
                    disabled
                    className="dashboard-input"
                    value={itemPrecio ? `Q. ${Number(itemPrecio).toFixed(2)}` : 'Q. 0.00'}
                    placeholder="Q. 0.00"
                    style={{
                      paddingLeft: '28px',
                      background: '#F9F6F0',
                      cursor: 'not-allowed',
                      fontWeight: 700,
                      color: '#2C221E',
                      borderColor: '#E6DFD5',
                    }}
                    title="Precio oficial bloqueado obtenido directamente desde el catálogo de mercaderías"
                  />
                </div>
              </FormField>

              <button
                type="button"
                className="btn-solid"
                onClick={handleAddItem}
                style={{
                  height: '42px',
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: '13.5px',
                }}
              >
                <Icons.Plus size={16} />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Tabla Limpia de Items Agregados */}
          {items.length > 0 ? (
            <div style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13.5px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <thead>
                  <tr style={{ background: '#F2ECE4', color: '#2C221E', textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Código</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Descripción del Insumo</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>Cant.</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>Precio Unitario</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>Subtotal</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-soft)',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FDFBF7',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {it.codigo_mercaderia}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#2C221E' }}>
                        {it.nombre}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                        <span style={{ background: '#F2ECE4', padding: '2px 8px', borderRadius: '4px' }}>
                          {it.cantidad}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {formatQuetzales(it.precio_aplicado)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#C85A32' }}>
                        {formatQuetzales(it.subtotal)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                          }}
                          title="Eliminar insumo de la cotización"
                        >
                          <Icons.Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px dashed var(--border-soft)',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              <span style={{ fontStyle: 'italic' }}>
                Aún no has agregado insumos a la cotización. Selecciona un producto arriba y pulsa "+ Añadir".
              </span>
            </div>
          )}
        </div>

        {/* TOTAL Y ACCIONES */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Estimado:</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#C85A32' }}>
              {formatQuetzales(totalQuetzales)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
              disabled={isSubmitting || items.length === 0}
              style={{
                padding: '10px 24px',
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
                  <span>Crear Cotización</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
