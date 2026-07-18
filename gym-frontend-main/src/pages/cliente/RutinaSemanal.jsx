// src/pages/cliente/RutinaSemanal.jsx
import React, { useState } from 'react';

const RutinaSemanal = () => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const [diaActivo, setDiaActivo] = useState('Lunes');

  // Datos mockeados de ejemplo (luego los conectarás con tu base de datos mediante axios)
  const rutinasEjemplo = {
    Lunes: { Enfoque: 'Pecho y Tríceps', Ejercicios: [
      { nombre: 'Press de Banca Inclinado', series: 4, reps: '12-10-8-6', descanso: '90s' },
      { nombre: 'Aperturas con Mancuernas', series: 3, reps: '12', descanso: '60s' },
      { nombre: 'Fondos en Paralelas', series: 3, reps: 'Fallo', descanso: '90s' },
      { nombre: 'Extensiones de Tríceps en Polea', series: 4, reps: '12', descanso: '60s' }
    ]},
    Martes: { Enfoque: 'Espalda y Bíceps', Ejercicios: [
      { nombre: 'Dominadas', series: 4, reps: 'Al fallo', descanso: '90s' },
      { nombre: 'Remo con Barra', series: 4, reps: '10', descanso: '90s' },
      { nombre: 'Pulldown al Pecho', series: 3, reps: '12', descanso: '60s' },
      { nombre: 'Curl de Bíceps con Barra Z', series: 4, reps: '10', descanso: '60s' }
    ]},
    Miércoles: { Enfoque: 'Pierna Completa', Ejercicios: [
      { nombre: 'Sentadillas Libres', series: 4, reps: '10-8-8-6', descanso: '120s' },
      { nombre: 'Prensa 45 Grados', series: 3, reps: '12', descanso: '90s' },
      { nombre: 'Extensiones de Cuádriceps', series: 4, reps: '15', descanso: '60s' },
      { nombre: 'Curl Femoral Tumbado', series: 4, reps: '12', descanso: '60s' }
    ]},
    Jueves: { Enfoque: 'Hombros y Trapecio', Ejercicios: [
      { nombre: 'Press Militar con Barra', series: 4, reps: '10-8-8-6', descanso: '90s' },
      { nombre: 'Elevaciones Laterales', series: 4, reps: '15', descanso: '60s' },
      { nombre: 'Pájaros en Polea', series: 3, reps: '12', descanso: '60s' },
      { nombre: 'Encogimientos con Mancuerna', series: 4, reps: '12', descanso: '60s' }
    ]},
    Viernes: { Enfoque: 'Brazo y Core', Ejercicios: [
      { nombre: 'Curl Martillo', series: 3, reps: '12', descanso: '60s' },
      { nombre: 'Press Francés', series: 3, reps: '10', descanso: '60s' },
      { nombre: 'Curl Concentrado', series: 3, reps: '12', descanso: '60s' },
      { nombre: 'Plancha Abdominal', series: 4, reps: '60s', descanso: '45s' }
    ]}
  };

  const rutinaHoy = rutinasEjemplo[diaActivo];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gym-white tracking-tight">MI RUTINA SEMANAL</h2>
        <p className="text-gym-gray-light text-xs font-mono">Visualiza los bloques de entrenamiento asignados por tu entrenador</p>
      </div>

      {/* SELECTOR DE DÍAS (PESTÁNAS CYBERPUNK) */}
      <div className="flex flex-wrap gap-2 border-b border-gym-neon/10 pb-3">
        {dias.map((dia) => (
          <button
            key={dia}
            onClick={() => setDiaActivo(dia)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all duration-300 ${
              diaActivo === dia
                ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/30 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                : 'text-gym-gray border border-transparent hover:text-gym-white hover:bg-gym-dark-secondary/50'
            }`}
          >
            {dia}
          </button>
        ))}
      </div>

      {/* DETALLES DEL DÍA */}
      <div className="card border-gym-neon/10 bg-gym-dark-secondary/30 backdrop-blur-md p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-gym-neon/5 pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-gym-gray font-bold">Enfoque del Día:</span>
          <span className="text-gym-neon text-sm font-black font-mono tracking-wide uppercase bg-gym-neon/5 px-3 py-1 rounded-lg border border-gym-neon/10">
            {rutinaHoy.Enfoque}
          </span>
        </div>

        {/* TABLA DE EJERCICIOS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead>
              <tr className="text-gym-gray text-xs border-b border-gym-neon/5">
                <th className="pb-3 font-bold uppercase tracking-wider">Ejercicio</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-center">Series</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-center">Reps</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-right">Descanso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-neon/5">
              {rutinaHoy.Ejercicios.map((ej, index) => (
                <tr key={index} className="hover:bg-gym-neon/5 transition-colors group">
                  <td className="py-3.5 text-gym-white font-sans font-bold group-hover:text-gym-neon transition-colors">
                    {ej.nombre}
                  </td>
                  <td className="py-3.5 text-center text-gym-gray-light font-bold">{ej.series}</td>
                  <td className="py-3.5 text-center text-gym-neon/90 font-bold">{ej.reps}</td>
                  <td className="py-3.5 text-right text-gym-gray">{ej.descanso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RutinaSemanal;