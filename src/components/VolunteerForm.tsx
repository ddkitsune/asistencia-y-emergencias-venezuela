import React, { useState, useEffect } from 'react';
import { Volunteer } from '../types';
import { Users, MapPin, Shield, CheckCircle } from 'lucide-react';

interface VolunteerFormProps {
  onSubmit: (data: Partial<Volunteer>) => Promise<void>;
  prefilledLocation?: { lat: number; lng: number; city: string; state: string } | null;
  onOpenTerms?: () => void;
}

export default function VolunteerForm({ onSubmit, prefilledLocation, onOpenTerms }: VolunteerFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [specialty, setSpecialty] = useState<'Atención Médica' | 'Distribución de Alimentos' | 'Transporte / Logística' | 'Búsqueda y Rescate' | 'Apoyo Psicológico' | 'Comunicaciones'>('Distribución de Alimentos');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(15);
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Sync with interactive map selection
  useEffect(() => {
    if (prefilledLocation) {
      if (prefilledLocation.city !== "Coordenada Manual") {
        setCity(prefilledLocation.city);
      }
      if (prefilledLocation.state !== "Estado Detectado") {
        setState(prefilledLocation.state);
      }
      setLatitude(prefilledLocation.lat);
      setLongitude(prefilledLocation.lng);
    }
  }, [prefilledLocation]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !state || !city) {
      setMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios (*).' });
      return;
    }
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Debe aceptar los Términos y Condiciones Legales para registrarse como voluntario.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onSubmit({
        name,
        contact,
        specialty,
        state,
        city,
        coverageRadiusKm: Number(coverageRadiusKm),
        latitude: Number(latitude) || 10.4806,
        longitude: Number(longitude) || -66.9036
      });

      setMessage({ type: 'success', text: '🤝 ¡Registro exitoso! Gracias por sumarse a la red nacional de apoyo. Su disponibilidad ha sido guardada.' });
      
      // Clear form
      setName('');
      setContact('');
      setCoverageRadiusKm(15);
      setLatitude('');
      setLongitude('');
      setAcceptedTerms(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al registrar voluntario.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="volunteer-form-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shadow-sm">
          <Users size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Registro de Voluntarios y Ayuda</h3>
          <p className="text-xs text-slate-500">Súmese con su conocimiento, equipo técnico, vehículo o insumos de distribución.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-5 rounded-xl text-xs flex gap-2 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <CheckCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nombre Completo / Organización *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Dr. Carlos Sanabria / Cruz Azul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Teléfono o Canal de Contacto *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. 0414-1234567 o email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Especialidad de Soporte *</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="Atención Médica">Atención Médica / Primeros Auxilios</option>
              <option value="Distribución de Alimentos">Distribución de Alimentos y Agua</option>
              <option value="Transporte / Logística">Transporte (Camiones, Motos, Vehículo rústico)</option>
              <option value="Búsqueda y Rescate">Búsqueda y Rescate de Personas</option>
              <option value="Apoyo Psicológico">Apoyo Psicológico y Contención</option>
              <option value="Comunicaciones">Comunicaciones por Radio / Satelital</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Radio de Cobertura (Kilómetros) *</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={coverageRadiusKm}
                onChange={(e) => setCoverageRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="font-mono text-blue-600 font-bold text-xs w-12 text-right shrink-0">{coverageRadiusKm} km</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4 pt-4">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-3">
            <MapPin size={14} className="text-blue-600" />
            Zona de Operación e Injerencia *
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Estado (Provincia) *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Distrito Capital o Zulia"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Ciudad o Sector Principal *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Caracas o Maracaibo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Latitud de Sede/Base (Opcional)</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="10.4806"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Longitud de Sede/Base (Opcional)</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="-66.9036"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Tip: Puedes hacer clic en un punto del mapa para capturar las coordenadas exactas de tu zona.</p>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
          <input 
            type="checkbox" 
            id="terms-volunteer" 
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms-volunteer" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            * He leído y acepto los {' '}
            <button 
              type="button" 
              onClick={onOpenTerms}
              className="text-blue-600 font-bold hover:underline"
            >
              Términos y Condiciones Legales
            </button>
            . Confirmo que asumo el riesgo de mi participación voluntaria y eximo de toda responsabilidad a la plataforma.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition mt-6 flex justify-center items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            <>
              <Shield size={14} />
              Registrarme como Voluntario
            </>
          )}
        </button>
      </form>
    </div>
  );
}
