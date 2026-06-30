import React, { useState } from 'react';
import { SocialPost, SocialComment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Handshake, 
  ShieldAlert, 
  PlusCircle, 
  MessageSquare, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Zap,
  Utensils,
  Pill,
  Droplet,
  Truck,
  Home,
  AlertTriangle,
  X,
  Map,
  BadgeAlert
} from 'lucide-react';

interface SocialFeedProps {
  posts: SocialPost[];
  prefilledLocation: { lat: number; lng: number; city: string; state: string } | null;
  onClearPrefilledLocation: () => void;
  onCreatePost: (postData: Partial<SocialPost>) => Promise<void>;
  onLikePost: (postId: string) => Promise<void>;
  onVerifyPost: (postId: string) => Promise<void>;
  onAddComment: (postId: string, author: string, text: string, contact?: string) => Promise<void>;
}

const VENEZUELA_STATES = [
  "Distrito Capital",
  "Zulia",
  "Aragua",
  "Carabobo",
  "Lara",
  "Táchira",
  "Anzoátegui",
  "Bolívar",
  "Apure",
  "Mérida",
  "Miranda",
  "Falcón",
  "Monagas",
  "Sucre",
  "Guárico",
  "Portuguesa",
  "Yaracuy",
  "Barinas",
  "Nueva Esparta",
  "Trujillo",
  "Cojedes",
  "Delta Amacuro",
  "Amazonas"
];

const CATEGORIES = [
  { value: 'Alimentos', label: 'Alimentos', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'Medicamentos', label: 'Medicamentos', icon: Pill, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'Agua Potable', label: 'Agua Potable', icon: Droplet, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'Electricidad / Energía', label: 'Electricidad / Energía', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'Transporte / Logística', label: 'Transporte / Logística', icon: Truck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { value: 'Refugio', label: 'Refugio', icon: Home, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'Atención Médica', label: 'Atención Médica', icon: Heart, color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'Seguridad', label: 'Alertas de Seguridad', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { value: 'Otro', label: 'Otro', icon: PlusCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' }
];

export default function SocialFeed({
  posts,
  prefilledLocation,
  onClearPrefilledLocation,
  onCreatePost,
  onLikePost,
  onVerifyPost,
  onAddComment
}: SocialFeedProps) {
  // Feed Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'Todos' | 'Ofrecimiento' | 'Solicitud' | 'Alerta'>('Todos');
  const [selectedState, setSelectedState] = useState('');
  
  // Feed composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newPostType, setNewPostType] = useState<'Ofrecimiento' | 'Solicitud' | 'Alerta'>('Ofrecimiento');
  const [newPostCategory, setNewPostCategory] = useState('Alimentos');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [newPostContact, setNewPostContact] = useState('');
  const [newPostState, setNewPostState] = useState('Distrito Capital');
  const [newPostCity, setNewPostCity] = useState('');
  const [newPostAddress, setNewPostAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerError, setComposerError] = useState('');

  // Post Detail states (expanded comments, shown contacts)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [shownContacts, setShownContacts] = useState<Record<string, boolean>>({});
  
  // New Comment states
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

  // Sync prefilled location from map click to composer
  React.useEffect(() => {
    if (prefilledLocation) {
      setNewPostState(prefilledLocation.state);
      setNewPostCity(prefilledLocation.city);
      setNewPostAddress(`Ubicación capturada en Mapa (Lat: ${prefilledLocation.lat}, Lng: ${prefilledLocation.lng})`);
      setIsComposerOpen(true);
    }
  }, [prefilledLocation]);

  // Handle create post submit
  const handleComposerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposerError('');
    setIsSubmitting(true);

    if (!newPostAuthor.trim() || !newPostContact.trim() || !newPostTitle.trim() || !newPostDescription.trim() || !newPostCity.trim() || !newPostAddress.trim()) {
      setComposerError('Por favor completa todos los campos requeridos para publicar.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onCreatePost({
        authorName: newPostAuthor,
        contact: newPostContact,
        type: newPostType,
        category: newPostCategory as any,
        title: newPostTitle,
        description: newPostDescription,
        state: newPostState,
        city: newPostCity,
        address: newPostAddress,
        latitude: prefilledLocation?.lat || 10.4806,
        longitude: prefilledLocation?.lng || -66.9036
      });

      // Reset Form
      setNewPostTitle('');
      setNewPostDescription('');
      setNewPostCity('');
      setNewPostAddress('');
      setIsComposerOpen(false);
      onClearPrefilledLocation();
    } catch (err: any) {
      setComposerError(err.message || 'No se pudo crear la publicación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add comment submit
  const handleCommentSubmit = async (postId: string) => {
    const author = commentAuthors[postId] || '';
    const text = commentTexts[postId] || '';

    if (!author.trim() || !text.trim()) return;

    setCommentSubmitting(prev => ({ ...prev, [postId]: true }));

    try {
      await onAddComment(postId, author, text);
      // Reset input values
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleContact = (postId: string) => {
    setShownContacts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Filter posts based on Search, Type, and State
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'Todos' || post.type === selectedType;
    const matchesState = !selectedState || post.state === selectedState;

    return matchesSearch && matchesType && matchesState;
  });

  const getCategoryConfig = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <div className="space-y-6" id="social-feed-section">
      
      {/* Upper action hub with quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Call to action card */}
        <div className="md:col-span-2 bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between shadow border border-slate-800">
          <div>
            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold">
              CONEXIÓN COMUNITARIA VENEZUELA
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-2">
              ¿Cómo deseas participar hoy?
            </h2>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Publica de forma rápida si tienes insumos, energía o ayuda para ofrecer, o informa si hay un sector o centro de salud necesitando soporte.
            </p>
          </div>
          <button
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm self-start"
          >
            <PlusCircle size={15} />
            {isComposerOpen ? 'Cerrar Publicador' : 'Crear Nueva Publicación'}
          </button>
        </div>

        {/* Dynamic community counter cards */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl w-fit">
              <Handshake size={18} />
            </div>
            <p className="text-slate-500 text-xs mt-3 font-semibold">Ofrecimientos Activos</p>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">
            {posts.filter(p => p.type === 'Ofrecimiento').length} <span className="text-xs font-normal text-slate-400">mensajes</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="bg-red-50 text-red-600 p-2 rounded-xl w-fit">
              <Heart size={18} />
            </div>
            <p className="text-slate-500 text-xs mt-3 font-semibold">Lugares con Necesidad</p>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">
            {posts.filter(p => p.type === 'Solicitud').length} <span className="text-xs font-normal text-slate-400">lugares</span>
          </p>
        </div>

      </div>

      {/* COMPOSER PANEL (Twitter-like post publisher) */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-md space-y-4"
            id="post-composer-card"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-blue-100 rounded-full text-blue-600">
                  <PlusCircle size={16} />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Crear Nueva Publicación</h3>
              </div>
              <button 
                onClick={() => { setIsComposerOpen(false); onClearPrefilledLocation(); }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            {composerError && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs p-3 rounded-xl font-medium">
                {composerError}
              </div>
            )}

            {prefilledLocation && (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 text-[11px] p-2.5 rounded-xl flex justify-between items-center font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-600 animate-pulse" />
                  Ubicación pre-seleccionada desde el mapa: <strong>{prefilledLocation.city}, Edo. {prefilledLocation.state}</strong>
                </span>
                <button 
                  onClick={onClearPrefilledLocation}
                  className="text-blue-500 hover:text-blue-700 text-[10px] font-bold underline"
                >
                  Restablecer
                </button>
              </div>
            )}

            <form onSubmit={handleComposerSubmit} className="space-y-4 text-xs">
              
              {/* Post Type Selector Tabs */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">¿Cuál es el propósito del mensaje?</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setNewPostType('Ofrecimiento'); setNewPostCategory('Alimentos'); }}
                    className={`py-2 rounded-lg font-bold text-center transition ${
                      newPostType === 'Ofrecimiento' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    🤝 Ofrecer Ayuda
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewPostType('Solicitud'); setNewPostCategory('Alimentos'); }}
                    className={`py-2 rounded-lg font-bold text-center transition ${
                      newPostType === 'Solicitud' 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    🚨 Solicitar Ayuda (Lugar)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewPostType('Alerta'); setNewPostCategory('Seguridad'); }}
                    className={`py-2 rounded-lg font-bold text-center transition ${
                      newPostType === 'Alerta' 
                        ? 'bg-amber-500 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    ⚠️ Alerta / Seguridad
                  </button>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Author Info */}
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nombre / Organización *</label>
                  <input
                    type="text"
                    value={newPostAuthor}
                    onChange={(e) => setNewPostAuthor(e.target.value)}
                    placeholder="Ej. Juan Pérez o Cáritas Maracaibo"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                    required
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Teléfono de Contacto *</label>
                  <input
                    type="text"
                    value={newPostContact}
                    onChange={(e) => setNewPostContact(e.target.value)}
                    placeholder="Ej. 0412-5553214"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                    required
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Categoría de Apoyo *</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Título del Mensaje *</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Ej. Planta eléctrica disponible para recarga o Hospital Universitario requiere agua potable"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Descripción de Ayuda / Necesidad *</label>
                  <textarea
                    value={newPostDescription}
                    onChange={(e) => setNewPostDescription(e.target.value)}
                    placeholder="Explica detalladamente qué tienes disponible para donar/ayudar o cuál es la necesidad crítica del lugar, horarios, condiciones de entrega..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs resize-none"
                    required
                  />
                </div>
              </div>

              {/* Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Estado de Venezuela *</label>
                  <select
                    value={newPostState}
                    onChange={(e) => setNewPostState(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                  >
                    {VENEZUELA_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={newPostCity}
                    onChange={(e) => setNewPostCity(e.target.value)}
                    placeholder="Ej. Maracaibo o Caracas"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Dirección / Punto de Referencia *</label>
                  <input
                    type="text"
                    value={newPostAddress}
                    onChange={(e) => setNewPostAddress(e.target.value)}
                    placeholder="Ej. Calle 78 con Av. 15, detrás del banco"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                    required
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsComposerOpen(false); onClearPrefilledLocation(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-white font-bold rounded-xl cursor-pointer transition shadow flex items-center gap-1.5 ${
                    newPostType === 'Ofrecimiento' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    newPostType === 'Solicitud' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                  ) : (
                    <Send size={13} />
                  )}
                  Publicar en Muro
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEED FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-bar">
        
        {/* Purpose Filter Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setSelectedType('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedType === 'Todos'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedType('Ofrecimiento')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              selectedType === 'Ofrecimiento'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            🤝 Ofrecen Ayuda
          </button>
          <button
            onClick={() => setSelectedType('Solicitud')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              selectedType === 'Solicitud'
                ? 'bg-red-50 text-red-700 border border-red-200/50 shadow-xs'
                : 'text-slate-500 hover:text-red-600'
            }`}
          >
            🚨 Necesitan Ayuda
          </button>
          <button
            onClick={() => setSelectedType('Alerta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              selectedType === 'Alerta'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/50 shadow-xs'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            ⚠️ Alertas
          </button>
        </div>

        {/* Search and State selects */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          
          {/* State Filter */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 w-full sm:w-44 font-semibold"
            >
              <option value="">Filtrar por Estado</option>
              {VENEZUELA_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el muro..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-400"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>

        </div>

      </div>

      {/* SOCIAL CARDS LIST */}
      <div className="space-y-4" id="feed-posts-list">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 shadow-sm">
            <BadgeAlert size={28} className="text-slate-400" />
            <p className="font-bold">No se encontraron publicaciones en el Muro</p>
            <p className="text-slate-400 font-normal">Prueba con otros términos de búsqueda o filtros.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = expandedComments[post.id] || false;
            const isContactShown = shownContacts[post.id] || false;
            const categoryConfig = getCategoryConfig(post.category);
            const CatIcon = categoryConfig.icon;

            // Define status header color scheme
            let typeBadgeStyle = "bg-slate-100 text-slate-800 border-slate-200";
            if (post.type === 'Ofrecimiento') {
              typeBadgeStyle = "bg-emerald-500/10 text-emerald-700 border-emerald-200/50";
            } else if (post.type === 'Solicitud') {
              typeBadgeStyle = "bg-red-500/10 text-red-700 border-red-200/50";
            } else if (post.type === 'Alerta') {
              typeBadgeStyle = "bg-amber-500/10 text-amber-700 border-amber-200/50";
            }

            // High contrast beautiful initial avatar coloring
            const letters = post.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return (
              <div 
                key={post.id} 
                className={`bg-white border-2 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 ${
                  post.type === 'Ofrecimiento' ? 'border-emerald-100/50 hover:border-emerald-200' :
                  post.type === 'Solicitud' ? 'border-red-100/50 hover:border-red-200' : 'border-amber-100/50 hover:border-amber-200'
                }`}
                id={`post-card-${post.id}`}
              >
                
                {/* Main Content Area */}
                <div className="p-5">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      
                      {/* User Avatar Circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-inner ${
                        post.type === 'Ofrecimiento' ? 'bg-emerald-50 text-emerald-700' :
                        post.type === 'Solicitud' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {letters || '??'}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-xs md:text-sm">{post.authorName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${typeBadgeStyle}`}>
                            {post.type === 'Ofrecimiento' ? '🤝 Ofrece Ayuda' :
                             post.type === 'Solicitud' ? '🚨 Solicitud Lugar' : '⚠️ Alerta de Seguridad'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5 font-semibold">
                          <span className="font-bold text-slate-500">{post.city}, Edo. {post.state}</span>
                          <span>&bull;</span>
                          <span>Hace {Math.max(1, Math.round((Date.now() - new Date(post.createdAt).getTime()) / 60000))} mins</span>
                        </div>
                      </div>

                    </div>

                    {/* Community verified badge */}
                    {post.isVerified && (
                      <div className="bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-xs">
                        <CheckCircle size={12} className="text-blue-500 fill-blue-500" />
                        <span>Verificado</span>
                      </div>
                    )}
                  </div>

                  {/* Post Title */}
                  <h3 className="font-black text-slate-800 text-sm md:text-base mt-4 tracking-tight">
                    {post.title}
                  </h3>

                  {/* Post Description */}
                  <p className="text-slate-600 text-xs leading-relaxed mt-2.5 whitespace-pre-line font-medium">
                    {post.description}
                  </p>

                  {/* Meta tag and Exact Address Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100">
                    
                    {/* Category indicator tag */}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold ${categoryConfig.color}`}>
                      <CatIcon size={12} />
                      {post.category}
                    </span>

                    {/* Map pinning address */}
                    <div className="text-slate-500 flex items-center gap-1 text-[10px] font-semibold bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs md:max-w-md">{post.address}</span>
                    </div>

                  </div>

                </div>

                {/* SOCIAL INTERACTIVE PANEL ACTIONS */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  
                  {/* Left Side: Like & Verification indicators */}
                  <div className="flex items-center gap-2">
                    
                    {/* Like Action ("Apoyar") */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5 font-bold cursor-pointer"
                      title="Apoyar esta iniciativa"
                    >
                      <Handshake size={14} className="text-slate-400" />
                      <span>Apoyar</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded-md text-[9px] text-slate-500 font-mono font-bold">{post.likesCount}</span>
                    </button>

                    {/* Verify Action ("Verificar / Confirmar") */}
                    <button
                      onClick={() => onVerifyPost(post.id)}
                      className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 font-bold cursor-pointer ${
                        post.isVerified 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                      title="Confirmar que esta situación es verídica"
                    >
                      <CheckCircle size={14} className={post.isVerified ? 'text-blue-600' : 'text-slate-400'} />
                      <span>Validar</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded-md text-[9px] text-slate-500 font-mono font-bold">{post.verificationsCount}</span>
                    </button>

                  </div>

                  {/* Right Side: Contact trigger & Expand comments trigger */}
                  <div className="flex items-center gap-2">
                    
                    {/* View Contact Button */}
                    <button
                      onClick={() => toggleContact(post.id)}
                      className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 font-bold cursor-pointer ${
                        isContactShown 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Phone size={13} />
                      <span>{isContactShown ? 'Ocultar Contacto' : 'Contactar'}</span>
                    </button>

                    {/* Expand comments trigger */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <MessageSquare size={13} className="text-slate-400" />
                      <span>Coordinar ({post.comments.length})</span>
                      {isCommentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                  </div>

                </div>

                {/* REVEAL CONTACT DETAILS */}
                <AnimatePresence>
                  {isContactShown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-blue-50 border-t border-blue-100 px-5 py-4 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                    >
                      <div className="flex items-start gap-2.5">
                        <Phone size={18} className="text-blue-600 animate-pulse shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Línea Directa de Coordinación:</p>
                          <p className="text-[13px] font-mono font-black mt-0.5 text-slate-800">{post.contact}</p>
                          <p className="text-[10px] text-blue-700/80 mt-1 leading-normal">
                            Recuerda coordinar el transporte, resguardo o entrega en puntos públicos de seguridad. ¡Ayuda mutua con responsabilidad!
                          </p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${post.contact}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-center shadow-sm cursor-pointer transition shrink-0"
                      >
                        Llamar Ahora
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* EXPANDED COMMENT SECTION */}
                <AnimatePresence>
                  {isCommentsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50/50 border-t border-slate-100 px-5 py-5 space-y-4"
                    >
                      <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare size={13} />
                        Respuestas y Coordinación Vecinal
                      </h4>

                      {/* Comment list */}
                      <div className="space-y-3">
                        {post.comments.length === 0 ? (
                          <p className="text-slate-400 italic text-xs py-2">No hay comentarios de coordinación aún. ¡Inicia la conversación escribiendo abajo!</p>
                        ) : (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-1 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                <span className="font-black text-slate-700 flex items-center gap-1">
                                  <User size={10} />
                                  {comment.author}
                                </span>
                                <span>Hace {Math.max(1, Math.round((Date.now() - new Date(comment.createdAt).getTime()) / 60000))} mins</span>
                              </div>
                              <p className="text-slate-600 leading-normal font-medium">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Composer */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-inner space-y-3 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Tu Nombre / Iniciales *</label>
                            <input
                              type="text"
                              value={commentAuthors[post.id] || ''}
                              onChange={(e) => setCommentAuthors(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Ej. Vecino Chacao"
                              className="w-full border border-slate-100 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-700 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Escribe tu respuesta de coordinación *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentTexts[post.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Ej. Hola, yo puedo buscar las fórmulas esta tarde..."
                              className="flex-1 border border-slate-100 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500 text-slate-700 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                              }}
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={commentSubmitting[post.id] || false}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                            >
                              {commentSubmitting[post.id] ? (
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
