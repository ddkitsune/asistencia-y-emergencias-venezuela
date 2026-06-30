import React from 'react';
import { X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Términos y Condiciones Legales</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Plataforma Civil Integrada Venezuela</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-5">
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 flex gap-3 text-xs mb-6">
            <ShieldAlert size={24} className="shrink-0 text-amber-600" />
            <p>
              <strong>AVISO LEGAL IMPORTANTE:</strong> Al utilizar esta plataforma, usted reconoce y acepta que se trata de una iniciativa ciudadana independiente. Los desarrolladores, administradores y operadores de "Asistencia VZLA" no asumen responsabilidad legal, civil o penal por el uso de esta herramienta.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              1. Veracidad y Exactitud de la Información
            </h3>
            <p>
              Toda la información contenida en esta plataforma (alertas, reportes de emergencia, solicitudes de insumos y focos de incidentes) es generada directamente por los usuarios (crowdsourcing). 
              La plataforma <strong>no verifica de manera independiente</strong> la veracidad, exactitud o vigencia de los reportes. Los usuarios deben ejercer su propio juicio y precaución antes de actuar basados en la información aquí expuesta.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              2. Exención de Responsabilidad sobre Seguridad Física
            </h3>
            <p>
              La participación como voluntario, donante o rescatista a través de esta plataforma es estrictamente voluntaria y bajo su propio riesgo. 
              La plataforma <strong>no garantiza la seguridad física</strong> de los participantes en ninguna ubicación geográfica compartida. Exoneramos expresamente a los creadores de esta aplicación de cualquier daño, perjuicio, lesión o pérdida sufrida durante cualquier actividad coordinada a través de este medio.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              3. Privacidad y Exposición de Datos Sensibles
            </h3>
            <p>
              Para facilitar la asistencia logística y de emergencia, los datos proporcionados como números de contacto, nombres y coordenadas geográficas serán almacenados y podrán ser visibles para otros actores del sistema.
              Al enviar un formulario, usted <strong>autoriza el procesamiento de estos datos</strong> sabiendo que en contextos de crisis la confidencialidad absoluta no puede ser garantizada. No comparta información que considere que pueda poner en riesgo su integridad o la de terceros si es interceptada.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              4. Uso No Indebido y Prohibiciones
            </h3>
            <p>
              Queda terminantemente prohibido utilizar esta plataforma para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
              <li>Generar reportes falsos que desvíen recursos valiosos.</li>
              <li>Incitar al odio, la violencia o la discriminación.</li>
              <li>Compilar o extraer datos de usuarios para fines comerciales, de vigilancia o acoso.</li>
            </ul>
            <p className="mt-2 text-xs">
              Los administradores se reservan el derecho de eliminar alertas, reportes o cuentas que violen estas directrices, sin previo aviso.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm shadow-sm cursor-pointer"
          >
            <CheckCircle2 size={18} />
            He leído y comprendido
          </button>
        </div>

      </div>
    </div>
  );
}
