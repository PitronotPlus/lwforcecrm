import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Edit, Plus, Search, FileText, Check, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ObjectStudio() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
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
        setShowEditor(true);
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
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: 'Heebo' }}>
                            עריכת רשומה: {selectedEntity?.displayName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedEntity && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    <strong>שם טכני:</strong> {selectedEntity.name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>קובץ:</strong> entities/{selectedEntity.name}.json
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">שדות קיימים:</h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {['id', 'created_date', 'updated_date', 'created_by'].map((field) => (
                                        <div key={field} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{field}</p>
                                                    <p className="text-xs text-gray-500">שדה מערכת מובנה</p>
                                                </div>
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                    מוגן
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {selectedEntity.name === 'Client' && (
                                        <>
                                            <FieldCard name="full_name" type="string" required />
                                            <FieldCard name="phone" type="string" required />
                                            <FieldCard name="email" type="email" />
                                            <FieldCard name="status" type="enum" />
                                        </>
                                    )}
                                    {selectedEntity.name === 'Task' && (
                                        <>
                                            <FieldCard name="title" type="string" required />
                                            <FieldCard name="description" type="string" />
                                            <FieldCard name="status" type="enum" />
                                            <FieldCard name="priority" type="enum" />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    💡 <strong>טיפ:</strong> לעריכה מלאה של השדות, ערוך את הקובץ 
                                    <code className="mx-1 bg-white px-2 py-1 rounded text-xs">
                                        entities/{selectedEntity.name}.json
                                    </code>
                                    ישירות בעורך הקוד.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowEditor(false)}>
                                    סגור
                                </Button>
                                <Button className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    <Check className="w-4 h-4 ml-2" />
                                    שמור שינויים
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function FieldCard({ name, type, required = false }) {
    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{name}</p>
                        {required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                חובה
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">{type}</p>
                </div>
                <Button variant="ghost" size="sm">
                    <Edit className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}