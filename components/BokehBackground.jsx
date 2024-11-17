import React, { useEffect, useRef } from 'react';

const BokehBackground = () => {
  const canvasRef = useRef(null);
  const bokehRef = useRef(null);

  useEffect(() => {
    const loadBokeh = async () => {
      try {
        // Importar dinámicamente el componente Bokeh1Background
        const { Bokeh1Background } = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.2/build/backgrounds/bokeh1.cdn.min.js');
        
        if (canvasRef.current) {
          // Inicializar el fondo bokeh
          bokehRef.current = Bokeh1Background(canvasRef.current);
          
          // Cargar el mapa de partículas
          bokehRef.current.loadMap('https://cdn.jsdelivr.net/npm/threejs-components@0.0.2/build/assets/bokeh-particles2.png');
          
          // Establecer los colores iniciales
          bokehRef.current.setColors([0x6d4862, 0xfd826c, 0x22ccc1]);
        }
      } catch (error) {
        console.error('Error loading Bokeh background:', error);
      }
    };

    loadBokeh();

    // Manejador de clic para cambiar colores
    const handleClick = () => {
      if (bokehRef.current) {
        bokehRef.current.setColors([
          0xffffff * Math.random(),
          0xffffff * Math.random(),
          0xffffff * Math.random()
        ]);
      }
    };

    document.body.addEventListener('click', handleClick);

    // Limpieza al desmontar
    return () => {
      document.body.removeEventListener('click', handleClick);
      if (bokehRef.current) {
        // Aquí podrías agregar cualquier limpieza necesaria del bokeh
        bokehRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden touch-pan-up text-white font-sans relative">
      <canvas 
        ref={canvasRef}
        className="block fixed top-0 w-full h-full -z-10"
      />
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-6xl uppercase font-bold"
            style={{
              textShadow: '0 0 5px #ffffff, 0 0 20px #000, 0 0 30px #000',
            }}>
          Bokeh background
        </h1>
      </div>
    </div>
  );
};

export default BokehBackground;
