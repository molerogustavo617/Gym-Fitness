// src/pages/cliente/DietaCliente.jsx
import React from 'react';

const DietaCliente = () => {
  // Cambiamos los emojis por indicadores de código limpios y minimalistas
  const planAlimenticio = [
    {
      id: 1,
      comida: 'Desayuno',
      hora: '07:00 AM',
      codigoIcono: 'MT-01', // Identificador de comida tipo terminal
      detalles: '4 claras de huevo + 2 huevos enteros revueltos, 100g de avena en hojuelas cocida con agua y 1 cambur (banano).',
      macros: { proteinas: '35g', carbohidratos: '60g', grasas: '14g' }
    },
    {
      id: 2,
      comida: 'Almuerzo',
      hora: '12:30 PM',
      codigoIcono: 'MT-02',
      detalles: '150g de pechuga de pollo a la plancha, 200g de arroz blanco cocido y 100g de brócoli o vegetales al vapor.',
      macros: { proteinas: '40g', carbohidratos: '55g', grasas: '5g' }
    },
    {
      id: 3,
      comida: 'Merienda (Post-Entreno)',
      hora: '05:00 PM',
      codigoIcono: 'MT-03',
      detalles: '1 scoop de proteína de suero (whey protein) o 150g de yogurt griego natural con un puñado de almendras (30g).',
      macros: { proteinas: '25g', carbohidratos: '10g', grasas: '8g' }
    },
    {
      id: 4,
      comida: 'Cena',
      hora: '08:30 PM',
      codigoIcono: 'MT-04',
      detalles: '150g de filete de pescado blanco o carne magra de res, 150g de batata (camote) al horno y ensalada verde libre con una cucharadita de aceite de oliva.',
      macros: { proteinas: '35g', carbohidratos: '40g', grasas: '9g' }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gym-white tracking-tight">MI PLAN ALIMENTICIO</h2>
        <p className="text-gym-gray-light text-xs font-mono">Sigue tu guía de nutrición personalizada para optimizar tus resultados</p>
      </div>

      {/* CRONOGRAMA DE COMIDAS */}
      <div className="space-y-4">
        {planAlimenticio.map((item) => (
          <div 
            key={item.id} 
            className="card border-gym-neon/10 bg-gym-dark-secondary/30 backdrop-blur-md p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gym-neon/20 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              {/* Contenedor del icono transformado a indicador de código cyberpunk */}
              <span className="text-xs font-mono text-gym-neon bg-gym-neon/5 border border-gym-neon/20 w-12 h-12 rounded-xl flex items-center justify-center tracking-wider select-none shrink-0">
                {item.codigoIcono}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-gym-white font-bold text-base uppercase font-mono">{item.comida}</h3>
                  <span className="text-[10px] font-mono text-gym-neon bg-gym-neon/10 px-2 py-0.5 rounded border border-gym-neon/20">
                    {item.hora}
                  </span>
                </div>
                <p className="text-gym-gray-light text-sm mt-1 font-sans leading-relaxed">
                  {item.detalles}
                </p>
              </div>
            </div>

            {/* MACRONUTRIENTES */}
            <div className="flex gap-2 font-mono text-xs border-t border-gym-neon/5 pt-3 md:border-t-0 md:pt-0">
              <div className="bg-gym-dark-secondary p-2 rounded-xl border border-gym-neon/5 min-w-[70px] text-center">
                <span className="block text-[10px] text-gym-gray uppercase font-bold">Prot</span>
                <span className="text-gym-white font-black">{item.macros.proteinas}</span>
              </div>
              <div className="bg-gym-dark-secondary p-2 rounded-xl border border-gym-neon/5 min-w-[70px] text-center">
                <span className="block text-[10px] text-gym-gray uppercase font-bold">Carbs</span>
                <span className="text-gym-neon font-black">{item.macros.carbohidratos}</span>
              </div>
              <div className="bg-gym-dark-secondary p-2 rounded-xl border border-gym-neon/5 min-w-[70px] text-center">
                <span className="block text-[10px] text-gym-gray uppercase font-bold">Grasas</span>
                <span className="text-gym-white font-black">{item.macros.grasas}</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default DietaCliente;