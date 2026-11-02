import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import logoUMG from '../../assets/UMG-LOGO.svg';
import type { AgendaItem } from '../../data/agendaData';

interface AttendanceQRProps {
  workshop: AgendaItem;
  link: string;
}

export interface AttendanceQRHandle {
  getCardRef: () => HTMLDivElement | null;
}

const AttendanceQR = forwardRef<AttendanceQRHandle, AttendanceQRProps>(({ workshop, link }, ref) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useImperativeHandle(ref, () => ({
    getCardRef: () => cardRef.current
  }));

  useEffect(() => {
    // Inicializar el estilizado del QR
    qrRef.current = new QRCodeStyling({
      width: 240,
      height: 240,
      type: 'svg',
      data: link,
      image: logoUMG,
      dotsOptions: {
        color: "#1a365d",
        type: "dots" // Puntos circulares en lugar de cuadrados
      },
      backgroundOptions: {
        color: "transparent",
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5
      },
      cornersSquareOptions: {
        color: "#1a365d",
        type: "extra-rounded" // Esquinas muy redondeadas
      },
      cornersDotOptions: {
        color: "#1a365d",
        type: "dot" // Puntos internos redondeados
      },
      qrOptions: {
        errorCorrectionLevel: 'H'
      }
    });

    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = ""; // Limpiar antes de renderizar
      qrRef.current.append(qrContainerRef.current);
    }
  }, [link]);

  return (
    <div className="qr-premium-container">
      <div className="qr-card" ref={cardRef}>
        {/* Header con el logo principal */}
        <div className="qr-header">
          <img src={logoUMG} alt="UMG Logo" className="qr-main-logo" />
          <div className="qr-header-text">
            <h4>FLORES DEL CAMPO</h4>
            <span>SISTEMAS UMG</span>
          </div>
        </div>

        {/* El código QR con el logo en el centro */}
        <div className="qr-code-wrapper">
          <div ref={qrContainerRef} className="qr-canvas-container"></div>
        </div>

        {/* Información del taller en la parte inferior */}
        <div className="qr-info-footer">
          <h3 className="qr-workshop-title">{workshop.title}</h3>

          <div className="qr-details-grid">
            <div className="qr-detail-item">
              <span className="qr-label">HORARIO</span>
              <span className="qr-value">{workshop.time} - {workshop.endTime}</span>
            </div>
            <div className="qr-detail-item">
              <span className="qr-label">SALA</span>
              <span className="qr-value">{workshop.room}</span>
            </div>
          </div>

          <div className="qr-speaker-box">
            <span className="qr-label">PONENTE</span>
            <span className="qr-value">{workshop.speaker?.name || ''}</span>
          </div>
        </div>

        {/* Decoración lateral para el estilo "Ticket" */}
        <div className="qr-ticket-cut left"></div>
        <div className="qr-ticket-cut right"></div>
      </div>

      <style>{`
        .qr-premium-container {
          padding: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
        }

        .qr-card {
          width: 340px;
          background: white;
          border-radius: 28px;
          box-shadow: 0 20px 50px rgba(26, 54, 93, 0.15);
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .qr-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          background: #f8fafc;
          border-bottom: 2px dashed #e2e8f0;
          flex-shrink: 0;
        }

        .qr-main-logo {
          width: 35px;
          height: 35px;
        }

        .qr-header-text h4 {
          margin: 0;
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 800;
          font-size: 14px;
          color: #1a365d;
          letter-spacing: 0.5px;
        }

        .qr-header-text span {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .qr-code-wrapper {
          padding: 25px;
          display: flex;
          justify-content: center;
          background: white;
          flex-shrink: 0;
        }

        .qr-canvas-container svg {
          max-width: 100%;
          height: auto;
        }

        .qr-info-footer {
          padding: 24px;
          background: #1a365d;
          color: white;
          text-align: center;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .qr-workshop-title {
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 800;
          font-size: 20px;
          margin: 0 0 16px 0;
          line-height: 1.2;
          color: #ffffff !important;
          word-wrap: break-word;
        }

        .qr-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .qr-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .qr-label {
          font-size: 9px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .qr-value {
          font-size: 12px;
          font-weight: 600;
        }

        .qr-speaker-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 12px;
        }

        .qr-speaker-box .qr-value {
          font-size: 14px;
          color: #93c5fd;
        }

        .qr-ticket-cut {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          top: 75px;
          z-index: 2;
        }

        .qr-ticket-cut.left { left: -10px; }
        .qr-ticket-cut.right { right: -10px; }
      `}</style>
    </div>
  );
});

export default AttendanceQR;

