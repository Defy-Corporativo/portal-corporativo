import { supabase } from './supabaseClient';

/**
 * Buscar todos os portais ativos ordenados por categoria e order_index
 * Categoria 'internal' vem primeiro, depois 'external'
 */
export const getPortals = async () => {
    const { data, error } = await supabase
        .from('prtc_portals')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true }) // 'internal' comes before 'external' alphabetically
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching portals:', error);
        throw error;
    }
    return data || [];
};

/**
 * Buscar todos os portais (incluindo inativos) para administração
 */
export const getAllPortals = async () => {
    const { data, error } = await supabase
        .from('prtc_portals')
        .select('*')
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching all portals:', error);
        throw error;
    }
    return data || [];
};

/**
 * Criar um novo portal
 */
export const createPortal = async (portal) => {
    // Buscar o maior order_index da categoria para colocar o novo portal no final
    const { data: existing } = await supabase
        .from('prtc_portals')
        .select('order_index')
        .eq('category', portal.category || 'internal')
        .order('order_index', { ascending: false })
        .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

    const { data, error } = await supabase
        .from('prtc_portals')
        .insert({
            ...portal,
            category: portal.category || 'internal',
            order_index: nextOrder,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating portal:', error);
        throw error;
    }
    return data;
};

/**
 * Atualizar um portal existente
 */
export const updatePortal = async (id, updates) => {
    const { data, error } = await supabase
        .from('prtc_portals')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating portal:', error);
        throw error;
    }
    return data;
};

/**
 * Excluir um portal
 */
export const deletePortal = async (id) => {
    const { error } = await supabase
        .from('prtc_portals')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting portal:', error);
        throw error;
    }
    return true;
};

/**
 * Reordenar portais (atualizar order_index de múltiplos portais)
 */
export const reorderPortals = async (orderedIds) => {
    const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index,
        updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
        const { error } = await supabase
            .from('prtc_portals')
            .update({ order_index: update.order_index, updated_at: update.updated_at })
            .eq('id', update.id);

        if (error) {
            console.error('Error reordering portals:', error);
            throw error;
        }
    }

    return true;
};
