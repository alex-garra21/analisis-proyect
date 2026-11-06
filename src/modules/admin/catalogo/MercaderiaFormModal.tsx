import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import AutocompleteSelect from '../../../components/ui/AutocompleteSelect';
import {
  useCategorias,
  useUnidadesMedida,
  useCreateMercaderia,
  useUpdateMercaderiaGeneral,
} from '../../../api/hooks/useComercial';
import { checkCodigoMercaderiaExists } from '../../../api/supabase/comercialMutations';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';
import type { Mercaderia } from '../../../types/database';

interface MercaderiaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mercaderiaToEdit?: Mercaderia | null;
}

/**
 * Función auxiliar para normalizar texto:
 * Remueve tildes, diacríticos y caracteres no alfanuméricos
 */
function cleanProductName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

/**
 * Genera un número aleatorio de 3 dígitos (100 a 999)
 */
function generateRandomDigits(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

export default function MercaderiaFormModal({
  isOpen,
  onClose,
  mercaderiaToEdit,
}: MercaderiaFormModalProps) {
  const isEditing = Boolean(mercaderiaToEdit);
  const { data: categorias = [], isLoading: isLoadingCategorias } = useCategorias();
  const { data: unidades = [], isLoading: isLoadingUnidades } = useUnidadesMedida();
  const createMercaderiaMutation = useCreateMercaderia();
  const updateMercaderiaMutation = useUpdateMercaderiaGeneral();

  // Estados del Formulario
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [isNuevaCategoria, setIsNuevaCategoria] = useState(false);
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [unidadId, setUnidadId] = useState<string>('');
  const [precioUnitario, setPrecioUnitario] = useState<string>('');
  const [stockActual, setStockActual] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Semilla fija de 3 dígitos por sesión para estabilidad visual
  const randomPrefixRef = useRef<string>(generateRandomDigits());

  // Reset y precarga del modal al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      if (mercaderiaToEdit) {
        // MODO EDICIÓN: Precargar datos existentes (solo generales)
        setCodigo(mercaderiaToEdit.codigo_mercaderia || '');
        setNombre(mercaderiaToEdit.nombre || '');
        setIsNuevaCategoria(false);
        setCategoriaId(mercaderiaToEdit.categoria_id ? String(mercaderiaToEdit.categoria_id) : '');
        setNuevaCategoria('');

        // Deducir unidad de medida desde el código si aplica
        const parts = mercaderiaToEdit.codigo_mercaderia ? mercaderiaToEdit.codigo_mercaderia.split('-') : [];
        const abbrev = parts.length >= 3 ? parts[parts.length - 1] : '';
        const matchingUnit = unidades.find(
          (u) =>
            (u.abreviatura && u.abreviatura.toUpperCase() === abbrev.toUpperCase()) ||
            u.nombre.toUpperCase() === abbrev.toUpperCase()
        );
        if (matchingUnit) {
          setUnidadId(String(matchingUnit.id));
        } else if (unidades.length > 0) {
          setUnidadId(String(unidades[0].id));
        } else {
          setUnidadId('');
        }
      } else {
        // MODO CREACIÓN
        randomPrefixRef.current = generateRandomDigits();
        setCodigo('');
        setNombre('');
        setIsNuevaCategoria(false);
        setCategoriaId('');
        setNuevaCategoria('');
        if (unidades.length > 0) {
          const defaultUnd =
            unidades.find(
              (u) => u.abreviatura === 'UND' || u.nombre.toLowerCase() === 'unidad'
            ) || unidades[0];
          setUnidadId(String(defaultUnd.id));
        } else {
          setUnidadId('');
        }
        setPrecioUnitario('');
        setStockActual('0');
      }
    }
  }, [isOpen, mercaderiaToEdit, unidades]);

  // Autogeneración reactiva del código de mercadería SOLO al crear
  useEffect(() => {
    if (isEditing) return; // En edición no mutamos el código base automáticamente

    const cleanLetters = cleanProductName(nombre).slice(0, 4);

    let unitAbbr = 'UND';
    const selectedUnit = unidades.find((u) => String(u.id) === String(unidadId));
    if (selectedUnit) {
      unitAbbr = (selectedUnit.abreviatura || selectedUnit.nombre || 'UND')
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, 'X');
    }

    if (cleanLetters.length > 0) {
      const paddedProduct = cleanLetters.padEnd(4, 'X');
      setCodigo(`${randomPrefixRef.current}-${paddedProduct}-${unitAbbr}`);
    } else {
      setCodigo('');
    }
  }, [nombre, unidadId, unidades, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      showToast('Ingresa el nombre del producto o insumo.', 'warning');
      return;
    }

    if (isNuevaCategoria && !nuevaCategoria.trim()) {
      showToast('Ingresa el nombre de la nueva categoría.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && mercaderiaToEdit) {
        // CASO EDICIÓN: Datos generales del modal (nombre, categoría, y actualización del código según la unidad de medida si cambió)
        let finalCodigo = codigo;
        const selectedUnit = unidades.find((u) => String(u.id) === String(unidadId));
        if (selectedUnit && codigo) {
          const unitAbbr = (selectedUnit.abreviatura || selectedUnit.nombre || 'UND')
            .toUpperCase()
            .slice(0, 3)
            .padEnd(3, 'X');
          const parts = codigo.split('-');
          if (parts.length >= 3) {
            parts[parts.length - 1] = unitAbbr;
            finalCodigo = parts.join('-');
          }
        }

        await updateMercaderiaMutation.mutateAsync({
          id: mercaderiaToEdit.id,
          nombre: nombre.trim(),
          categoria_id: !isNuevaCategoria && categoriaId ? Number(categoriaId) : null,
          nueva_categoria: isNuevaCategoria ? nuevaCategoria.trim() : undefined,
          codigo_mercaderia: finalCodigo || undefined,
          unidad_medida_id: unidadId ? Number(unidadId) : null,
        });

        showToast(`Mercadería "${nombre.trim()}" actualizada exitosamente.`, 'success');
        onClose();
      } else {
        // CASO CREACIÓN
        const precio = parseFloat(precioUnitario);
        if (isNaN(precio) || precio < 0) {
          showToast('Ingresa un precio unitario válido.', 'warning');
          setIsSubmitting(false);
          return;
        }

        const stock = parseInt(stockActual, 10);
        if (isNaN(stock) || stock < 0) {
          showToast('Ingresa un stock inicial válido (0 o mayor).', 'warning');
          setIsSubmitting(false);
          return;
        }

        // 1. Obtener partes base para el código
        const cleanLetters = cleanProductName(nombre).slice(0, 4).padEnd(4, 'X');
        let unitAbbr = 'UND';
        const selectedUnit = unidades.find((u) => String(u.id) === String(unidadId));
        if (selectedUnit) {
          unitAbbr = (selectedUnit.abreviatura || selectedUnit.nombre || 'UND')
            .toUpperCase()
            .slice(0, 3)
            .padEnd(3, 'X');
        }

        // 2. Validación de unicidad con reintento automático
        let finalCodigo = codigo;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 15;

        while (!isUnique && attempts < maxAttempts) {
          if (!finalCodigo) {
            const newRandom = generateRandomDigits();
            finalCodigo = `${newRandom}-${cleanLetters}-${unitAbbr}`;
          }

          const exists = await checkCodigoMercaderiaExists(finalCodigo);
          if (!exists) {
            isUnique = true;
          } else {
            const nextRandom = generateRandomDigits();
            finalCodigo = `${nextRandom}-${cleanLetters}-${unitAbbr}`;
            attempts++;
          }
        }

        if (!isUnique) {
          showToast('No se pudo generar un código único automáticamente. Intenta de nuevo.', 'error');
          setIsSubmitting(false);
          return;
        }

        setCodigo(finalCodigo);

        // 3. Inserción en la base de datos
        await createMercaderiaMutation.mutateAsync({
          codigo_mercaderia: finalCodigo,
          nombre: nombre.trim(),
          categoria_id: !isNuevaCategoria && categoriaId ? Number(categoriaId) : null,
          nueva_categoria: isNuevaCategoria ? nuevaCategoria.trim() : undefined,
          precio_unitario: precio,
          stock_actual: stock,
          unidad_medida_id: unidadId ? Number(unidadId) : null,
        });

        showToast(`Producto registrado exitosamente con código ${finalCodigo}.`, 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Mercadería (Datos Generales)' : 'Registrar Nueva Mercadería'}
      maxWidth="580px"
      padding="2rem 2.25rem"
    >
      <p style={{ margin: '0 0 1.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {isEditing
          ? 'Actualiza los datos informativos del producto. La modificación de precios y existencias se gestiona exclusivamente desde Inventario.'
          : 'Ingresa los datos para registrar un nuevo producto en el catálogo oficial. El código se autogenerará dinámicamente con validación de unicidad.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* FILA 1: Código de Mercadería (Ancho Completo, readOnly) */}
        <FormField label={isEditing ? 'Código Oficial de Mercadería' : 'Código de Mercadería (Autogenerado dinámicamente)'}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="dashboard-input"
              value={codigo || (isEditing ? '—' : 'Autogenerando al ingresar nombre y unidad...')}
              readOnly
              disabled
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 700,
                letterSpacing: '1px',
                background: '#F9F6F0',
                borderColor: '#E6DFD5',
                color: codigo ? '#C85A32' : 'var(--text-muted)',
                cursor: 'not-allowed',
                paddingLeft: '38px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: codigo ? '#C85A32' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icons.Shield size={16} />
            </div>
          </div>
        </FormField>

        {/* FILA 2: Dos columnas simétricas (Categoría y Unidad de Medida) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
          {/* Columna Izquierda: Selector de Categoría */}
          <div>
            <FormField label="Categoría">
              {!isNuevaCategoria ? (
                <AutocompleteSelect
                  options={categorias.map((cat) => ({
                    value: String(cat.id),
                    label: cat.nombre,
                    sublabel: cat.descripcion || undefined,
                  }))}
                  value={categoriaId}
                  onChange={(val) => setCategoriaId(val)}
                  placeholder="Buscar o seleccionar categoría..."
                  disabled={isLoadingCategorias}
                />
              ) : (
                <input
                  type="text"
                  className="dashboard-input"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Ej. Flores Exóticas"
                  required={isNuevaCategoria}
                  autoFocus
                />
              )}
            </FormField>

            <button
              type="button"
              onClick={() => {
                setIsNuevaCategoria(!isNuevaCategoria);
                if (!isNuevaCategoria) {
                  setCategoriaId('');
                } else {
                  setNuevaCategoria('');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#C85A32',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '6px',
                padding: 0,
                display: 'inline-block',
              }}
            >
              {isNuevaCategoria ? '← Seleccionar categoría existente' : '+ Agregar nueva categoría'}
            </button>
          </div>

          {/* Columna Derecha: Selector de Unidad de Medida */}
          <div>
            <FormField label="Unidad de Medida">
              <AutocompleteSelect
                options={unidades.map((und) => ({
                  value: String(und.id),
                  label: `${und.nombre} (${und.abreviatura || 'UND'})`,
                  sublabel: und.abreviatura ? `Abrev: ${und.abreviatura}` : undefined,
                }))}
                value={unidadId}
                onChange={(val) => setUnidadId(val)}
                placeholder="Seleccionar unidad..."
                disabled={isLoadingUnidades}
              />
            </FormField>
          </div>
        </div>

        {/* FILA 3: Nombre del Producto / Insumo (Ancho Completo) */}
        <FormField label="Nombre del Producto / Insumo">
          <input
            type="text"
            className="dashboard-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Cuadernos de cuadros pequeños, pasta simple..."
            required
          />
        </FormField>

        {/* FILA 4: Solo visible en MODO CREACIÓN (Precio Unitario y Stock Inicial) */}
        {!isEditing && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <FormField label="Precio Unitario (Q.)">
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                  }}
                >
                  Q.
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="dashboard-input"
                  style={{ paddingLeft: '32px' }}
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </FormField>

            <FormField label="Stock Inicial">
              <input
                type="number"
                min="0"
                className="dashboard-input"
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
                placeholder="0"
                required
              />
            </FormField>
          </div>
        )}

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
            onClick={onClose}
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
                <span>Guardando cambios...</span>
              </>
            ) : isEditing ? (
              <>
                <Icons.Save size={16} />
                <span>Guardar Cambios</span>
              </>
            ) : (
              <>
                <Icons.Plus size={16} />
                <span>Registrar Producto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
