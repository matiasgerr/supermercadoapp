import { useState } from 'react';
import { supabase } from './superbaseClient';

// Este es un "Custom Hook". 
// Piensa en él como una herramienta que puedes enchufar en cualquier componente
// para darle la habilidad de eliminar comercios.
export const useDeleteComercio = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Esta es la función que tu componente llamará cuando el usuario haga click en "Eliminar"
    // Recibe el ID, porque es la única forma segura de decirle a la base de datos CUAL borrar.
    const deleteComercio = async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Confirmación simple (opcional, pero recomendada)
            const confirmado = window.confirm("¿Estás seguro de eliminar este comercio? Esta acción no se puede deshacer.");
            if (!confirmado) {
                setLoading(false);
                return false; // El usuario canceló
            }

            // 2. Llamada a Supabase
            // "Borra de la tabla 'comercios' donde la columna 'id' sea igual al id que te paso"
            const { error: supabaseError } = await supabase
                .from('comercios')
                .delete()
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            return true; // Éxito

        } catch (err: unknown) {
            console.error("Error al eliminar:", err);
            setError(err instanceof Error ? err.message : String(err));
            return false; // Falló
        } finally {
            setLoading(false);
        }
    };

    // Devolvemos la función y los estados para que el componente los use
    return { 
        deleteComercio, 
        loading, 
        error 
    };
};
