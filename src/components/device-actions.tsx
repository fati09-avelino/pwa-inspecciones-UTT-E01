'use client';

import { useState, useRef } from 'react';
import { requestCameraPermission } from '../lib/device/camera';
import { getCurrentLocation, type GeoLocationResult } from '../lib/device/geolocation';

export default function DeviceActions() {
  const [location, setLocation] = useState<GeoLocationResult | null>(null);
  const [photoMsg, setPhotoMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachPhoto = async () => {
    await requestCameraPermission();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoMsg(`Evidencia lista: ${e.target.files[0].name}`);
    }
  };

  const handleGetLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setLocation(loc);
    } else {
      alert('No se pudo obtener la ubicación (permiso denegado o error).');
    }
  };

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Herramientas de Inspección</h3>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleAttachPhoto} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '4px' }}>
          📷 Adjuntar Foto
        </button>
        
        <input 
          type="file" accept="image/*" capture="environment" 
          ref={fileInputRef} onChange={handlePhotoChange}
          style={{ display: 'none' }} 
        />

        <button onClick={handleGetLocation} style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: '4px' }}>
          📍 Registrar Ubicación
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#4b5563' }}>
        {photoMsg && <p>✅ {photoMsg}</p>}
        {location && (
          <p>✅ Ubicación: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
        )}
      </div>
    </div>
  );
}
