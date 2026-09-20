export interface Inspection {
  id: string;
  laboratory: string;
  status: 'Pendiente' | 'Completada' | 'En revisión';
  statusLabel: string;
  date: string;
  inspector: string;
  notes: string;
  location: string;
  summary: string;
  findings: string; // <--- Añadir esta propiedad
}

export const inspections: Inspection[] = [
  {
    id: 'INS-001',
    laboratory: 'Laboratorio de Redes y Ciberseguridad',
    status: 'Pendiente',
    statusLabel: 'Pendiente',
    date: '2026-09-20',
    inspector: 'Fátima',
    notes: 'Revisión de puertos de red y parches de seguridad pendientes.',
    location: 'Edificio A, Planta Baja',
    summary: 'Revisión general de seguridad de red',
    findings: 'Se detectaron dos puertos abiertos sin protección firewall.' // <--- Añadir valor
  },
  {
    id: 'INS-002',
    laboratory: 'Laboratorio de Sistemas Embebidos e IoT',
    status: 'Completada',
    statusLabel: 'Completada',
    date: '2026-09-18',
    inspector: 'Janeth',
    notes: 'Sensores ESP32 verificados y funcionando correctamente.',
    location: 'Edificio B, Primer Piso',
    summary: 'Verificación de nodos IoT',
    findings: 'Todos los sensores responden correctamente a la red central.' // <--- Añadir valor
  },
  {
    id: 'INS-003',
    laboratory: 'Laboratorio de Desarrollo de Software',
    status: 'En revisión',
    statusLabel: 'En revisión',
    date: '2026-09-19',
    inspector: 'Ulises',
    notes: 'Actualización de contenedores Docker en nodos del swarm.',
    location: 'Edificio C, Segundo Piso',
    summary: 'Mantenimiento de clúster Docker Swarm',
    findings: 'Se requiere reiniciar un nodo esclavo por latencia en el routing mesh.' // <--- Añadir valor
  }
];