"use client";

import dynamic from "next/dynamic";

// Importamos la App de forma dinámica para evitar problemas de hidratación con React Router en Next.js
const App = dynamic(() => import("../app"), { ssr: false });

export default function Page() {
  return <App />;
}
