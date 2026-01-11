import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CustomObject() {
    const [searchParams] = useSearchParams();
    const objectId = searchParams.get('id');
    
    const [object, setObject] = useState(null);
    const [sections, setSections] = useState([]);
    const [fields, setFields] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        if (objectId) {
            loadObjectData();
        }
    }, [objectId]);

    const loadObjectData = async () => {
        try {
            const [objectData, sectionsData, fieldsData] = await Promise.all([
                base44.entities.SystemObject.get(objectId),
                base44.entities.ObjectSection.filter({ object_id: objectId }),
                base44.entities.ObjectField.filter({ object_id: objectId })
            ]);
            
            setObject(objectData);
            setSections(sectionsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setFields(fieldsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            
            // פתח את כל המקטעים כברירת מחדל
            const expanded = {};
            sectionsData.forEach(s => expanded[s.id] = true);
            setExpandedSections(expanded);
        } catch (error) {
            console.error('שגיאה בטעינת נתוני הדף:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3568AE] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">טוען...</p>
                </div>
            </div>
        );
    }

    if (!object) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="text-center py-8">
                    <p className="text-gray-500">דף לא נמצא</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: object.color || '#3568AE' }}>
                            <span className="text-white text-xl">📄</span>
                        </div>
                        <div>
                            <h1 
                                className="text-3xl font-bold"
                                style={{ 
                                    color: '#3568AE',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                {object.object_name}
                            </h1>
                            {object.description && (
                                <p className="text-gray-500 text-sm">{object.description}</p>
                            )}
                        </div>
                    </div>
                    
                    <CreateRecordModal 
                        object={object}
                        sections={sections}
                        fields={fields}
                        onRecordCreated={loadObjectData}
                    >
                        <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            <Plus className="w-5 h-5 ml-2" />
                            הוסף {object.object_name_singular}
                        </Button>
                    </CreateRecordModal>
                </div>

                {/* View Template */}
                <Card>
                    <CardHeader>
                        <CardTitle style={{ fontFamily: 'Heebo' }}>
                            תצוגת הדף - {object.object_name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {sections.map(section => {
                                const sectionFields = fields.filter(f => f.section_id === section.id);
                                const isExpanded = expandedSections[section.id];
                                
                                return (
                                    <div key={section.id} className="border rounded-lg p-4">
                                        <div 
                                            className="flex items-center justify-between mb-4 cursor-pointer"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Heebo' }}>
                                                {section.section_name}
                                            </h3>
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {sectionFields.map(field => (
                                                    <FieldPreview key={field.id} field={field} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {sections.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>אין מקטעים מוגדרים עדיין</p>
                                <p className="text-sm mt-2">עבור לסטודיו דפים כדי להגדיר מקטעים ושדות</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function FieldPreview({ field }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
                {field.field_label}
                {field.is_required && <span className="text-red-500">*</span>}
                {field.is_read_only && <span className="text-xs text-gray-500">(לקריאה בלבד)</span>}
            </label>
            
            {field.field_type === 'textarea' && (
                <Textarea 
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    className="text-right"
                />
            )}
            
            {field.field_type === 'select' && (
                <Select disabled={field.is_read_only}>
                    <SelectTrigger>
                        <SelectValue placeholder={`בחר ${field.field_label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.select_options || []).map((option, idx) => (
                            <SelectItem key={idx} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            
            {field.field_type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        disabled={field.is_read_only}
                        className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">{field.field_label}</span>
                </div>
            )}
            
            {!['textarea', 'select', 'checkbox'].includes(field.field_type) && (
                <Input
                    type={field.field_type}
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    defaultValue={field.default_value || ''}
                    className="text-right"
                />
            )}
            
            {field.is_tracked && (
                <p className="text-xs text-gray-400">השדה מעוקב לשינויים</p>
            )}
        </div>
    );
}

function CreateRecordModal({ object, sections, fields, onRecordCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        // כאן תתווסף הלוגיקה לשמירת הרשומה במסד הנתונים
        alert('פיצ׳ר זה בפיתוח - יאפשר שמירת רשומות חדשות');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        הוסף {object.object_name_singular} חדש
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {sections.map(section => {
                        const sectionFields = fields.filter(f => f.section_id === section.id);
                        
                        return (
                            <div key={section.id} className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-4" style={{ fontFamily: 'Heebo' }}>
                                    {section.section_name}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sectionFields.map(field => (
                                        <FieldPreview key={field.id} field={field} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            שמור
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}