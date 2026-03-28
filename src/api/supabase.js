import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para obtener productos (READ del CRUD)
export const getProductos = async () => {
  const { data, error } = await supabase
    .from('inventario')
    .select('*')
    .order('nombre_producto', { ascending: true })
  
  if (error) throw error
  return data
}

// Función para actualizar Stock o Precio (UPDATE del CRUD)
export const updateProducto = async (id, updates) => {
  const { data, error } = await supabase
    .from('inventario')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
  return data
}