'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveProduct(formData: FormData) {
    const supabase = createClient()

    const id = formData.get('id') as string | null
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const stock_quantity = parseInt(formData.get('stock') as string)
    const is_active = formData.get('active') === 'on'

    const productData = {
        name,
        price,
        stock_quantity,
        is_active
    }

    if (id) {
        // Update
        const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)

        if (error) throw new Error(error.message)
    } else {
        // Insert
        const { error } = await supabase
            .from('products')
            .insert(productData)

        if (error) throw new Error(error.message)
    }

    revalidatePath('/admin/inventory')
    redirect('/admin/inventory')
}

export async function deleteProduct(formData: FormData) {
    const supabase = createClient()
    const id = formData.get('id') as string

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inventory')
}
