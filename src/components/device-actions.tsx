'use client';

import { useEffect, useRef, useState } from 'react';
import { requestCameraPermission } from '../lib/device/camera';
import { getCurrentLocation, type GeoLocationResult } from '../lib/device/geolocation';
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendLocalNotification,
} from '../lib/notifications/client';

type NotifState = NotificationPermission | 'unsupported';

const NOTIF_LABEL: Record<NotifState, string> = {
  default: 'Avisos sin activar',
  granted: 'Avisos activados',
  denied: 'Avisos bloqueados por el navegador',
  unsupported: 'Este navegador no soporta avisos',
};

const buttonStyle = {
  padding: '8px 16px',
  color: 'white',
  borderRadius: '4px',
} as const;

export default function DeviceActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoMsg, setPhotoMsg] = useState('');
  const [location, setLocation] = useState<GeoLocationResult | null>(null);
  const [locationMsg, setLocationMsg] = useState('');
  const [notifState, setNotifState] = useState<NotifState>('default');
  const [notice, setNotice] = useState('');

  // Solo LEE el estado actual; nunca pide permiso al cargar la página.
  useEffect(() => {
    setNotifState(isNotificationSupported() ? Notification.permission : 'unsupported');
  }, []);

  // El permiso se pide únicamente cuando la persona toca el botón.
  const handleAttachPhoto = async () => {
    const cameraOk = await requestCameraPermission();
    setPhotoMsg(
      cameraOk
        ? ''
        : 'Cámara no disponible o permiso denegado: elige una imagen de tus archivos.',
    );
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoMsg(`Evidencia lista: ${file.name}`);
  };

  const handleGetLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setLocation(loc);
      setLocationMsg('');
    } else {
      setLocation(null);
      setLocationMsg('No se pudo obtener la ubicación (permiso denegado o sin señal). Puedes continuar sin ella.');
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifState(isNotificationSupported() ? result : 'unsupported');
    setNotice('');
  };

  // Simula que una inspección cambió de estado (datos sintéticos).
  const handleSimulateChange = async () => {
    const title = 'Inspección INS-001 actualizada';
    const body = 'El estado cambió de "En revisión" a "Completada".';
    const shown = await sendLocalNotification({ title, body });
    setNotice(
      shown
        ? 'Aviso enviado al sistema.'
        : `Aviso en la app: ${title}. ${body} (activa los avisos para recibirlo como notificación).`,
    );
  };

  return (
    <section
      aria-labelledby="device-actions-title"
      style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
    >
      <h3 id="device-actions-title" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
        Herramientas de Inspección
      </h3>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleAttachPhoto} style={{ ...buttonStyle, background: '#3b82f6' }}>
          📷 Adjuntar Foto
        </button>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          aria-label="Seleccionar imagen de evidencia"
          style={{ display: 'none' }}
        />

        <button type="button" onClick={handleGetLocation} style={{ ...buttonStyle, background: '#10b981' }}>
          📍 Registrar Ubicación
        </button>

        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={notifState === 'granted' || notifState === 'unsupported'}
          style={{ ...buttonStyle, background: '#f59e0b' }}
        >
          🔔 Activar Avisos
        </button>

        <button type="button" onClick={handleSimulateChange} style={{ ...buttonStyle, background: '#6366f1' }}>
          🔄 Simular Cambio de Estado
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        style={{ marginTop: '10px', fontSize: '0.875rem', color: '#4b5563' }}
      >
        <p>{NOTIF_LABEL[notifState]}</p>
        {photoMsg && <p>{photoMsg}</p>}
        {location && (
          <p>
            Ubicación: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        )}
        {locationMsg && <p>{locationMsg}</p>}
        {notice && <p>{notice}</p>}
      </div>
    </section>
  );
}