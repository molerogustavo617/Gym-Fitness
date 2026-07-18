// src/pages/entrenador/RutinaFormEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Dumbbell,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  Tag,
  Hash,
  Weight,
  Repeat,
  Timer,
  Sparkles,
  Zap,
  Layers,
  List,
  Grid,
  Check
} from 'lucide-react';
import authService from '../../services/authService';
import rutinaService from '../../services/rutinaService';
import ejercicioService from '../../services/ejercicioService';
import diasService from '../../services/diasService';

const RutinaFormEntrenador = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  const [dias, setDias] = useState([]);
  
  const [rutina, setRutina] = useState({
    nombre: '',
    descripcion: '',
    duracionsemanas: 4,
    activo: true
  });
  
  const [ejerciciosRutina, setEjerciciosRutina] = useState([]);
  
  const [showAgregarEjercicio, setShowAgregarEjercicio] = useState(false);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    iddia: '',
    idejercicio: '',
    series: 3,
    repeticiones: '10',
    pesosugerido: '',
    descansosegundos: 60,
    orden: 1
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate, id]);

  const loadData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [ejerciciosData, diasData] = await Promise.all([
        ejercicioService.getAll(),
        diasService.getAll()
      ]);
      setEjerciciosCatalogo(Array.isArray(ejerciciosData) ? ejerciciosData : []);
      setDias(Array.isArray(diasData) ? diasData : []);

      if (isEdit) {
        const rutinaData = await rutinaService.getById(parseInt(id));
        if (rutinaData) {
          setRutina({
            nombre: rutinaData.nombre || '',
            descripcion: rutinaData.descripcion || '',
            duracionsemanas: rutinaData.duracionsemanas || 4,
            activo: rutinaData.activo !== undefined ? rutinaData.activo : true
          });
          
          const ejercicios = await rutinaService.getEjerciciosByRutina(parseInt(id));
          setEjerciciosRutina(Array.isArray(ejercicios) ? ejercicios : []);
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRutina({
      ...rutina,
      [name]: name === 'duracionsemanas' ? parseInt(value) || 0 : value
    });
  };

  const handleEjercicioChange = (e) => {
    const { name, value } = e.target;
    setNuevoEjercicio({
      ...nuevoEjercicio,
      [name]: name === 'series' || name === 'descansosegundos' || name === 'orden' 
        ? parseInt(value) || 0 
        : name === 'pesosugerido' 
          ? parseFloat(value) || 0 
          : value
    });
  };

  const agregarEjercicio = () => {
    if (!nuevoEjercicio.idejercicio) {
      setError('Selecciona un ejercicio');
      return;
    }
    if (!nuevoEjercicio.iddia) {
      setError('Selecciona un día');
      return;
    }

    const existe = ejerciciosRutina.some(e => 
      e.idejercicio === parseInt(nuevoEjercicio.idejercicio) && 
      e.iddia === parseInt(nuevoEjercicio.iddia)
    );
    if (existe) {
      setError('Este ejercicio ya está agregado para ese día');
      return;
    }

    setEjerciciosRutina([
      ...ejerciciosRutina,
      {
        ...nuevoEjercicio,
        idejercicio: parseInt(nuevoEjercicio.idejercicio),
        iddia: parseInt(nuevoEjercicio.iddia),
        id: `temp_${Date.now()}`,
        _temp: true
      }
    ]);
    
    setShowAgregarEjercicio(false);
    setNuevoEjercicio({
      iddia: '',
      idejercicio: '',
      series: 3,
      repeticiones: '10',
      pesosugerido: '',
      descansosegundos: 60,
      orden: ejerciciosRutina.length + 1
    });
    setError('');
  };

  const eliminarEjercicio = (index) => {
    setEjerciciosRutina(ejerciciosRutina.filter((_, i) => i !== index));
  };

  const guardarRutina = async () => {
    if (!rutina.nombre.trim()) {
      setError('El nombre de la rutina es obligatorio');
      return;
    }
    if (ejerciciosRutina.length === 0) {
      setError('Agrega al menos un ejercicio a la rutina');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const rutinaData = {
        ...rutina,
        idusuario: user.idusuario
      };

      let rutinaId;
      if (isEdit) {
        await rutinaService.update(parseInt(id), rutinaData);
        rutinaId = parseInt(id);
      } else {
        const response = await rutinaService.create(rutinaData);
        rutinaId = response.idrutina;
      }

      for (const ej of ejerciciosRutina) {
        if (!ej._temp && ej.id) {
          await rutinaService.removeEjercicio(ej.id);
        }
      }

      for (const ej of ejerciciosRutina) {
        await rutinaService.addEjercicio({
          idrutina: rutinaId,
          iddia: ej.iddia,
          idejercicio: ej.idejercicio,
          series: ej.series,
          repeticiones: ej.repeticiones,
          pesosugerido: ej.pesosugerido || null,
          descansosegundos: ej.descansosegundos || null,
          orden: ej.orden || 0
        });
      }

      setSuccess(isEdit ? 'Rutina actualizada correctamente' : 'Rutina creada correctamente');
      
      setTimeout(() => {
        navigate('/entrenador/rutinas');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la rutina');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-20">
      
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-orange-500/10 via-[#111625]/50 to-[#111625] border border-orange-500/20">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/entrenador/rutinas')}
              className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all hover:bg-orange-500/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-400" />
                {isEdit ? 'Editar Rutina' : 'Nueva Rutina'}
                <span className="text-xs font-mono text-[#9A9AA0] font-normal ml-2">
                  {isEdit ? '✏️ Modifica los datos' : '✨ Crea una nueva'}
                </span>
              </h1>
              <p className="text-[#9A9AA0] text-xs font-mono mt-0.5">
                {isEdit ? 'Actualiza los ejercicios y detalles de la rutina' : 'Diseña una rutina personalizada para tus clientes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-3 py-1 rounded-full ${
              rutina.activo 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {rutina.activo ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* FORMULARIO */}
      <div className="bg-gradient-to-br from-[#111625]/50 to-[#0A0A0B]/50 border border-orange-500/10 rounded-2xl p-5 md:p-6 hover:border-orange-500/20 transition-all">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h2 className="text-white text-sm font-bold">Información de la Rutina</h2>
          <span className="text-[#9A9AA0] text-[10px] font-mono">Datos básicos</span>
        </div>
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Nombre de la Rutina *
              </label>
              <input
                name="nombre"
                value={rutina.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Fuerza Básica, Hipertrofia, CrossFit..."
                className="w-full px-4 py-2.5 bg-[#0A0A0B]/70 border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-[#5C5C60]"
              />
            </div>
            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Duración (semanas)
              </label>
              <input
                type="number"
                name="duracionsemanas"
                value={rutina.duracionsemanas}
                onChange={handleInputChange}
                min="1"
                max="52"
                className="w-full px-4 py-2.5 bg-[#0A0A0B]/70 border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={rutina.descripcion}
              onChange={handleInputChange}
              placeholder="Describe los objetivos y características de la rutina..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0A0A0B]/70 border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none placeholder:text-[#5C5C60]"
            />
          </div>

          <div className="flex items-center gap-3 bg-[#0A0A0B]/50 rounded-xl px-4 py-2.5 border border-orange-500/10">
            <input
              type="checkbox"
              checked={rutina.activo}
              onChange={(e) => setRutina({...rutina, activo: e.target.checked})}
              className="w-4 h-4 accent-orange-500 rounded border-orange-500/30"
            />
            <label className="text-[#9A9AA0] text-sm font-medium cursor-pointer flex items-center gap-1">
              <Zap className="w-4 h-4 text-orange-400" />
              Rutina activa
            </label>
            <span className="text-[#5C5C60] text-[10px] font-mono ml-auto">Los clientes podrán ver esta rutina</span>
          </div>
        </div>
      </div>

      {/* EJERCICIOS DE LA RUTINA */}
      <div className="bg-gradient-to-br from-[#111625]/50 to-[#0A0A0B]/50 border border-orange-500/10 rounded-2xl p-5 md:p-6 hover:border-orange-500/20 transition-all">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h3 className="text-white text-sm font-bold">Ejercicios</h3>
            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-mono px-2 py-0.5 rounded-full">
              {ejerciciosRutina.length}
            </span>
          </div>
          <button
            onClick={() => setShowAgregarEjercicio(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition-all flex items-center gap-1 hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Ejercicio
          </button>
        </div>

        {ejerciciosRutina.length === 0 ? (
          <div className="text-center py-10 bg-[#0A0A0B]/30 rounded-xl border border-dashed border-orange-500/10">
            <Dumbbell className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
            <p className="text-[#9A9AA0] text-sm font-mono">No hay ejercicios agregados</p>
            <p className="text-[#5C5C60] text-xs font-mono mt-1">Agrega ejercicios para completar la rutina</p>
            <button
              onClick={() => setShowAgregarEjercicio(true)}
              className="mt-3 text-orange-400 text-sm hover:underline flex items-center gap-1 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar el primer ejercicio
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {ejerciciosRutina.map((ej, index) => {
              const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === ej.idejercicio);
              const dia = dias.find(d => d.iddia === ej.iddia);
              return (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-3 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl hover:bg-[#0A0A0B]/80 hover:border-orange-500/20 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate flex items-center gap-2">
                          {ejercicio?.nombre || 'Ejercicio desconocido'}
                          {dia && (
                            <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0">
                              <Calendar className="w-2.5 h-2.5" />
                              {dia.nombre}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono text-[#9A9AA0] flex-wrap mt-0.5">
                          <span className="flex items-center gap-0.5 bg-[#0A0A0B]/50 px-1.5 py-0.5 rounded">
                            <Hash className="w-3 h-3" />
                            {ej.series} series
                          </span>
                          <span className="flex items-center gap-0.5 bg-[#0A0A0B]/50 px-1.5 py-0.5 rounded">
                            <Repeat className="w-3 h-3" />
                            {ej.repeticiones} reps
                          </span>
                          {ej.pesosugerido > 0 && (
                            <span className="flex items-center gap-0.5 bg-[#0A0A0B]/50 px-1.5 py-0.5 rounded">
                              <Weight className="w-3 h-3" />
                              {ej.pesosugerido} kg
                            </span>
                          )}
                          {ej.descansosegundos > 0 && (
                            <span className="flex items-center gap-0.5 bg-[#0A0A0B]/50 px-1.5 py-0.5 rounded">
                              <Timer className="w-3 h-3" />
                              {ej.descansosegundos}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarEjercicio(index)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#9A9AA0] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar ejercicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => navigate('/entrenador/rutinas')}
          className="flex-1 px-5 py-3 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 hover:border-orange-500/30 transition-all text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={guardarRutina}
          disabled={loading}
          className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-[#0A0A0B] rounded-xl font-bold hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,107,53,0.15)] hover:shadow-[0_0_40px_rgba(255,107,53,0.25)]"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? 'Actualizar Rutina' : 'Crear Rutina'}
            </>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODAL AGREGAR EJERCICIO */}
      {/* ============================================================ */}
      {showAgregarEjercicio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-400" />
                Agregar Ejercicio
              </h2>
              <button
                onClick={() => setShowAgregarEjercicio(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#0A0A0B]/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Día *
                </label>
                <select
                  name="iddia"
                  value={nuevoEjercicio.iddia}
                  onChange={handleEjercicioChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                >
                  <option value="">Seleccionar día...</option>
                  {dias.map(d => (
                    <option key={d.iddia} value={d.iddia}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  Ejercicio *
                </label>
                <select
                  name="idejercicio"
                  value={nuevoEjercicio.idejercicio}
                  onChange={handleEjercicioChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                >
                  <option value="">Seleccionar ejercicio...</option>
                  {ejerciciosCatalogo.map(e => (
                    <option key={e.idejercicio} value={e.idejercicio}>
                      {e.nombre} {e.musculo ? `(${e.musculo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    Series
                  </label>
                  <input
                    type="number"
                    name="series"
                    value={nuevoEjercicio.series}
                    onChange={handleEjercicioChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5" />
                    Repeticiones
                  </label>
                  <input
                    name="repeticiones"
                    value={nuevoEjercicio.repeticiones}
                    onChange={handleEjercicioChange}
                    placeholder="10-12"
                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5" />
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="pesosugerido"
                    value={nuevoEjercicio.pesosugerido}
                    onChange={handleEjercicioChange}
                    step="0.5"
                    min="0"
                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Descanso (s)
                  </label>
                  <input
                    type="number"
                    name="descansosegundos"
                    value={nuevoEjercicio.descansosegundos}
                    onChange={handleEjercicioChange}
                    min="0"
                    step="5"
                    className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-orange-500/10">
                <button
                  onClick={() => setShowAgregarEjercicio(false)}
                  className="flex-1 px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarEjercicio}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-[#0A0A0B] rounded-xl font-medium hover:from-orange-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutinaFormEntrenador;