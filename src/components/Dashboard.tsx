import React, { useState } from 'react';
import { Emergency, Volunteer, Incident, Resource } from '../types';
import { jsPDF } from 'jspdf';
import { 
  FileDown, 
  Settings, 
  Truck, 
  Users, 
  Activity, 
  AlertTriangle, 
  Check, 
  Loader2, 
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Clock
} from 'lucide-react';

interface DashboardProps {
  emergencies: Emergency[];
  volunteers: Volunteer[];
  incidents: Incident[];
  resources: Resource[];
  onUpdateEmergencyStatus: (id: string, status: 'Pendiente' | 'En Proceso' | 'Resuelto') => Promise<void>;
  onAllocateResources: (emergencyId: string, allocations: { resourceId: string; quantity: number }[]) => Promise<void>;
  onRefreshData: () => void;
}

export default function Dashboard({
  emergencies,
  volunteers,
  incidents,
  resources,
  onUpdateEmergencyStatus,
  onAllocateResources,
  onRefreshData
}: DashboardProps) {
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [allocationQuantities, setAllocationQuantities] = useState<Record<string, number>>({});
  const [isAllocating, setIsAllocating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Stats calculation
  const totalEmergencies = emergencies.length;
  const pendingEmergencies = emergencies.filter(e => e.status === 'Pendiente').length;
  const ongoingEmergencies = emergencies.filter(e => e.status === 'En Proceso').length;
  const resolvedEmergencies = emergencies.filter(e => e.status === 'Resuelto').length;

  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter(v => v.status === 'Disponible').length;

  const totalIncidents = incidents.length;
  const verifiedIncidents = incidents.filter(i => i.isVerified).length;

  // Selected emergency details
  const selectedEmergency = emergencies.find(e => e.id === selectedEmergencyId);

  const handleAllocateChange = (resourceId: string, val: number) => {
    setAllocationQuantities(prev => ({
      ...prev,
      [resourceId]: val
    }));
  };

  const handleSaveAllocations = async () => {
    if (!selectedEmergencyId) return;
    setIsAllocating(true);
    try {
      const allocations = Object.entries(allocationQuantities)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([resId, qty]) => ({ resourceId: resId, quantity: Number(qty) }));

      await onAllocateResources(selectedEmergencyId, allocations);
      setAllocationQuantities({});
      setSelectedEmergencyId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAllocating(false);
    }
  };

  // Professional PDF Export using jsPDF
  const exportPDFReport = () => {
    setPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = "#0f172a"; // slate-900
      const accentColor = "#2563eb"; // blue-600

      // Page dimensions
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text("RED NACIONAL DE AUXILIO Y ASISTENCIA CRITICA", margin, 16);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text("Reporte Unificado de Gestión de Crisis, Logística e Incidentes - Venezuela", margin, 24);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleString('es-VE')} | Ámbito: Nacional`, margin, 30);

      // Reset text settings
      doc.setTextColor(15, 23, 42);
      y = 50;

      // Section 1: RESUMEN GENERAL DE SITUACIÓN
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("1. RESUMEN EJECUTIVO DE SITUACIÓN", margin, y);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 10;

      // KPI boxes
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`* Total Casos de Emergencia Reportados: ${totalEmergencies}`, margin + 5, y);
      doc.text(`  - Activos (Pendientes): ${pendingEmergencies}`, margin + 5, y + 5);
      doc.text(`  - En Atención (En Proceso): ${ongoingEmergencies}`, margin + 5, y + 10);
      doc.text(`  - Solventados: ${resolvedEmergencies}`, margin + 5, y + 15);

      doc.text(`* Total de Fuerza Voluntaria Registrada: ${totalVolunteers}`, margin + 90, y);
      doc.text(`  - Disponibles de Inmediato: ${availableVolunteers}`, margin + 90, y + 5);
      doc.text(`  - Asignados a Operaciones: ${volunteers.filter(v => v.status === 'Asignado').length}`, margin + 90, y + 10);

      doc.text(`* Alertas de Seguridad / Saqueos: ${totalIncidents}`, margin + 5, y + 25);
      doc.text(`  - Incidentes de Alta Peligrosidad: ${incidents.filter(i => i.riskLevel === 'Crítico').length}`, margin + 5, y + 30);

      y += 40;

      // Section 2: CASOS DE EMERGENCIA DE ALTA PRIORIDAD ACTIVO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("2. REGISTRO DE EMERGENCIAS ACTIVAS (VÍCTIMAS)", margin, y);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;

      emergencies.filter(e => e.status !== 'Resuelto').slice(0, 5).forEach((e, idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${idx + 1}. [Urgencia: ${e.urgency}] ${e.category} - ${e.name}`, margin + 2, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(`Contacto: ${e.contact} | Ubicación: ${e.address}, ${e.city}, Edo. ${e.state}`, margin + 5, y + 5);
        doc.text(`Descripción: ${e.description.substring(0, 100)}...`, margin + 5, y + 10);

        // Render allocated resources
        const allocStr = e.allocatedResources.length > 0
          ? e.allocatedResources.map(a => {
              const res = resources.find(r => r.id === a.resourceId);
              return `${a.quantity}x ${res?.name || 'Insumo'}`;
            }).join(', ')
          : "Sin suministros despachados aún";
        doc.text(`Recursos Asignados: ${allocStr}`, margin + 5, y + 15);

        y += 22;
      });

      y += 5;

      // Section 3: CONTROL DE INVENTARIO Y DESPACHO HUMANITARIO
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("3. LOGÍSTICA DE RECURSOS Y SUMINISTROS", margin, y);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text("Nombre del Recurso", margin + 5, y);
      doc.text("Categoría", margin + 65, y);
      doc.text("Existencia", margin + 110, y);
      doc.text("Asignado", margin + 140, y);
      doc.text("Estatus", margin + 165, y);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      resources.forEach(r => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const remaining = r.quantity - r.allocated;
        const statusText = remaining < 10 ? "Alerta Crítica Stock" : "Suficiente";
        
        doc.text(r.name, margin + 5, y);
        doc.text(r.category, margin + 65, y);
        doc.text(`${r.quantity} ${r.unit}`, margin + 110, y);
        doc.text(`${r.allocated} ${r.unit}`, margin + 140, y);
        doc.text(statusText, margin + 165, y);
        
        y += 6.5;
      });

      // Section 4: ALERTAS DE SEGURIDAD CIUDADANA
      y += 10;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("4. INCIDENTES DE SEGURIDAD Y SAQUEOS REPORTADOS", margin, y);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;

      incidents.slice(0, 3).forEach((inc, idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(`${idx + 1}. [Riesgo: ${inc.riskLevel}] ${inc.type} en ${inc.city}, Edo. ${inc.state}`, margin + 2, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Detalle: ${inc.description}`, margin + 5, y + 5);
        doc.text(`Dirección exacta: ${inc.address} | Verificado: ${inc.isVerified ? 'SÍ' : 'PENDIENTE DE VERIFICACIÓN'}`, margin + 5, y + 10);
        
        y += 16;
      });

      // Footer disclaimer for official entities
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Este informe ha sido exportado en tiempo real desde la Plataforma de Asistencia de Emergencia de Venezuela.", margin, y + 10);
      doc.text("La veracidad de los datos depende de la verificación ciudadana registrada e integrada con el API del sistema.", margin, y + 14);

      // Save PDF
      doc.save(`Reporte_Oficial_Asistencia_Crisis_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-tab-panel">
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shadow-sm">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Crisis Activas</div>
            <div className="text-xl font-extrabold text-slate-900">{pendingEmergencies + ongoingEmergencies}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{resolvedEmergencies} solventadas</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Voluntarios</div>
            <div className="text-xl font-extrabold text-slate-900">{totalVolunteers}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{availableVolunteers} activos y listos</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-50 border border-orange-100 text-orange-600 rounded-xl shadow-sm">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Incidentes Seg.</div>
            <div className="text-xl font-extrabold text-slate-900">{totalIncidents}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{verifiedIncidents} reportes válidos</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shadow-sm">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Auxilios Despachados</div>
            <div className="text-xl font-extrabold text-slate-900">
              {resources.reduce((acc, curr) => acc + curr.allocated, 0)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Envíos de auxilio activos</div>
          </div>
        </div>

      </div>

      {/* Main Logistics Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resources / Stock Management Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full col-span-1">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Package size={16} className="text-blue-600" />
              Suministros y Logística
            </h3>
            <button 
              onClick={onRefreshData}
              className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Sincronizar inventario"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
            Niveles actuales de insumos en los centros de acopio nacionales. Se distribuyen y asignan según la gravedad.
          </p>

          <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-1 flex-grow">
            {resources.map((res) => {
              const remaining = res.quantity - res.allocated;
              const percent = res.quantity > 0 ? (remaining / res.quantity) * 100 : 0;
              let barColor = "bg-blue-600";
              if (percent < 15) barColor = "bg-red-600 animate-pulse";
              else if (percent < 40) barColor = "bg-amber-500";

              return (
                <div key={res.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="font-bold text-slate-800 block">{res.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">{res.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">{remaining} / {res.quantity}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{res.unit} libres</span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick PDF official export button */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={exportPDFReport}
              disabled={pdfGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex justify-center items-center gap-2 shadow-sm cursor-pointer"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Generando Informe...
                </>
              ) : (
                <>
                  <FileDown size={14} />
                  Exportar Informe Oficial (PDF)
                </>
              )}
            </button>
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">
              Cumple con requisitos de formato para Naciones Unidas, OCHA y organismos oficiales.
            </p>
          </div>
        </div>

        {/* Emergencies Management Column (Main Intake View) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              Gestión de Emergencias y Respuestas Coordinadas
            </h3>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {pendingEmergencies} Pendientes
            </span>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-[460px] pr-1 flex-grow">
            {emergencies.map((e) => {
              const isSelected = selectedEmergencyId === e.id;
              
              let urgencyBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
              if (e.urgency === "Crítica") urgencyBadgeColor = "bg-red-50 text-red-700 border-red-100 animate-pulse";
              else if (e.urgency === "Alta") urgencyBadgeColor = "bg-orange-50 text-orange-700 border-orange-100";
              else if (e.urgency === "Media") urgencyBadgeColor = "bg-amber-50 text-amber-700 border-amber-100";

              let statusBadgeColor = "bg-blue-50 text-blue-700 border-blue-200";
              if (e.status === "Resuelto") statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
              else if (e.status === "En Proceso") statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <div 
                  key={e.id} 
                  className={`p-4 rounded-2xl border transition text-xs flex flex-col gap-3 ${
                    isSelected 
                      ? 'bg-slate-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                      : 'bg-slate-50/30 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{e.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${urgencyBadgeColor}`}>
                          {e.urgency}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block font-semibold">
                        {e.city}, Edo. {e.state} — <span className="text-slate-400 font-normal">{e.address}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={e.status}
                        onChange={(evt) => onUpdateEmergencyStatus(e.id, evt.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none ${statusBadgeColor}`}
                      >
                        <option value="Pendiente" className="bg-white text-blue-700">Pendiente</option>
                        <option value="En Proceso" className="bg-white text-amber-700">En Proceso</option>
                        <option value="Resuelto" className="bg-white text-emerald-700">Resuelto</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-blue-600 text-[10px] uppercase block mb-0.5">Diagnóstico/Necesidad:</span>
                    {e.description}
                  </p>

                  {/* Allocated resources lists */}
                  {e.allocatedResources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Enviado:</span>
                      {e.allocatedResources.map(alloc => {
                        const res = resources.find(r => r.id === alloc.resourceId);
                        return (
                          <span key={alloc.resourceId} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold">
                            {alloc.quantity}x {res?.name || 'Insumo'}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Reportado: {new Date(e.createdAt).toLocaleTimeString()} ({e.contact})
                    </span>
                    
                    {e.status !== 'Resuelto' && (
                      <button
                        onClick={() => setSelectedEmergencyId(isSelected ? null : e.id)}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {isSelected ? 'Cerrar Logística' : 'Asignar Suministros'}
                        <ChevronRight size={12} className={isSelected ? 'rotate-90 transition-transform' : ''} />
                      </button>
                    )}
                  </div>

                  {/* Inline allocation workstation drawer */}
                  {isSelected && (
                    <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-fadeIn text-xs shadow-inner">
                      <h4 className="font-bold text-slate-700 mb-2.5 text-[11px] uppercase tracking-wider text-blue-600">
                        Despachar Suministros de Auxilio
                      </h4>
                      
                      <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
                        {resources.map((res) => {
                          const remaining = res.quantity - res.allocated;
                          const currentAlloc = e.allocatedResources.find(a => a.resourceId === res.id)?.quantity || 0;
                          const requestedQty = allocationQuantities[res.id] || currentAlloc;

                          return (
                            <div key={res.id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                              <div>
                                <span className="font-bold text-slate-800 block">{res.name}</span>
                                <span className="text-[9px] text-slate-400 font-medium">Stock libre: {remaining} {res.unit}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAllocateChange(res.id, Math.max(0, requestedQty - 1))}
                                  className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold transition cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-mono text-slate-900 font-bold">{requestedQty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAllocateChange(res.id, Math.min(remaining + currentAlloc, requestedQty + 1))}
                                  className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold transition cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setSelectedEmergencyId(null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAllocations}
                          disabled={isAllocating}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {isAllocating ? (
                            <Loader2 className="animate-spin" size={12} />
                          ) : (
                            <Check size={12} />
                          )}
                          Guardar Asignación
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
