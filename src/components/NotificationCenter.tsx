import React, { useState } from 'react';
import { Notification } from '../types';
import { Bell, Megaphone, ShieldAlert, Sparkles, AlertTriangle, Check, MailCheck } from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  onBroadcast: (data: { title: string; message: string; type: 'Alerta Crítica' | 'Coordinación' | 'Suministro' | 'Seguridad'; targetArea?: string }) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export default function NotificationCenter({ notifications, onBroadcast, onMarkAllAsRead }: NotificationCenterProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Alerta Crítica' | 'Coordinación' | 'Suministro' | 'Seguridad'>('Alerta Crítica');
  const [targetArea, setTargetArea] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setSuccess(false);

    try {
      await onBroadcast({
        title,
        message,
        type,
        targetArea: targetArea || undefined
      });

      setTitle('');
      setMessage('');
      setTargetArea('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="notification-center-panel">
      
      {/* Broadcast Form / Control Tower */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <Megaphone className="text-blue-600" size={18} />
          <h3 className="font-bold text-sm text-slate-800">Torre de Difusión de Alertas Push</h3>
        </div>

        <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
          Permite a los coordinadores autorizados emitir alertas de emergencia urgentes a las aplicaciones de todos los voluntarios en el terreno de manera instantánea.
        </p>

        {success && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] flex items-center gap-1.5 font-medium">
            <Check size={14} />
            <span>Alerta Push emitida exitosamente a nivel nacional.</span>
          </div>
        )}

        <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs flex-grow flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Título de la Alerta *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. ALERTA CRÍTICA: Desborde del río"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Mensaje Corto (Máx. 160 caracteres) *</label>
              <textarea 
                required
                rows={3}
                maxLength={160}
                placeholder="Indique la emergencia, instrucciones a voluntarios y áreas que deben evitar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Tipo de Notificación</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="Alerta Crítica">Crítica (Roja)</option>
                  <option value="Seguridad">Seguridad (Naranja)</option>
                  <option value="Coordinación">Coordinación (Gris)</option>
                  <option value="Suministro">Logística / Stock (Azul)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Zona / Edo. Afectado</label>
                <input 
                  type="text" 
                  placeholder="Ej. Todo el País / Edo. Zulia"
                  value={targetArea}
                  onChange={(e) => setTargetArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition mt-5 flex justify-center items-center gap-1.5 cursor-pointer"
          >
            {isSending ? (
              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
            ) : (
              <>
                <Bell size={13} className="animate-bounce" />
                Transmitir Alerta de Emergencia Urgente
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notification Stream / Alerts Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600" size={18} />
            <h3 className="font-bold text-sm text-slate-800">Centro de Monitoreo de Alertas Recibidas</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {unreadCount} Nuevas
              </span>
            )}
            <button
              onClick={onMarkAllAsRead}
              className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 transition font-bold cursor-pointer"
              title="Marcar todas como leídas"
            >
              <MailCheck size={12} />
              Leído
            </button>
          </div>
        </div>

        {/* Real-time feed stream */}
        <div className="space-y-3.5 overflow-y-auto max-h-[440px] pr-1 flex-grow">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Bell size={32} strokeWidth={1} />
              <span className="text-xs font-medium">No hay alertas activas en el canal de crisis.</span>
            </div>
          ) : (
            notifications.map((n) => {
              let iconElement = <Bell size={14} className="text-slate-500" />;
              let borderColor = "border-slate-200";
              let badgeColor = "bg-slate-100 text-slate-700 border border-slate-200 font-bold";
              
              if (n.type === 'Alerta Crítica') {
                iconElement = <ShieldAlert size={14} className="text-red-600" />;
                borderColor = "border-red-200";
                badgeColor = "bg-red-50 text-red-700 border border-red-100 font-bold";
              } else if (n.type === 'Seguridad') {
                iconElement = <AlertTriangle size={14} className="text-orange-600" />;
                borderColor = "border-orange-200";
                badgeColor = "bg-orange-50 text-orange-700 border border-orange-100 font-bold";
              } else if (n.type === 'Suministro') {
                iconElement = <Sparkles size={14} className="text-blue-600" />;
                borderColor = "border-blue-200";
                badgeColor = "bg-blue-50 text-blue-700 border border-blue-100 font-bold";
              }

              return (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition flex gap-3 ${borderColor} ${
                    !n.isRead ? 'ring-1 ring-blue-500/20 bg-white shadow-sm border-blue-300' : ''
                  }`}
                >
                  <div className="p-2.5 bg-white rounded-xl h-fit shrink-0 border border-slate-200 shadow-sm">
                    {iconElement}
                  </div>

                  <div className="flex-grow space-y-1 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800 text-sm leading-tight">{n.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>

                    <div className="flex items-center gap-2 pt-1.5 text-[9px] font-mono text-slate-500">
                      <span className={`px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {n.type}
                      </span>
                      {n.targetArea && (
                        <span className="border border-slate-200 bg-white px-2 py-0.5 rounded-full text-slate-600 font-semibold">
                          Foco: {n.targetArea}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
