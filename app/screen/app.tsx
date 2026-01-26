"use client";

import React, { useState, useEffect } from 'react';
import Selector from '../components/Selector';
import PanelGestion from '../components/Gestion';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const [comercios, setComercios] = useState<any[]>([]);
  // 1. ESTADO DE LOS DATOS: Cargar desde localStorage sólo en el cliente
  useEffect(() => {
    const guardado = localStorage.getItem('mis-datos-compras');
    if (guardado) setComercios(JSON.parse(guardado));
  }, []);

  // Guardar cada vez que cambien los comercios
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  // 2. ESTADO DE NAVEGACIÓN: Para saber qué pantalla mostrar
  const [vistaActual, setVistaActual] = useState('inicio'); // Puede ser 'inicio' o 'gestion'
  
  // 3. ESTADO DE CATEGORÍA: Para saber si el usuario hizo clic en "Farmacia", "Super", etc.
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // 4. EFECTO: Cada vez que 'comercios' cambie, lo guardamos en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem('mis-datos-compras', JSON.stringify(comercios));
  }, [comercios]);

  // Route wrapper that navigates and passes props
  const InicioRoute: React.FC = () => {
    const navigate = useNavigate();
    return (
      <Selector
        setCategoria={(c) => setCategoriaSeleccionada(c)}
        setVista={(v) => { if (v === 'gestion') navigate('/gestion'); }}
      />
    );
  };

  const GestionRoute: React.FC = () => {
    const navigate = useNavigate();
    return (
      <PanelGestion
        categoria={categoriaSeleccionada}
        setCategoria={(c) => setCategoriaSeleccionada(c)}
        comercios={comercios}
        setComercios={setComercios}
      />
    );
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<InicioRoute />} />
          <Route path="/inicio" element={<InicioRoute />} />
          <Route path="/gestion" element={<GestionRoute />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;