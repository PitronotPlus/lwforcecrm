import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        product_name: '',
        price: '',
        description: '',
        notes: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await base44.entities.Product.list('-created_date');
            setProducts(data);
        } catch (error) {
            console.error("שגיאה בטעינת מוצרים:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await base44.entities.Product.update(editingProduct.id, formData);
            } else {
                await base44.entities.Product.create(formData);
            }
            resetForm();
            loadProducts();
        } catch (error) {
            console.error("שגיאה בשמירת מוצר:", error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            product_name: product.product_name || '',
            price: product.price || '',
            description: product.description || '',
            notes: product.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('האם למחוק מוצר זה?')) {
            try {
                await base44.entities.Product.delete(id);
                loadProducts();
            } catch (error) {
                console.error("שגיאה במחיקת מוצר:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            product_name: '',
            price: '',
            description: '',
            notes: ''
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    const filteredProducts = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F5' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo' }}>טוען מוצרים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-[32px] font-bold" style={{ color: '#3568AE', fontFamily: 'Heebo' }}>
                        מוצרים
                    </h1>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                    >
                        <Plus className="ml-2 w-4 h-4" />
                        מוצר חדש
                    </Button>
                </div>

                <div className="relative max-w-sm mb-6">
                    <Input
                        placeholder="חיפוש מוצר..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {filteredProducts.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">אין מוצרים במערכת</p>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                            >
                                <Plus className="ml-2 w-4 h-4" />
                                צור מוצר ראשון
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{product.product_name}</span>
                                        <span className="text-[#67BF91] text-lg">₪{product.price}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {product.description && (
                                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                                    )}
                                    {product.notes && (
                                        <p className="text-xs text-gray-500 mb-3 pt-3 border-t">
                                            <strong>הערות:</strong> {product.notes}
                                        </p>
                                    )}
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(product)}
                                        >
                                            <Edit className="w-4 h-4 ml-1" />
                                            ערוך
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 ml-1" />
                                            מחק
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle style={{ fontFamily: 'Heebo' }}>
                                {editingProduct ? 'עריכת מוצר' : 'מוצר חדש'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">שם המוצר *</label>
                                <Input
                                    placeholder="שם המוצר"
                                    value={formData.product_name}
                                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">מחיר *</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">פירוט</label>
                                <Textarea
                                    placeholder="תיאור המוצר..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">הערות</label>
                                <Textarea
                                    placeholder="הערות נוספות..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    {editingProduct ? 'עדכן' : 'צור'} מוצר
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    ביטול
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}