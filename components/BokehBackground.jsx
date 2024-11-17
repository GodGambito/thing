import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const BokehBackground = () => {
  const canvasRef = useRef(null);
  const bokehRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones del estado tras el desmontaje

    const loadBokeh = async () => {
      try {
        const { Bokeh1Background } = await import('/src/assets/js/bokeh1.cdn.min.js');
        if (canvasRef.current && isMounted) {
          // Inicializar Bokeh
          bokehRef.current = Bokeh1Background(canvasRef.current);
          bokehRef.current.loadMap('/src/assets/bokeh-particles2.png');
          bokehRef.current.setColors([0x6d4862, 0xfd826c, 0x22ccc1]);
          setIsLoading(false); // Fondo cargado
        }
      } catch (error) {
        console.error('Error loading Bokeh background:', error);
      }
    };

    loadBokeh();

    const handleClick = () => {
      if (bokehRef.current) {
        bokehRef.current.setColors([
          0xffffff * Math.random(),
          0xffffff * Math.random(),
          0xffffff * Math.random(),
        ]);
      }
    };

    document.body.addEventListener('click', handleClick);

    return () => {
      isMounted = false; // Evita actualizaciones del estado tras desmontar
      document.body.removeEventListener('click', handleClick);
      if (bokehRef.current) {
        // Limpia el recurso de bokeh si tiene métodos disponibles
        bokehRef.current.destroy?.();
        bokehRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-hidden text-white font-sans relative"
      role="presentation"
      aria-label="Bokeh Background Animation"
    >
      {/* Canvas para el fondo */}
      <canvas
        ref={canvasRef}
        className="block fixed top-0 w-full h-full -z-10"
        style={{
          pointerEvents: isLoading ? 'none' : 'auto',
        }}
      />

      {/* Botón de navegación */}
      <div className="absolute top-4 w-full flex justify-center">
        <Link
          to="/"
          className="bg-black/50 hover:bg-black/70 text-white py-2 px-4 rounded-md shadow-md transition-all"
          style={{
            textShadow: '0 0 5px rgba(255,255,255,0.8)',
          }}
        >
          Inicio
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="flex justify-center items-center min-h-screen">
        {isLoading ? (
          <p className="text-4xl font-medium">Loading...</p>
        ) : (
          <h1
            className="text-6xl uppercase font-bold"
            style={{
              textShadow: '0 0 5px #ffffff, 0 0 20px #000, 0 0 30px #000',
            }}
          >
            Bokeh Background
          </h1>
        )}
      </div>
    </div>
  );
};

export default BokehBackground;
