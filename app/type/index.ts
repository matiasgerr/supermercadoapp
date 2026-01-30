// Este es el "contrato" de cómo lucen tus datos
export type CategoriaType = {
  id: number;
  name: string;
};

// Lo que vos querías hacer (Data englobada)
export type RegistroCompleto = {
  categoria: CategoriaType;
  comercios: unknown[];
};
