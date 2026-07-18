// src/pages/entrenador/components/RegistrarEntrenamientoModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Dumbbell,
  Weight,
  Repeat,
  Timer,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  List,
  Hash
} from 'lucide-react';
import authService from '../../../services/authService';
import rutinaService from '../../../services/rutinaService';
import ejercicioService from '../../../services/ejercicioService';
import entrenamientoService from '../../../services/entrenamientoService';
import diasService from '../../../services/diasService';

const RegistrarEntrenamientoModal = ({ cliente, onClose, onRegistrado }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Datos principales
  const [rutinasAsignadas, setRutinasAsignadas] = useState([]);
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  const [dias, setDias] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [ejerciciosRutina, setEjerciciosRutina] = useState([]);
  const [diaActual, setDiaActual] = useState(null);

  // Fecha del entrenamiento
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Progreso de ejercicios
  const [progreso, setProgreso] = useState({});
  const [notas, setNotas] = useState('');

  // Estado de expansión
  const [ejerciciosExpandidos, setEjerciciosExpandidos] = useState({});

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    loadData();
  }, [cliente]);

  const loadData = async () => {
    setLoadingData(true);
    setError('');
    try {
      // 1. Obtener días
      const diasData = await diasService.getAll();
      setDias(Array.isArray(diasData) ? diasData : []);

      // 2. Obtener catálogo de ejercicios
      const ejerciciosData = await ejercicioService.getAll();
      setEjerciciosCatalogo(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // 3. Obtener rutinas asignadas al cliente
      const asignaciones = await rutinaService.getAsignacionesByCliente(cliente.identrenado);
      const activas = Array.isArray(asignaciones) 
        ? asignaciones.filter(a => a.activo === true)
        : [];
      setRutinasAsignadas(activas);

      // 4. Si hay rutinas activas, seleccionar la primera
      if (activas.length > 0) {
        const primera = activas[0];
        await cargarRutina(primera.idasignacion);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del cliente');
    } finally {
      setLoadingData(false);
    }
  };

  const cargarRutina = async (idAsignacion) => {
    try {
      // Obtener detalles de la rutina asignada
      const asignacion = rutinasAsignadas.find(a => a.idasignacion === idAsignacion);
      if (!asignacion) return;

      setRutinaSeleccionada(asignacion);

      // Obtener ejercicios de la rutina
      const ejercicios = await rutinaService.getEjerciciosByRutina(asignacion.idrutina);
      const ejerciciosArray = Array.isArray(ejercicios) ? ejercicios : [];
      setEjerciciosRutina(ejerciciosArray);

      // Determinar el día actual de la semana
      const hoy = new Date();
      const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ...
      const diaMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
      const diaActualId = diaMap[diaSemana];
      setDiaActual(diaActualId);

      // Inicializar progreso
      const progresoInicial = {};
      ejerciciosArray.forEach(ej => {
        const key = `ej_${ej.idrutinaejercicio}`;
        progresoInicial[key] = {
          idrutinaejercicio: ej.idrutinaejercicio,
          idejercicio: ej.idejercicio,
          realizado: false,
          peso: ej.pesosugerido || 0,
          repeticiones: ej.repeticiones || 0,
          series: ej.series || 0
        };
      });
      setProgreso(progresoInicial);

      // Inicializar expandidos
      const expandidos = {};
      ejerciciosArray.forEach(ej => {
        expandidos[ej.idrutinaejercicio] = true;
      });
      setEjerciciosExpandidos(expandidos);

    } catch (err) {
      console.error('Error al cargar rutina:', err);
      setError('Error al cargar la rutina');
    }
  };

  const getNombreEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getMusculoEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio?.musculo || null;
  };

  const getNombreDia = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const handleProgresoChange = (key, field, value) => {
    setProgreso({
      ...progreso,
      [key]: {
        ...progreso[key],
        [field]: field === 'realizado' ? value : parseFloat(value) || 0
      }
    });
  };

  const toggleExpandir = (id) => {
    setEjerciciosExpandidos({
      ...ejerciciosExpandidos,
      [id]: !ejerciciosExpandidos[id]
    });
  };

  const toggleTodosEjercicios = (realizado) => {
    const nuevoProgreso = {};
    Object.keys(progreso).forEach(key => {
      nuevoProgreso[key] = {
        ...progreso[key],
        realizado: realizado
      };
    });
    setProgreso(nuevoProgreso);
  };

  const handleGuardar = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verificar que hay ejercicios
      const ejerciciosRealizados = Object.values(progreso);
      if (ejerciciosRealizados.length === 0) {
        setError('No hay ejercicios para registrar');
        setLoading(false);
        return;
      }

      // Crear los entrenamientos (uno por ejercicio)
      const entrenamientos = ejerciciosRealizados.map(ej => ({
        idusuario: cliente.identrenado,
        idejercicio: ej.idejercicio,
        idasignacion: rutinaSeleccionada?.idasignacion || null,
        identrenador: user?.idusuario || null,
        repeticiones: ej.realizado ? ej.repeticiones : 0,
        peso: ej.realizado ? ej.peso : 0,
        fecha: fecha,
        completado: ej.realizado,
        notas: ej.realizado ? notas : 'No realizado'
      }));

      // Guardar cada entrenamiento
      for (const entreno of entrenamientos) {
        await entrenamientoService.create(entreno);
      }

      setSuccess('Entrenamiento registrado correctamente');
      
      setTimeout(() => {
        onRegistrado();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error al guardar entrenamiento:', err);
      setError(err.response?.data?.error || 'Error al guardar el entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const contarCompletados = () => {
    const values = Object.values(progreso);
    return values.filter(v => v.realizado === true).length;
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-2xl w-full p-6">
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando datos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-400" />
            Registrar Entrenamiento
          </h2>
          <button
            onClick={onClose}
            className="text-[#9A9AA0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Información del cliente */}
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg overflow-hidden">
              {cliente.nombre?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-white font-bold">{cliente.nombre} {cliente.apellido}</p>
              <p className="text-[#9A9AA0] text-xs font-mono">
                {cliente.correo || 'Sin correo'}
              </p>
            </div>
          </div>
        </div>

        {/* Selección de rutina */}
        {rutinasAsignadas.length > 0 ? (
          <div className="mb-4">
            <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
              Rutina a registrar
            </label>
            <select
              value={rutinaSeleccionada?.idasignacion || ''}
              onChange={(e) => cargarRutina(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              {rutinasAsignadas.map(a => (
                <option key={a.idasignacion} value={a.idasignacion}>
                  {a.rutina?.nombre || `Rutina #${a.idasignacion}`}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Este cliente no tiene rutinas activas
            </p>
          </div>
        )}

        {/* Fecha */}
        <div className="mb-4">
          <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Fecha del entrenamiento
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Día de la semana */}
        {diaActual && (
          <div className="mb-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Día de la semana: <span className="font-bold">{getNombreDia(diaActual)}</span>
            </p>
          </div>
        )}

        {/* Ejercicios */}
        {ejerciciosRutina.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <List className="w-4 h-4 text-orange-400" />
                Ejercicios ({contarCompletados()}/{ejerciciosRutina.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTodosEjercicios(true)}
                  className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors"
                >
                  Marcar todos
                </button>
                <button
                  onClick={() => toggleTodosEjercicios(false)}
                  className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {ejerciciosRutina
                .filter(ej => ej.iddia === diaActual)
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((ej) => {
                  const key = `ej_${ej.idrutinaejercicio}`;
                  const prog = progreso[key] || { realizado: false, peso: 0, repeticiones: 0, series: 0 };
                  const expandido = ejerciciosExpandidos[ej.idrutinaejercicio] !== false;
                  const nombre = getNombreEjercicio(ej.idejercicio);
                  const musculo = getMusculoEjercicio(ej.idejercicio);

                  return (
                    <div
                      key={ej.idrutinaejercicio}
                      className={`bg-[#0A0A0B]/50 border rounded-xl transition-all ${
                        prog.realizado 
                          ? 'border-green-500/30 bg-green-500/5' 
                          : 'border-orange-500/10 hover:border-orange-500/30'
                      }`}
                    >
                      {/* Header del ejercicio */}
                      <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleExpandir(ej.idrutinaejercicio)}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            prog.realizado 
                              ? 'border-green-500 bg-green-500/20 text-green-400' 
                              : 'border-[#5C5C60] text-[#5C5C60]'
                          }`}>
                            {prog.realizado ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-bold">{ejerciciosRutina.indexOf(ej) + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{nombre}</p>
                            <div className="flex items-center gap-2 text-xs font-mono text-[#9A9AA0]">
                              <span>{ej.series} series</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                              <span>{ej.repeticiones} reps</span>
                              {ej.pesosugerido > 0 && (
                                <>
                                  <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                                  <span>{ej.pesosugerido} kg</span>
                                </>
                              )}
                              {musculo && (
                                <>
                                  <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                                  <span className="text-orange-400">{musculo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono ${prog.realizado ? 'text-green-400' : 'text-[#9A9AA0]'}`}>
                            {prog.realizado ? 'Completado' : 'Pendiente'}
                          </span>
                          {expandido ? <ChevronUp className="w-4 h-4 text-[#9A9AA0]" /> : <ChevronDown className="w-4 h-4 text-[#9A9AA0]" />}
                        </div>
                      </div>

                      {/* Detalle del ejercicio */}
                      {expandido && (
                        <div className="px-3 pb-3 pt-1 border-t border-orange-500/5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[#9A9AA0] text-[10px] font-mono block">
                                <Weight className="w-3 h-3 inline mr-0.5" />
                                Peso (kg)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={prog.peso || ''}
                                onChange={(e) => handleProgresoChange(key, 'peso', e.target.value)}
                                className="w-full px-2 py-1.5 bg-[#0A0A0B] border border-orange-500/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/40"
                              />
                            </div>
                            <div>
                              <label className="text-[#9A9AA0] text-[10px] font-mono block">
                                <Repeat className="w-3 h-3 inline mr-0.5" />
                                Repeticiones
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={prog.repeticiones || ''}
                                onChange={(e) => handleProgresoChange(key, 'repeticiones', e.target.value)}
                                className="w-full px-2 py-1.5 bg-[#0A0A0B] border border-orange-500/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/40"
                              />
                            </div>
                            <div>
                              <label className="text-[#9A9AA0] text-[10px] font-mono block">
                                <Hash className="w-3 h-3 inline mr-0.5" />
                                Series
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={prog.series || ''}
                                onChange={(e) => handleProgresoChange(key, 'series', e.target.value)}
                                className="w-full px-2 py-1.5 bg-[#0A0A0B] border border-orange-500/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/40"
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 text-[#9A9AA0] text-xs font-mono cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={prog.realizado || false}
                                  onChange={(e) => handleProgresoChange(key, 'realizado', e.target.checked)}
                                  className="w-4 h-4 accent-green-500"
                                />
                                Realizado
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="mb-4">
          <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
            Notas del entrenamiento
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observaciones, comentarios, dificultades..."
            rows={2}
            className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2 border-t border-orange-500/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading || ejerciciosRutina.length === 0}
            className="flex-1 px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Registrar Entrenamiento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrarEntrenamientoModal;