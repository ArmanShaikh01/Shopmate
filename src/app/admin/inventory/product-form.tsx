'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveProduct } from './actions'

// We need to pass initial data for Edit mode
export default function ProductForm({ product }: { product?: any }) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={saveProduct} className="space-y-6">
                    {product && <input type="hidden" name="id" value={product.id} />}

                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" defaultValue={product?.name} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={product?.price || ''}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Current Stock</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                defaultValue={product?.stock_quantity || 0}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            defaultChecked={product ? product.is_active : true}
                        />
                        <Label htmlFor="active">Available for Sale</Label>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        {/* Cancel could be a link back */}
                        <Button type="submit">Save Product</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
