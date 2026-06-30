import React, { useState, useEffect } from 'react';
import { Emergency } from '../types';
import { HeartHandshake, MapPin, Compass, AlertCircle, Sparkles } from 'lucide-react';

interface EmergencyFormProps {
  onSubmit: (data: Partial<Emergency>) => Promise<void>;
  prefilledLocation?: { lat: number; lng: number; city: string; state: string } | null;
  onOpenTerms?: () => void;
}

export default function EmergencyForm({ onSubmit, prefilledLocation, onOpenTerms }: EmergencyFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState<'Alimentos' | 'Medicamentos' | 'Emergencia Médica' | 'Servicios Públicos' | 'Inundación / Desastre' | 'Otro'>('Medicamentos');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [urgency, setUrgency] = useState<'Baja' | 'Media' | 'Alta' | 'Crítica'>('Alta');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
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

  // HTML5 Geolocation detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'La geolocalización no está soportada por su navegador.' });
      return;
    }

    setIsDetecting(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(5)));
        setIsDetecting(false);
        // Prompt user to fill state/city since browser only returns coords
        setMessage({ 
          type: 'success', 
          text: `Coordenadas detectadas con precisión: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}. Por favor, complete el Estado y Ciudad.` 
        });
      },
      (error) => {
        setIsDetecting(false);
        let errorMsg = 'No se pudo obtener su ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permiso denegado por el usuario para acceder a la geolocalización.';
        }
        setMessage({ type: 'error', text: `${errorMsg} Se colocaron coordenadas predeterminadas de Caracas.` });
        // Set Caracas defaults
        setLatitude(10.4806);
        setLongitude(-66.9036);
        setCity('Caracas');
        setState('Distrito Capital');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !description || !state || !city || !address) {
      setMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios (*).' });
      return;
    }
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Debe aceptar los Términos y Condiciones Legales para enviar este reporte.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onSubmit({
        name,
        contact,
        category,
        description,
        state,
        city,
        address,
        latitude: Number(latitude) || 10.4806,
        longitude: Number(longitude) || -66.9036,
        urgency
      });

      setMessage({ type: 'success', text: '🚨 Su reporte ha sido registrado de manera transparente en el sistema. Los voluntarios y centros logísticos han sido notificados.' });
      
      // Clear form
      setName('');
      setContact('');
      setDescription('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setAcceptedTerms(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al registrar solicitud.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="emergency-form-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shadow-sm">
          <HeartHandshake size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Solicitud de Asistencia de Emergencia</h3>
          <p className="text-xs text-slate-500">Si usted o su comunidad necesitan medicamentos, agua, alimentos o ayuda médica crítica.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-5 rounded-xl text-xs flex gap-2 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nombre de Contacto / Comunidad *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Dora Mendoza / Familia Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Número de Teléfono de Contacto *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. 0412-5553214"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Categoría de Asistencia *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="Medicamentos">Medicamentos y Fármacos</option>
              <option value="Alimentos">Alimentos y Gas de Cocina</option>
              <option value="Emergencia Médica">Emergencia Médica de Traslado</option>
              <option value="Inundación / Desastre">Inundación / Búsqueda y Rescate</option>
              <option value="Servicios Públicos">Servicios Públicos Críticos (Agua, Energía)</option>
              <option value="Otro">Otro Apoyo Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nivel de Urgencia *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Baja', 'Media', 'Alta', 'Crítica'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`py-2 px-1 rounded-lg border font-bold text-center transition cursor-pointer ${
                    urgency === level
                      ? level === 'Crítica'
                        ? 'bg-red-600 border-red-700 text-white shadow-sm'
                        : level === 'Alta'
                        ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                        : level === 'Media'
                        ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                        : 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">Descripción de la Crisis / Necesidad *</label>
          <textarea 
            required
            rows={3}
            placeholder="Describa de forma precisa la situación de salud, falta de recursos o riesgo vital..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
          />
        </div>

        <div className="border-t border-slate-100 my-4 pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-600" />
              Geolocalización del Suceso *
            </span>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl transition disabled:opacity-50 font-bold cursor-pointer"
            >
              <Compass size={13} className={isDetecting ? 'animate-spin' : ''} />
              {isDetecting ? 'Detectando GPS...' : 'Detectar mi Posición'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <label className="block text-slate-600 font-semibold mb-1.5">Ciudad / Localidad *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Caracas o Maracaibo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Latitud</label>
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
                <label className="block text-slate-600 font-semibold mb-1.5">Longitud</label>
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
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Dirección Detallada / Puntos de Referencia *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Av. Universidad, frente a la panadería, portón azul"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
          <input 
            type="checkbox" 
            id="terms-emergency" 
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms-emergency" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            * He leído y acepto los {' '}
            <button 
              type="button" 
              onClick={onOpenTerms}
              className="text-blue-600 font-bold hover:underline"
            >
              Términos y Condiciones Legales
            </button>
            . Confirmo que la información suministrada es veraz y eximo de responsabilidad a la plataforma sobre la acción tomada a partir de este reporte.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 transition mt-6 flex justify-center items-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          ) : (
            <>
              <Sparkles size={14} />
              Enviar Solicitud de Emergencia
            </>
          )}
        </button>
      </form>
    </div>
  );
}
