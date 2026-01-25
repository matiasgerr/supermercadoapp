"use client";

import React, { useState, useEffect } from 'react';
import Selector from './components/Selector';
import PanelGestion from './components/Gestion';

function App() {
  // 1. ESTADO DE LOS DATOS: Aquí se guardan todos tus supermercados y productos
  const [comercios, setComercios] = useState(() => {
    // Intentamos buscar si ya había algo guardado en la "mochila" del navegador
    const guardado = localStorage.getItem('mis-datos-compras');
    return guardado ? JSON.parse(guardado) : []; // Si no hay nada, empezamos con lista vacía []
  });

  // 2. ESTADO DE NAVEGACIÓN: Para saber qué pantalla mostrar
  const [vistaActual, setVistaActual] = useState('inicio'); // Puede ser 'inicio' o 'gestion'
  
  // 3. ESTADO DE CATEGORÍA: Para saber si el usuario hizo clic en "Farmacia", "Super", etc.
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // 4. EFECTO: Cada vez que 'comercios' cambie, lo guardamos en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  // Lógica para decidir qué componente renderizar
  return (
    <div className="min-h-screen bg-gray-100">
      {vistaActual === 'inicio' ? (
        <Selector
          setVista={setVistaActual}
          setCategoria={setCategoriaSeleccionada}
        />
      ) : (
        <PanelGestion
          categoria={categoriaSeleccionada}
          setCategoria={setCategoriaSeleccionada}
          comercios={comercios}
          setComercios={setComercios}
        />
      )}
    </div>
  );
}

export default App;