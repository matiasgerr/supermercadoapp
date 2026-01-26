import { useState } from 'react';
import {getComerciosPorCategoria} from './superbaseClient';
import { Comercio } from '../type/gestion';


const useComercioEdit = async (categoriaNombre: string) => {
    const [comercios, setComercios] = useState<Comercio[]>([]);

    try {
        const comercios = await getComerciosPorCategoria(categoriaNombre);
        setComercios(comercios);
    } catch (error) {
        console.error('Error fetching comercios:', error);
    }

}


