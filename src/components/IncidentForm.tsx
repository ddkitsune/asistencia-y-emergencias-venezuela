import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import { AlertTriangle, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (data: Partial<Incident>) => Promise<void>;
  prefilledLocation?: { lat: number; lng: number; city: string; state: string } | null;
  onOpenTerms?: () => void;
}

export default function IncidentForm({ onSubmit, prefilledLocation, onOpenTerms }: IncidentFormProps) {
  const [type, setType] = useState<'Saqueo' | 'Intento de Saqueo' | 'Bloqueo de Vía' | 'Disturbio / Protesta' | 'Falla de Seguridad' | 'Otro'>('Saqueo');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [riskLevel, setRiskLevel] = useState<'Moderado' | 'Alto' | 'Crítico'>('Alto');
  
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
    if (!description || !state || !city || !address) {
      setMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios (*).' });
      return;
    }
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Debe aceptar los Términos y Condiciones Legales para reportar este incidente.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onSubmit({
        type,
        description,
        state,
        city,
        address,
        latitude: Number(latitude) || 10.4806,
        longitude: Number(longitude) || -66.9036,
        riskLevel
      });

      setMessage({ type: 'success', text: '⚠️ Incidente de seguridad reportado en tiempo real. Se ha emitido una alerta push urgente a todas las cuadrillas de ayuda.' });
      
      // Clear form
      setDescription('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setAcceptedTerms(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al reportar incidente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="incident-form-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shadow-sm">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Reportar Saqueo o Incidente de Seguridad</h3>
          <p className="text-xs text-slate-500">Reporte disturbios, bloqueos o saqueos para advertir a la comunidad y coordinar rutas seguras.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-5 rounded-xl text-xs flex gap-2 border ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Tipo de Incidente *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="Saqueo">Saqueo en Curso</option>
              <option value="Intento de Saqueo">Intento de Saqueo / Foco de Tensión</option>
              <option value="Bloqueo de Vía">Bloqueo de Vía / Protesta Violenta</option>
              <option value="Disturbio / Protesta">Disturbio / Enfrentamiento</option>
              <option value="Falla de Seguridad">Falla de Seguridad / Presencia de bandas</option>
              <option value="Otro">Otro Incidente Grave</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Nivel de Riesgo *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Moderado', 'Alto', 'Crítico'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskLevel(level)}
                  className={`py-2 px-1 rounded-lg border font-bold text-center transition cursor-pointer ${
                    riskLevel === level
                      ? level === 'Crítico'
                        ? 'bg-red-600 border-red-700 text-white shadow-sm'
                        : level === 'Alto'
                        ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                        : 'bg-slate-700 border-slate-800 text-white shadow-sm'
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
          <label className="block text-slate-700 font-semibold mb-1.5">Descripción Detallada del Suceso *</label>
          <textarea 
            required
            rows={3}
            placeholder="Describa qué sucede, cantidad aproximada de personas, si hay detonaciones o presencia de armas, y qué establecimientos corren peligro..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
          />
        </div>

        <div className="border-t border-slate-100 my-4 pt-4">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-3">
            <MapPin size={14} className="text-blue-600" />
            Ubicación Exacta del Incidente *
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Estado (Provincia) *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Zulia, Carabobo, Caracas"
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
                placeholder="Ej. Maracaibo, Valencia"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Latitud del Incidente</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="10.6689"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Longitud del Incidente</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="-71.6441"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-slate-600 font-semibold mb-1.5">Calle / Av / Referencia de Dirección *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Sector Belloso, Av 12 con calle 85, frente al supermercado"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4">
          <input 
            type="checkbox" 
            id="terms-incident" 
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms-incident" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            * He leído y acepto los {' '}
            <button 
              type="button" 
              onClick={onOpenTerms}
              className="text-blue-600 font-bold hover:underline"
            >
              Términos y Condiciones Legales
            </button>
            . Confirmo que este reporte es veraz y eximo de responsabilidad a la plataforma sobre las acciones derivadas.
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
              <AlertTriangle size={14} />
              Transmitir Alerta de Seguridad Pública
            </>
          )}
        </button>
      </form>
    </div>
  );
}
