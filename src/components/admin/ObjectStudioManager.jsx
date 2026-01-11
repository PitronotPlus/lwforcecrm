import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileText, ChevronDown, ChevronUp, Settings as SettingsIcon } from "lucide-react";

export default function ObjectStudioManager() {
    const [objects, setObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState(null);

    useEffect(() => {
        loadObjects();
    }, []);

    const loadObjects = async () => {
        try {
            const data = await base44.entities.SystemObject.list('object_name');
            setObjects(data);
        } catch (error) {
            console.error('שגיאה בטעינת דפים:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteObject = async (objectId) => {
        if (!confirm('האם אתה בטוח שברצונך למחוק דף זה? כל המקטעים והשדות הקשורים יימחקו גם כן.')) {
            return;
        }
        
        try {
            // מחק קודם את כל השדות והמקטעים
            const sections = await base44.entities.ObjectSection.filter({ object_id: objectId });
            const fields = await base44.entities.ObjectField.filter({ object_id: objectId });
            
            for (const field of fields) {
                await base44.entities.ObjectField.delete(field.id);
            }
            
            for (const section of sections) {
                await base44.entities.ObjectSection.delete(section.id);
            }
            
            await base44.entities.SystemObject.delete(objectId);
            loadObjects();
        } catch (error) {
            console.error('שגיאה במחיקת דף:', error);
            alert('שגיאה במחיקת הדף');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle style={{ fontFamily: 'Heebo' }}>סטודיו דפים מותאמים אישית</CardTitle>
                    <CreateObjectModal onObjectCreated={loadObjects}>
                        <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            <Plus className="w-5 h-5 ml-2" />
                            דף חדש
                        </Button>
                    </CreateObjectModal>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-gray-500">טוען דפים...</p>
                    ) : objects.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">לא נמצאו דפים מותאמים אישית</p>
                            <CreateObjectModal onObjectCreated={loadObjects}>
                                <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                    <Plus className="w-5 h-5 ml-2" />
                                    צור דף ראשון
                                </Button>
                            </CreateObjectModal>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {objects.map(obj => (
                                <ObjectCard
                                    key={obj.id}
                                    object={obj}
                                    onEdit={() => setSelectedObject(obj)}
                                    onDelete={() => handleDeleteObject(obj.id)}
                                    onObjectUpdated={loadObjects}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedObject && (
                <ObjectEditorCard 
                    object={selectedObject}
                    onClose={() => setSelectedObject(null)}
                />
            )}
        </div>
    );
}

function ObjectCard({ object, onEdit, onDelete, onObjectUpdated }) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Heebo' }}>
                            {object.object_name}
                        </h3>
                        <p className="text-sm text-gray-500">{object.system_name}</p>
                    </div>
                    <Badge className={object.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {object.is_active ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                </div>
                
                {object.description && (
                    <p className="text-sm text-gray-600 mb-4">{object.description}</p>
                )}
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onEdit}
                        className="flex-1"
                    >
                        <SettingsIcon className="w-4 h-4 ml-2" />
                        ניהול מקטעים ושדות
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CreateObjectModal({ children, onObjectCreated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        object_name: '',
        object_name_singular: '',
        system_name: '',
        description: '',
        icon: 'FileText',
        color: '#3568AE',
        is_active: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await base44.entities.SystemObject.create(formData);
            onObjectCreated();
            setIsOpen(false);
            setFormData({
                object_name: '',
                object_name_singular: '',
                system_name: '',
                description: '',
                icon: 'FileText',
                color: '#3568AE',
                is_active: true
            });
        } catch (error) {
            console.error('שגיאה ביצירת דף:', error);
            alert('שגיאה ביצירת הדף');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>יצירת דף חדש</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם הדף (רבים) *</label>
                        <Input
                            required
                            value={formData.object_name}
                            onChange={(e) => setFormData({...formData, object_name: e.target.value})}
                            placeholder="לדוגמה: מתחרים"
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שם הדף (יחיד) *</label>
                        <Input
                            required
                            value={formData.object_name_singular}
                            onChange={(e) => setFormData({...formData, object_name_singular: e.target.value})}
                            placeholder="לדוגמה: מתחרה"
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שם מערכת (באנגלית) *</label>
                        <Input
                            required
                            value={formData.system_name}
                            onChange={(e) => setFormData({...formData, system_name: e.target.value})}
                            placeholder="לדוגמה: Competitor"
                            className="text-right"
                        />
                        <p className="text-xs text-gray-500 mt-1">שם ייחודי באנגלית ללא רווחים</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">תיאור</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="תיאור קצר של הדף..."
                            className="text-right"
                            rows={3}
                        />
                    </div>



                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            צור דף
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ObjectEditorCard({ object, onClose }) {
    const [sections, setSections] = useState([]);
    const [fields, setFields] = useState([]);
    const [columns, setColumns] = useState([]);
    const [activeTab, setActiveTab] = useState('fields');

    useEffect(() => {
        loadObjectData();
    }, [object.id]);

    const loadObjectData = async () => {
        try {
            const [sectionsData, fieldsData, columnsData] = await Promise.all([
                base44.entities.ObjectSection.filter({ object_id: object.id }),
                base44.entities.ObjectField.filter({ object_id: object.id }),
                base44.entities.ObjectColumn.filter({ object_id: object.id })
            ]);
            setSections(sectionsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setFields(fieldsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setColumns(columnsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        } catch (error) {
            console.error('שגיאה בטעינת נתוני הדף:', error);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!confirm('האם למחוק את המקטע מהסיידבר?')) return;
        
        try {
            await base44.entities.ObjectSection.delete(sectionId);
            loadObjectData();
        } catch (error) {
            console.error('שגיאה במחיקת מקטע:', error);
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!confirm('האם למחוק את השדה?')) return;
        
        try {
            await base44.entities.ObjectField.delete(fieldId);
            loadObjectData();
        } catch (error) {
            console.error('שגיאה במחיקת שדה:', error);
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (!confirm('האם למחוק את העמודה?')) return;
        
        try {
            await base44.entities.ObjectColumn.delete(columnId);
            loadObjectData();
        } catch (error) {
            console.error('שגיאה במחיקת עמודה:', error);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>
                    ניהול דף: {object.object_name}
                </CardTitle>
                <Button variant="outline" onClick={onClose}>
                    סגור
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Tabs */}
                <div className="flex gap-2 border-b pb-2">
                    <Button
                        variant={activeTab === 'fields' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('fields')}
                        className={activeTab === 'fields' ? 'bg-[#3568AE] text-white' : ''}
                    >
                        שדות הרשומה
                    </Button>
                    <Button
                        variant={activeTab === 'columns' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('columns')}
                        className={activeTab === 'columns' ? 'bg-[#3568AE] text-white' : ''}
                    >
                        עמודות רשימה
                    </Button>
                    <Button
                        variant={activeTab === 'sections' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('sections')}
                        className={activeTab === 'sections' ? 'bg-[#3568AE] text-white' : ''}
                    >
                        מקטעי סיידבר
                    </Button>
                </div>

                {/* שדות הרשומה */}
                {activeTab === 'fields' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Heebo' }}>שדות הרשומה</h3>
                                <p className="text-sm text-gray-500">הגדר את כל השדות שיהיו בטופס הוספה/עריכה</p>
                            </div>
                            <CreateFieldModal 
                                objectId={object.id}
                                onFieldCreated={loadObjectData}
                            >
                                <Button size="sm" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                    <Plus className="w-4 h-4 ml-2" />
                                    הוסף שדה
                                </Button>
                            </CreateFieldModal>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">אין שדות עדיין. צור שדה ראשון.</p>
                        ) : (
                            <div className="space-y-2">
                                {fields.map(field => (
                                    <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">{field.field_label}</p>
                                                <p className="text-sm text-gray-500">{field.field_name} • {field.field_type}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {field.is_required && (
                                                    <Badge variant="outline" className="text-xs">חובה</Badge>
                                                )}
                                                {field.is_read_only && (
                                                    <Badge variant="outline" className="text-xs">קריאה בלבד</Badge>
                                                )}
                                                {field.is_tracked && (
                                                    <Badge variant="outline" className="text-xs">מעוקב</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <EditFieldModal 
                                                field={field}
                                                onFieldUpdated={loadObjectData}
                                            >
                                                <Button size="sm" variant="ghost">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </EditFieldModal>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteField(field.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* עמודות רשימה */}
                {activeTab === 'columns' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Heebo' }}>עמודות תצוגת רשימה</h3>
                                <p className="text-sm text-gray-500">הגדר אילו עמודות יוצגו בתצוגת רשימה</p>
                            </div>
                            <CreateColumnModal objectId={object.id} fields={fields} onColumnCreated={loadObjectData}>
                                <Button size="sm" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                    <Plus className="w-4 h-4 ml-2" />
                                    הוסף עמודה
                                </Button>
                            </CreateColumnModal>
                        </div>

                        {columns.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">אין עמודות עדיין. צור עמודה ראשונה.</p>
                        ) : (
                            <div className="space-y-2">
                                {columns.map(column => (
                                    <div key={column.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                        <div>
                                            <p className="font-medium">{column.column_label}</p>
                                            <p className="text-sm text-gray-500">{column.field_name} • סדר: {column.order_index || 0}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <EditColumnModal 
                                                column={column}
                                                fields={fields}
                                                onColumnUpdated={loadObjectData}
                                            >
                                                <Button size="sm" variant="ghost">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </EditColumnModal>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteColumn(column.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* מקטעים בסיידבר */}
                {activeTab === 'sections' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Heebo' }}>מקטעי סיידבר (סינון)</h3>
                                <p className="text-sm text-gray-500">קבוצות סינון שיופיעו בסיידבר כמו "ליד", "פולואפ" וכו'</p>
                            </div>
                            <CreateSectionModal objectId={object.id} fields={fields} onSectionCreated={loadObjectData}>
                                <Button size="sm" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                    <Plus className="w-4 h-4 ml-2" />
                                    הוסף מקטע
                                </Button>
                            </CreateSectionModal>
                        </div>

                        {sections.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">אין מקטעים עדיין. צור מקטע ראשון.</p>
                        ) : (
                            <div className="space-y-2">
                                {sections.map(section => (
                                    <div key={section.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded"
                                                style={{ background: section.color || '#3568AE' }}
                                            />
                                            <div>
                                                <p className="font-medium">{section.section_name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {section.filter_field_name && section.filter_value ? 
                                                        `סינון: ${section.filter_field_name} = ${section.filter_value}` 
                                                        : 'ללא סינון'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <EditSectionModal 
                                                section={section}
                                                fields={fields}
                                                onSectionUpdated={loadObjectData}
                                            >
                                                <Button size="sm" variant="ghost">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </EditSectionModal>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CreateSectionModal({ objectId, fields, onSectionCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        section_name: '',
        filter_field_name: '',
        filter_value: '',
        order_index: 0,
        color: '#3568AE'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await base44.entities.ObjectSection.create({
                ...formData,
                object_id: objectId
            });
            onSectionCreated();
            setIsOpen(false);
            setFormData({ section_name: '', filter_field_name: '', filter_value: '', order_index: 0, color: '#3568AE' });
        } catch (error) {
            console.error('שגיאה ביצירת מקטע:', error);
            alert('שגיאה ביצירת המקטע');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>יצירת מקטע סיידבר</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם המקטע *</label>
                        <Input
                            required
                            value={formData.section_name}
                            onChange={(e) => setFormData({...formData, section_name: e.target.value})}
                            placeholder="לדוגמה: ליד, פולואפ"
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שדה לסינון</label>
                        <select
                            value={formData.filter_field_name}
                            onChange={(e) => setFormData({...formData, filter_field_name: e.target.value})}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            <option value="">ללא סינון</option>
                            {fields.map(f => (
                                <option key={f.id} value={f.field_name}>{f.field_label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.filter_field_name && (
                        <div>
                            <label className="block text-sm font-medium mb-1">ערך לסינון</label>
                            <Input
                                value={formData.filter_value}
                                onChange={(e) => setFormData({...formData, filter_value: e.target.value})}
                                placeholder="לדוגמה: ליד"
                                className="text-right"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">צבע</label>
                        <Input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({...formData, color: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            צור מקטע
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditSectionModal({ section, fields, onSectionUpdated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        section_name: section?.section_name || '',
        filter_field_name: section?.filter_field_name || '',
        filter_value: section?.filter_value || '',
        order_index: section?.order_index || 0,
        color: section?.color || '#3568AE'
    });

    useEffect(() => {
        if (section) {
            setFormData({
                section_name: section.section_name,
                filter_field_name: section.filter_field_name || '',
                filter_value: section.filter_value || '',
                order_index: section.order_index || 0,
                color: section.color || '#3568AE'
            });
        }
    }, [section]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await base44.entities.ObjectSection.update(section.id, formData);
            onSectionUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error('שגיאה בעדכון מקטע:', error);
            alert('שגיאה בעדכון המקטע');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>עריכת מקטע סיידבר</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם המקטע *</label>
                        <Input
                            required
                            value={formData.section_name}
                            onChange={(e) => setFormData({...formData, section_name: e.target.value})}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שדה לסינון</label>
                        <select
                            value={formData.filter_field_name}
                            onChange={(e) => setFormData({...formData, filter_field_name: e.target.value})}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            <option value="">ללא סינון</option>
                            {fields.map(f => (
                                <option key={f.id} value={f.field_name}>{f.field_label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.filter_field_name && (
                        <div>
                            <label className="block text-sm font-medium mb-1">ערך לסינון</label>
                            <Input
                                value={formData.filter_value}
                                onChange={(e) => setFormData({...formData, filter_value: e.target.value})}
                                className="text-right"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">צבע</label>
                        <Input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({...formData, color: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            עדכן מקטע
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditFieldModal({ field, onFieldUpdated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        field_label: field?.field_label || '',
        field_name: field?.field_name || '',
        field_type: field?.field_type || 'text',
        is_required: field?.is_required || false,
        is_read_only: field?.is_read_only || false,
        default_value: field?.default_value || '',
        select_options: field?.select_options || [],
        order_index: field?.order_index || 0
    });

    const [optionsText, setOptionsText] = useState('');

    useEffect(() => {
        if (field) {
            setFormData({
                field_label: field.field_label,
                field_name: field.field_name,
                field_type: field.field_type,
                is_required: field.is_required || false,
                is_read_only: field.is_read_only || false,
                default_value: field.default_value || '',
                select_options: field.select_options || [],
                order_index: field.order_index || 0
            });
            setOptionsText((field.select_options || []).join('\n'));
        }
    }, [field]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fieldData = { ...formData };

            if (formData.field_type === 'select' && optionsText) {
                fieldData.select_options = optionsText.split('\n').filter(o => o.trim());
            }

            await base44.entities.ObjectField.update(field.id, fieldData);
            onFieldUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error('שגיאה בעדכון שדה:', error);
            alert('שגיאה בעדכון השדה');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>עריכת שדה</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם השדה (תצוגה) *</label>
                        <Input
                            required
                            value={formData.field_label}
                            onChange={(e) => setFormData({...formData, field_label: e.target.value})}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שם השדה במערכת (באנגלית) *</label>
                        <Input
                            required
                            value={formData.field_name}
                            onChange={(e) => setFormData({...formData, field_name: e.target.value})}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סוג שדה *</label>
                        <select
                            required
                            value={formData.field_type}
                            onChange={(e) => setFormData({...formData, field_type: e.target.value})}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            <option value="text">טקסט</option>
                            <option value="textarea">תיבת טקסט</option>
                            <option value="number">מספר</option>
                            <option value="date">תאריך</option>
                            <option value="datetime">תאריך ושעה</option>
                            <option value="select">בחירה מרשימה</option>
                            <option value="checkbox">תיבת סימון</option>
                            <option value="email">דואר אלקטרוני</option>
                            <option value="phone">טלפון</option>
                            <option value="url">כתובת אינטרנט</option>
                        </select>
                    </div>

                    {formData.field_type === 'select' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">אפשרויות (שורה אחת לכל אפשרות)</label>
                            <Textarea
                                value={optionsText}
                                onChange={(e) => setOptionsText(e.target.value)}
                                placeholder="אופציה 1&#10;אופציה 2&#10;אופציה 3"
                                className="text-right"
                                rows={4}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר בטופס</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">שדה חובה</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_read_only}
                                onChange={(e) => setFormData({...formData, is_read_only: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">שדה לקריאה בלבד (נעול)</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            עדכן שדה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateColumnModal({ objectId, fields, onColumnCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        field_name: '',
        column_label: '',
        order_index: 0,
        width: 'auto',
        is_visible: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await base44.entities.ObjectColumn.create({
                ...formData,
                object_id: objectId
            });
            onColumnCreated();
            setIsOpen(false);
            setFormData({ field_name: '', column_label: '', order_index: 0, width: 'auto', is_visible: true });
        } catch (error) {
            console.error('שגיאה ביצירת עמודה:', error);
            alert('שגיאה ביצירת העמודה');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>יצירת עמודה חדשה</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">בחר שדה *</label>
                        <select
                            required
                            value={formData.field_name}
                            onChange={(e) => {
                                const selectedField = fields.find(f => f.field_name === e.target.value);
                                setFormData({
                                    ...formData, 
                                    field_name: e.target.value,
                                    column_label: selectedField?.field_label || ''
                                });
                            }}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            <option value="">בחר שדה...</option>
                            {fields.map(f => (
                                <option key={f.id} value={f.field_name}>{f.field_label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">כותרת העמודה *</label>
                        <Input
                            required
                            value={formData.column_label}
                            onChange={(e) => setFormData({...formData, column_label: e.target.value})}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            צור עמודה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditColumnModal({ column, fields, onColumnUpdated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        field_name: column?.field_name || '',
        column_label: column?.column_label || '',
        order_index: column?.order_index || 0,
        width: column?.width || 'auto',
        is_visible: column?.is_visible !== false
    });

    useEffect(() => {
        if (column) {
            setFormData({
                field_name: column.field_name,
                column_label: column.column_label,
                order_index: column.order_index || 0,
                width: column.width || 'auto',
                is_visible: column.is_visible !== false
            });
        }
    }, [column]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await base44.entities.ObjectColumn.update(column.id, formData);
            onColumnUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error('שגיאה בעדכון עמודה:', error);
            alert('שגיאה בעדכון העמודה');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>עריכת עמודה</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">בחר שדה *</label>
                        <select
                            required
                            value={formData.field_name}
                            onChange={(e) => {
                                const selectedField = fields.find(f => f.field_name === e.target.value);
                                setFormData({
                                    ...formData, 
                                    field_name: e.target.value,
                                    column_label: selectedField?.field_label || formData.column_label
                                });
                            }}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            {fields.map(f => (
                                <option key={f.id} value={f.field_name}>{f.field_label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">כותרת העמודה *</label>
                        <Input
                            required
                            value={formData.column_label}
                            onChange={(e) => setFormData({...formData, column_label: e.target.value})}
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            עדכן עמודה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateFieldModal({ objectId, sectionId, onFieldCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        field_label: '',
        field_name: '',
        field_type: 'text',
        is_required: false,
        is_read_only: false,
        default_value: '',
        select_options: [],
        order_index: 0
    });

    const [optionsText, setOptionsText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fieldData = {
                ...formData,
                object_id: objectId
            };

            // המר אפשרויות select מטקסט למערך
            if (formData.field_type === 'select' && optionsText) {
                fieldData.select_options = optionsText.split('\n').filter(o => o.trim());
            }

            await base44.entities.ObjectField.create(fieldData);
            onFieldCreated();
            setIsOpen(false);
            setFormData({
                field_label: '',
                field_name: '',
                field_type: 'text',
                is_required: false,
                is_read_only: false,
                default_value: '',
                select_options: [],
                order_index: 0
            });
            setOptionsText('');
        } catch (error) {
            console.error('שגיאה ביצירת שדה:', error);
            alert('שגיאה ביצירת השדה');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>יצירת שדה חדש</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">שם השדה (תצוגה) *</label>
                        <Input
                            required
                            value={formData.field_label}
                            onChange={(e) => setFormData({...formData, field_label: e.target.value})}
                            placeholder="לדוגמה: שם פרטי"
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">שם השדה במערכת (באנגלית) *</label>
                        <Input
                            required
                            value={formData.field_name}
                            onChange={(e) => setFormData({...formData, field_name: e.target.value})}
                            placeholder="לדוגמה: first_name"
                            className="text-right"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">סוג שדה *</label>
                        <select
                            required
                            value={formData.field_type}
                            onChange={(e) => setFormData({...formData, field_type: e.target.value})}
                            className="w-full p-2 border rounded-md text-right"
                        >
                            <option value="text">טקסט</option>
                            <option value="textarea">תיבת טקסט</option>
                            <option value="number">מספר</option>
                            <option value="date">תאריך</option>
                            <option value="datetime">תאריך ושעה</option>
                            <option value="select">בחירה מרשימה</option>
                            <option value="checkbox">תיבת סימון</option>
                            <option value="email">דואר אלקטרוני</option>
                            <option value="phone">טלפון</option>
                            <option value="url">כתובת אינטרנט</option>
                        </select>
                    </div>

                    {formData.field_type === 'select' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">אפשרויות (שורה אחת לכל אפשרות)</label>
                            <Textarea
                                value={optionsText}
                                onChange={(e) => setOptionsText(e.target.value)}
                                placeholder="אופציה 1&#10;אופציה 2&#10;אופציה 3"
                                className="text-right"
                                rows={4}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">סדר בטופס</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                            className="text-right"
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_required}
                                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">שדה חובה</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_read_only}
                                onChange={(e) => setFormData({...formData, is_read_only: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">שדה לקריאה בלבד (נעול)</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            צור שדה
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}