import React, { useState, useEffect, useCallback } from 'react';
import { Emergency, Volunteer, Incident, Resource, Notification, SocialPost } from './types';
import { useAuth } from './contexts/AuthContext';
import { useApi } from './hooks/useApi';
import LoginButton from './components/LoginButton';
import MapMockup from './components/MapMockup';
import EmergencyForm from './components/EmergencyForm';
import VolunteerForm from './components/VolunteerForm';
import IncidentForm from './components/IncidentForm';
import Dashboard from './components/Dashboard';
import NotificationCenter from './components/NotificationCenter';
import SocialFeed from './components/SocialFeed';
import TermsModal from './components/TermsModal';

import { 
  HeartHandshake, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Package, 
  Bell, 
  AlertTriangle,
  Clock, 
  Activity, 
  Flag,
  Globe,
  PlusCircle,
  Megaphone,
  X,
  MessageSquare,
  Volume2
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { apiFetch } = useApi();

  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'emergency' | 'volunteer' | 'incident' | 'logistics' | 'alerts'>('feed');
  
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prefilledLocation, setPrefilledLocation] = useState<{ lat: number; lng: number; city: string; state: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [activePushToast, setActivePushToast] = useState<Notification | null>(null);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [resEm, resVol, resInc, resLog, resNot, resPosts] = await Promise.all([
        apiFetch('/api/emergencies'),
        apiFetch('/api/volunteers'),
        apiFetch('/api/incidents'),
        apiFetch('/api/resources'),
        apiFetch('/api/notifications'),
        apiFetch('/api/posts'),
      ]);

      setEmergencies(Array.isArray(resEm) ? resEm : []);
      setVolunteers(Array.isArray(resVol) ? resVol : []);
      setIncidents(Array.isArray(resInc) ? resInc : []);
      setResources(Array.isArray(resLog) ? resLog : []);
      setNotifications(Array.isArray(resNot) ? resNot : []);
      setPosts(Array.isArray(resPosts) ? resPosts : []);
      setError(null);
      
      if (Array.isArray(resNot) && resNot.length > 0) {
        const latest = resNot[0];
        if (lastNotificationId && latest.id !== lastNotificationId) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch (e) {
          }

          setActivePushToast(latest);
          setTimeout(() => {
            setActivePushToast(null);
          }, 8000);
        }
        setLastNotificationId(latest.id);
      } else {
        setLastNotificationId(null);
      }

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError("Error de comunicación con el centro de crisis unificado.");
      setLoading(false);
    }
  }, [lastNotificationId, apiFetch]);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, [authLoading, fetchData]);

  // Handle map captured location
  const handleSelectLocationFromMap = (lat: number, lng: number, city: string, state: string) => {
    setPrefilledLocation({ lat, lng, city, state });
  };

  const handleCreateEmergency = async (data: Partial<Emergency>) => {
    await apiFetch('/api/emergencies', { method: 'POST', body: JSON.stringify(data) });
    await fetchData();
    setActiveTab('map');
  };

  const handleCreateVolunteer = async (data: Partial<Volunteer>) => {
    await apiFetch('/api/volunteers', { method: 'POST', body: JSON.stringify(data) });
    await fetchData();
    setActiveTab('map');
  };

  const handleCreateIncident = async (data: Partial<Incident>) => {
    await apiFetch('/api/incidents', { method: 'POST', body: JSON.stringify(data) });
    await fetchData();
    setActiveTab('map');
  };

  const handleUpdateEmergencyStatus = async (id: string, status: 'Pendiente' | 'En Proceso' | 'Resuelto') => {
    await apiFetch(`/api/emergencies/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await fetchData();
  };

  const handleAllocateResources = async (emergencyId: string, allocations: { resourceId: string; quantity: number }[]) => {
    await apiFetch(`/api/emergencies/${emergencyId}`, { method: 'PATCH', body: JSON.stringify({ allocatedResources: allocations }) });
    await fetchData();
  };

  const handleBroadcastNotification = async (data: { title: string; message: string; type: 'Alerta Crítica' | 'Coordinación' | 'Suministro' | 'Seguridad'; targetArea?: string }) => {
    await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify(data) });
    await fetchData();
  };

  const handleMarkNotificationsAsRead = async () => {
    await apiFetch('/api/notifications/mark-read', { method: 'POST' });
    await fetchData();
  };

  const handleCreatePost = async (data: Partial<SocialPost>) => {
    await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(data) });
    await fetchData();
  };

  const handleLikePost = async (postId: string) => {
    await apiFetch(`/api/posts/${postId}/like`, { method: 'POST', body: JSON.stringify({ uid: user?.id }) });
    await fetchData();
  };

  const handleVerifyPost = async (postId: string) => {
    await apiFetch(`/api/posts/${postId}/verify`, { method: 'POST' });
    await fetchData();
  };

  const handleAddComment = async (postId: string, author: string, text: string, contact?: string) => {
    await apiFetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ author, text, contact }) });
    await fetchData();
  };

  // Local clock generator for Venezuela (VET is UTC-4)
  const [venezuelaTime, setVenezuelaTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      // UTC - 4 hours
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const vetDate = new Date(utc + (3600000 * -4));
      
      const hours = String(vetDate.getHours()).padStart(2, '0');
      const minutes = String(vetDate.getMinutes()).padStart(2, '0');
      const seconds = String(vetDate.getSeconds()).padStart(2, '0');
      
      setVenezuelaTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white pb-12">
      
      {/* Dynamic Push Alert Popup Overlay */}
      {activePushToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white border-2 border-blue-500 rounded-xl shadow-2xl p-4.5 animate-fadeIn text-slate-800" id="realtime-push-alert-popup">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block animate-ping shrink-0"></span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono flex items-center gap-1">
                <Volume2 size={12} />
                Alerta Crítica Push
              </span>
            </div>
            <button 
              onClick={() => setActivePushToast(null)} 
              className="text-slate-400 hover:text-slate-600 transition p-1 rounded hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2 text-xs">
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{activePushToast.title}</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">{activePushToast.message}</p>
            
            {activePushToast.targetArea && (
              <span className="inline-block mt-2.5 bg-slate-100 border border-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold">
                Región: {activePushToast.targetArea}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Top Command Center Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-30 shadow-lg" id="main-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-white text-blue-600 p-1.5 rounded-full shadow-md shrink-0">
              <Activity className="animate-pulse text-blue-600" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase italic text-white flex items-center gap-2">
                Asistencia VZLA <span className="font-normal opacity-85 text-xs md:text-sm not-italic hidden sm:inline">| Centro de Operaciones</span>
              </h1>
              <p className="text-[10px] text-blue-100 mt-0.5 flex items-center gap-1.5">
                <Globe size={11} className="text-blue-200 animate-spin-slow" />
                Coordinación Civil y Humanitaria Descentralizada
              </p>
            </div>
          </div>

          {/* Local Information and Venezuela Real-time Clock */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-700 px-3 py-1.5 rounded-full shadow-sm text-white font-mono text-[10px] md:text-xs">
              <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
              <span className="font-bold tracking-wider">ALERTA: CRISIS EN MARCHA</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-700/60 border border-blue-500/20 px-3 py-1 rounded-lg text-xs text-white">
              <Clock size={14} className="text-amber-300" />
              <div>
                <span className="text-blue-200 block text-[9px] uppercase font-mono tracking-wider">Hora VET (Caracas)</span>
                <span className="font-mono font-bold tracking-widest">{venezuelaTime || "00:00:00"}</span>
              </div>
            </div>

            <div className="hidden sm:block">
              <LoginButton />
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 gap-6" id="app-main-content">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap bg-slate-900 text-slate-300 rounded-2xl shadow-md p-1.5 gap-1 border border-slate-800" id="navigation-tabs">
          <button
            onClick={() => { setActiveTab('feed'); setPrefilledLocation(null); }}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            Muro Solidario (Feed)
          </button>

          <button
            onClick={() => { setActiveTab('map'); setPrefilledLocation(null); }}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Globe size={14} />
            Mapa en Tiempo Real
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'emergency'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <HeartHandshake size={14} />
            Gestión Voluntarios
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'volunteer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            Registro Voluntarios
          </button>

          <button
            onClick={() => setActiveTab('incident')}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'incident'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={14} />
            Reportar Saqueo
          </button>

          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              activeTab === 'logistics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Package size={14} />
            Suministros y Logística
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 text-xs font-bold uppercase tracking-wider relative ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Bell size={14} />
            Alertas y Difusión
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Tab content renderer */}
        <div className="animate-fadeIn">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 text-xs">
              <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></span>
              <span>Cargando plataforma unificada...</span>
            </div>
          ) : error ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center text-blue-800 text-xs max-w-lg mx-auto my-12 flex flex-col gap-3 shadow-sm">
              <AlertTriangle size={32} className="mx-auto text-blue-600" />
              <p className="font-bold text-sm">{error}</p>
              <button 
                onClick={fetchData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl self-center transition shadow-sm"
              >
                Reintentar Conexión
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'feed' && (
                <SocialFeed 
                  posts={posts}
                  prefilledLocation={prefilledLocation}
                  onClearPrefilledLocation={() => setPrefilledLocation(null)}
                  onCreatePost={handleCreatePost}
                  onLikePost={handleLikePost}
                  onVerifyPost={handleVerifyPost}
                  onAddComment={handleAddComment}
                />
              )}

              {activeTab === 'map' && (
                <div className="space-y-6">
                          {/* Context Banner */}
                  <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-r-2xl p-5 text-xs text-slate-600 leading-relaxed shadow-sm">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-tight">
                      <Flag className="text-blue-600" size={14} />
                      SITUACIÓN OPERATIVA EN VENEZUELA
                    </h4>
                    <p>
                      La persistencia de fallas en la red eléctrica, escasez de fármacos críticos y el impacto de desastres por lluvias estacionales requiere una respuesta comunitaria coordinada. Esta plataforma registra solicitudes de afectados, canaliza el voluntariado, y emite alertas de seguridad (como conatos de saqueo) de forma totalmente transparente e inmediata.
                    </p>
                    <div className="mt-3.5 flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 w-fit">
                      <span className="w-2 h-2 rounded-full bg-blue-600 block animate-pulse"></span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Sugerencia: Haz clic en cualquier parte del mapa para marcar un foco de interés e iniciar un reporte con esas coordenadas geográficas.
                      </span>
                    </div>
                  </div>

                  {/* Main Grid: Interactive Map + Active Lists */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <MapMockup 
                        emergencies={emergencies} 
                        volunteers={volunteers} 
                        incidents={incidents}
                        posts={posts}
                        onSelectLocation={handleSelectLocationFromMap}
                        selectedCity={selectedCity}
                        onCityClick={setSelectedCity}
                      />
                    </div>

                    {/* Quick Activity stream list */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-full col-span-1 shadow-sm text-slate-800">
                      <div className="border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            Reportes en Tiempo Real
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Sincronizado en vivo</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-wider">Live Feed</span>
                      </div>

                      <div className="space-y-3.5 overflow-y-auto max-h-[360px] pr-1 flex-grow">
                        {/* Merge recent incidents and emergencies for a combined live stream */}
                        {emergencies.filter(e => !selectedCity || e.city === selectedCity).length === 0 && incidents.filter(i => !selectedCity || i.city === selectedCity).length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs">
                            No hay reportes recientes en la ciudad seleccionada.
                          </div>
                        ) : (
                          <>
                            {/* Urgent Incidents */}
                            {incidents.filter(i => !selectedCity || i.city === selectedCity).slice(0, 5).map(inc => (
                              <div key={inc.id} className="bg-slate-50 p-3 rounded-xl border border-amber-200 text-xs flex gap-3 shadow-sm">
                                <div className="w-1 bg-amber-500 rounded-full shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="font-bold text-amber-700 text-[11px] uppercase">
                                      ⚠️ {inc.type}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {new Date(inc.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed text-[11px]">{inc.description}</p>
                                  <div className="text-[9px] text-slate-400 font-mono mt-1.5 font-semibold">
                                    {inc.city}, Edo. {inc.state} (Riesgo: {inc.riskLevel})
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Emergencies */}
                            {emergencies.filter(e => !selectedCity || e.city === selectedCity).slice(0, 5).map(em => (
                              <div key={em.id} className="bg-slate-50 p-3 rounded-xl border border-blue-100 text-xs flex gap-3 shadow-sm">
                                <div className="w-1 bg-blue-500 rounded-full shrink-0"></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="font-bold text-blue-700 text-[11px] uppercase">
                                      🚨 {em.category}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {new Date(em.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed text-[11px]">{em.description}</p>
                                  <div className="text-[9px] text-slate-400 font-mono mt-1.5 flex justify-between font-semibold">
                                    <span>{em.city}, Edo. {em.state}</span>
                                    <span className="text-blue-600">{em.status}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Quick-actions sidebar buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        <button
                          onClick={() => setActiveTab('emergency')}
                          className="w-full bg-blue-50 text-blue-700 font-bold py-2.5 px-4 rounded-xl border border-blue-200 hover:bg-blue-100 text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <PlusCircle size={14} />
                          Reportar Nueva Emergencia
                        </button>
                        <button
                          onClick={() => setActiveTab('incident')}
                          className="w-full bg-amber-50 text-amber-700 font-bold py-2.5 px-4 rounded-xl border border-amber-200 hover:bg-amber-100 text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <AlertTriangle size={14} />
                          Informar Alerta de Seguridad
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="max-w-2xl mx-auto my-4">
                  <EmergencyForm onSubmit={handleCreateEmergency} prefilledLocation={prefilledLocation} onOpenTerms={() => setIsTermsModalOpen(true)} />
                </div>
              )}

              {activeTab === 'volunteer' && (
                <div className="max-w-2xl mx-auto my-4">
                  <VolunteerForm onSubmit={handleCreateVolunteer} prefilledLocation={prefilledLocation} onOpenTerms={() => setIsTermsModalOpen(true)} />
                </div>
              )}

              {activeTab === 'incident' && (
                <div className="max-w-2xl mx-auto my-4">
                  <IncidentForm onSubmit={handleCreateIncident} prefilledLocation={prefilledLocation} onOpenTerms={() => setIsTermsModalOpen(true)} />
                </div>
              )}

              {activeTab === 'logistics' && (
                <Dashboard 
                  emergencies={emergencies} 
                  volunteers={volunteers} 
                  incidents={incidents}
                  resources={resources}
                  onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
                  onAllocateResources={handleAllocateResources}
                  onRefreshData={fetchData}
                />
              )}

              {activeTab === 'alerts' && (
                <NotificationCenter 
                  notifications={notifications} 
                  onBroadcast={handleBroadcastNotification}
                  onMarkAllAsRead={handleMarkNotificationsAsRead}
                />
              )}
            </>
          )}
        </div>

        {/* Action Footer */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8" id="action-footer">
          <button 
            onClick={() => setActiveTab('emergency')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-blue-50 text-blue-700 py-3.5 px-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition duration-150 cursor-pointer shadow-sm"
          >
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider">Notificar Emergencia Crítica</span>
          </button>
          <button 
            onClick={() => setActiveTab('incident')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-blue-50 text-blue-700 py-3.5 px-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition duration-150 cursor-pointer shadow-sm"
          >
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider">Activar Geolocalización</span>
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className="flex-1 flex items-center justify-center gap-2.5 bg-green-50 text-green-700 py-3.5 px-4 rounded-xl border border-green-200 hover:bg-green-100 transition duration-150 cursor-pointer shadow-sm"
          >
            <Megaphone className="w-5 h-5 text-green-600" />
            <span className="font-bold text-xs uppercase tracking-wider">Push Masivo Voluntarios</span>
          </button>
        </footer>

      </main>

      {/* Styled minimalistic Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 mt-16 text-center border-t border-slate-200 pt-6 pb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            PLATAFORMA CIVIL INTEGRADA VENEZUELA DE RESPUESTA OPERATIVA &copy; 2026. TODOS LOS ENLACES DE AYUDA TRABAJAN BAJO PROTOCOLO DE CONEXIÓN CIFRADO.
          </div>
          <button 
            onClick={() => setIsTermsModalOpen(true)}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold"
          >
            Términos y Condiciones Legales
          </button>
        </div>
      </footer>

      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  );
}
