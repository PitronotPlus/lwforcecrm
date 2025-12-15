import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database, Edit, Plus, Search, FileText, Check, X, Trash2, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function ObjectStudio() {
    const userRoles = [
        { value: 'admin', label: 'מנהל מערכת' },
        { value: 'owner', label: 'בעל משרד' },
        { value: 'department_head', label: 'ראש מחלקה' },
        { value: 'lawyer', label: 'עורך דין' }
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState('admin');
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [entityFields, setEntityFields] = useState([]);
    const [entities, setEntities] = useState([
        { 
            name: 'Client', 
            displayName: 'לקוח',
            description: 'ניהול לקוחות ולידים',
            fields: 12,
            records: 156,
            editable: true
        },
        { 
            name: 'Case', 
            displayName: 'תיק',
            description: 'ניהול תיקים משפטיים',
            fields: 9,
            records: 89,
            editable: true
        },
        { 
            name: 'Task', 
            displayName: 'משימה',
            description: 'ניהול משימות וטיפולים',
            fields: 15,
            records: 342,
            editable: true
        },
        { 
            name: 'Appointment', 
            displayName: 'פגישה',
            description: 'ניהול פגישות ומועדים',
            fields: 11,
            records: 234,
            editable: true
        },
        { 
            name: 'Financial', 
            displayName: 'כספים',
            description: 'ניהול הכנסות והוצאות',
            fields: 13,
            records: 567,
            editable: true
        },
        { 
            name: 'User', 
            displayName: 'משתמש',
            description: 'ניהול משתמשי המערכת',
            fields: 8,
            records: 23,
            editable: false
        }
    ]);

    const filteredEntities = entities.filter(entity =>
        entity.displayName.includes(searchQuery) ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.description.includes(searchQuery)
    );

    const handleEdit = (entity) => {
        setSelectedEntity(entity);
        
        // טעינת שדות לפי סוג ה-entity
        let fields = [];
        if (entity.name === 'Client') {
            fields = [
                { id: '1', name: 'full_name', displayName: 'שם מלא', type: 'string', required: true, description: 'שם מלא של הלקוח' },
                { id: '2', name: 'phone', displayName: 'טלפון', type: 'string', required: true, description: 'מספר טלפון' },
                { id: '3', name: 'email', displayName: 'אימייל', type: 'email', required: false, description: 'כתובת מייל' },
                { id: '4', name: 'status', displayName: 'סטטוס', type: 'enum', required: false, options: ['ליד', 'פולואפ', 'לקוח'], description: 'סטטוס הלקוח' }
            ];
        } else if (entity.name === 'Task') {
            fields = [
                { id: '1', name: 'title', displayName: 'כותרת', type: 'string', required: true, description: 'כותרת המשימה' },
                { id: '2', name: 'description', displayName: 'תיאור', type: 'textarea', required: false, description: 'תיאור המשימה' },
                { id: '3', name: 'status', displayName: 'סטטוס', type: 'enum', required: false, options: ['פתוח', 'בטיפול', 'הושלם'], description: 'סטטוס המשימה' },
                { id: '4', name: 'priority', displayName: 'עדיפות', type: 'enum', required: false, options: ['נמוכה', 'בינונית', 'גבוהה'], description: 'עדיפות המשימה' }
            ];
        } else {
            fields = [
                { id: '1', name: 'title', displayName: 'כותרת', type: 'string', required: true, description: 'כותרת' }
            ];
        }
        
        setEntityFields(fields);
        setShowEditor(true);
    };

    const handleAddField = () => {
        setEditingField({
            id: Date.now().toString(),
            name: '',
            displayName: '',
            type: 'string',
            required: false,
            description: '',
            options: []
        });
        setShowFieldEditor(true);
    };

    const handleEditField = (field) => {
        setEditingField({ ...field });
        setShowFieldEditor(true);
    };

    const handleSaveField = () => {
        if (!editingField.name || !editingField.displayName) {
            alert('יש למלא שם שדה ושם תצוגה');
            return;
        }

        const existingIndex = entityFields.findIndex(f => f.id === editingField.id);
        if (existingIndex >= 0) {
            const updated = [...entityFields];
            updated[existingIndex] = editingField;
            setEntityFields(updated);
        } else {
            setEntityFields([...entityFields, editingField]);
        }
        
        setShowFieldEditor(false);
        setEditingField(null);
    };

    const handleDeleteField = (fieldId) => {
        if (confirm('האם למחוק שדה זה?')) {
            setEntityFields(entityFields.filter(f => f.id !== fieldId));
        }
    };

    const handleSaveEntity = () => {
        alert('הרשומה נשמרה בהצלחה! (בגרסת ייצור זה ישמר למערכת)');
        setShowEditor(false);
    };

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
                            <Database className="w-6 h-6 text-[#3568AE]" />
                            הגדרת רשומות מערכת
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-500" />
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userRoles.map(role => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder="חיפוש רשומות..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[300px] pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        צפה וערוך את מבנה הרשומות במערכת
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEntities.map((entity) => (
                            <Card
                                key={entity.name}
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                    !entity.editable ? 'opacity-75' : ''
                                }`}
                                onClick={() => entity.editable && handleEdit(entity)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-[#3568AE]" />
                                            <h3 className="font-bold text-lg">{entity.displayName}</h3>
                                        </div>
                                        {!entity.editable && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                מוגן
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">{entity.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{entity.fields} שדות</span>
                                        <span>{entity.records} רשומות</span>
                                    </div>
                                    {entity.editable && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-4"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(entity);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 ml-2" />
                                            ערוך מבנה
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Entity Editor Dialog */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle style={{ fontFamily: 'Heebo' }}>
                                עריכת רשומה: {selectedEntity?.displayName}
                            </DialogTitle>
                            <Button onClick={handleAddField} className="bg-[#67BF91] hover:bg-[#5AA880]">
                                <Plus className="w-4 h-4 ml-2" />
                                הוסף שדה
                            </Button>
                        </div>
                    </DialogHeader>
                    {selectedEntity && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>{selectedEntity.description}</strong>
                                </p>
                                <p className="text-xs text-gray-600">
                                    הגדר את השדות שיופיעו ברשומה זו. כל שדה יוצג בטפסים ובטבלאות של המערכת.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3 flex items-center justify-between">
                                    <span>שדות מערכת (לא ניתנים לעריכה)</span>
                                    <span className="text-xs text-gray-500 font-normal">4 שדות</span>
                                </h3>
                                <div className="space-y-2 mb-6">
                                    <SystemField name="מזהה ייחודי" description="מספר זיהוי אוטומטי" />
                                    <SystemField name="תאריך יצירה" description="מתי נוצרה הרשומה" />
                                    <SystemField name="תאריך עדכון" description="מתי עודכנה לאחרונה" />
                                    <SystemField name="נוצר על ידי" description="מי יצר את הרשומה" />
                                </div>

                                <h3 className="font-bold mb-3 flex items-center justify-between">
                                    <span>שדות מותאמים אישית</span>
                                    <span className="text-xs text-gray-500 font-normal">{entityFields.length} שדות</span>
                                </h3>
                                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                                    {entityFields.map((field) => (
                                        <EditableFieldCard
                                            key={field.id}
                                            field={field}
                                            onEdit={() => handleEditField(field)}
                                            onDelete={() => handleDeleteField(field.id)}
                                        />
                                    ))}
                                    
                                    {entityFields.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">אין שדות מותאמים</p>
                                            <Button
                                                variant="link"
                                                onClick={handleAddField}
                                                className="text-[#3568AE] mt-2"
                                            >
                                                הוסף שדה ראשון
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowEditor(false)}>
                                    ביטול
                                </Button>
                                <Button onClick={handleSaveEntity} className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    <Check className="w-4 h-4 ml-2" />
                                    שמור שינויים
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Field Editor Dialog */}
            <Dialog open={showFieldEditor} onOpenChange={setShowFieldEditor}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'Heebo' }}>
                            {editingField?.id && entityFields.find(f => f.id === editingField.id) ? 'עריכת שדה' : 'הוספת שדה חדש'}
                        </DialogTitle>
                    </DialogHeader>
                    {editingField && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">שם השדה בעברית</label>
                                <Input
                                    placeholder="למשל: כתובת, מספר תיק, תאריך לידה"
                                    value={editingField.displayName}
                                    onChange={(e) => setEditingField({ ...editingField, displayName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">מפתח טכני (באנגלית)</label>
                                <Input
                                    placeholder="למשל: address, case_number, birth_date"
                                    value={editingField.name}
                                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                />
                                <p className="text-xs text-gray-500 mt-1">אותיות אנגליות קטנות ו-underscore בלבד</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">סוג השדה</label>
                                <Select
                                    value={editingField.type}
                                    onValueChange={(value) => setEditingField({ ...editingField, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="string">טקסט קצר</SelectItem>
                                        <SelectItem value="textarea">טקסט ארוך</SelectItem>
                                        <SelectItem value="number">מספר</SelectItem>
                                        <SelectItem value="email">אימייל</SelectItem>
                                        <SelectItem value="phone">טלפון</SelectItem>
                                        <SelectItem value="date">תאריך</SelectItem>
                                        <SelectItem value="boolean">כן/לא</SelectItem>
                                        <SelectItem value="enum">רשימה נפתחת (אפשרויות)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {editingField.type === 'enum' && (
                                <div>
                                    <label className="text-sm font-medium mb-2 block">אפשרויות (מופרדות בפסיק)</label>
                                    <Input
                                        placeholder="למשל: פעיל, לא פעיל, בהמתנה"
                                        value={editingField.options?.join(', ') || ''}
                                        onChange={(e) => setEditingField({
                                            ...editingField,
                                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium mb-2 block">תיאור (אופציונלי)</label>
                                <Textarea
                                    placeholder="הסבר קצר על מה השדה הזה"
                                    value={editingField.description}
                                    onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">שדה חובה</p>
                                    <p className="text-xs text-gray-500">האם חובה למלא את השדה הזה</p>
                                </div>
                                <Switch
                                    checked={editingField.required}
                                    onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowFieldEditor(false)}>
                                    ביטול
                                </Button>
                                <Button onClick={handleSaveField} className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    <Check className="w-4 h-4 ml-2" />
                                    שמור שדה
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SystemField({ name, description }) {
    return (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    מוגן
                </span>
            </div>
        </div>
    );
}

function EditableFieldCard({ field, onEdit, onDelete }) {
    const typeLabels = {
        string: 'טקסט',
        textarea: 'טקסט ארוך',
        number: 'מספר',
        email: 'אימייל',
        phone: 'טלפון',
        date: 'תאריך',
        boolean: 'כן/לא',
        enum: 'רשימה'
    };

    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-[#3568AE] transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{field.displayName}</p>
                        {field.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                חובה
                            </span>
                        )}
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {typeLabels[field.type] || field.type}
                        </span>
                    </div>
                    {field.description && (
                        <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                    {field.type === 'enum' && field.options && (
                        <p className="text-xs text-gray-400 mt-1">
                            אפשרויות: {field.options.join(', ')}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}