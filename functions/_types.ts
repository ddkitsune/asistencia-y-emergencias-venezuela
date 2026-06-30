export interface Emergency {
  id: string;
  name: string;
  contact: string;
  category: 'Alimentos' | 'Medicamentos' | 'Emergencia Médica' | 'Servicios Públicos' | 'Inundación / Desastre' | 'Otro';
  description: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  urgency: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  status: 'Pendiente' | 'En Proceso' | 'Resuelto';
  createdAt: string;
  allocatedResources: { resourceId: string; quantity: number }[];
}

export interface Volunteer {
  id: string;
  name: string;
  contact: string;
  specialty: 'Atención Médica' | 'Distribución de Alimentos' | 'Transporte / Logística' | 'Búsqueda y Rescate' | 'Apoyo Psicológico' | 'Comunicaciones';
  state: string;
  city: string;
  coverageRadiusKm: number;
  latitude: number;
  longitude: number;
  status: 'Disponible' | 'Asignado' | 'No Disponible';
  createdAt: string;
}

export interface Incident {
  id: string;
  type: 'Saqueo' | 'Intento de Saqueo' | 'Bloqueo de Vía' | 'Disturbio / Protesta' | 'Falla de Seguridad' | 'Otro';
  description: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  riskLevel: 'Moderado' | 'Alto' | 'Crítico';
  isVerified: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  category: 'Alimentos' | 'Médico' | 'Herramientas' | 'Energía / Comunicaciones';
  quantity: number;
  allocated: number;
  unit: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Alerta Crítica' | 'Coordinación' | 'Suministro' | 'Seguridad';
  createdAt: string;
  targetArea?: string;
  isRead?: boolean;
}

export interface SocialComment {
  id: string;
  author: string;
  contact?: string;
  text: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  contact: string;
  type: 'Ofrecimiento' | 'Solicitud' | 'Alerta';
  category: string;
  title: string;
  description: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  likesCount: number;
  likedBy: string[];
  isVerified: boolean;
  verificationsCount: number;
  createdAt: string;
  comments: SocialComment[];
}


