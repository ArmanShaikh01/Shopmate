import { createClient } from '@/lib/supabase/server'
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { DeleteProductButton } from './delete-button'

export const revalidate = 0

export default async function InventoryPage() {
    // Force use of Service Role Key WITHOUT cookies to bypass RLS recursion
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-slate-500">Manage your products and stock levels.</p>
                </div>
                <Link href="/admin/inventory/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                    {product.name}
                                    {product.stock_quantity <= 5 && (
                                        <span className="ml-2 inline-flex items-center text-xs text-amber-600 font-normal">
                                            <AlertTriangle className="mr-1 h-3 w-3" /> Low Stock
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>
                                    <span className={product.stock_quantity <= 5 ? "text-amber-600 font-bold" : ""}>
                                        {product.stock_quantity}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {product.is_active ?
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge> :
                                        <Badge variant="secondary">Inactive</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Link href={`/admin/inventory/${product.id}`}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <DeleteProductButton id={product.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {products?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No products found. Add your first product!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
