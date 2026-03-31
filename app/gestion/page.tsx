"use client";

import { useState } from "react";
import Dashboard from "../screen/dashboard/Dashboard";
import type { Comercio } from "../type/gestion";

export default function GestionPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);

  return <Dashboard comercios={comercios} setComercios={setComercios} />;
}
