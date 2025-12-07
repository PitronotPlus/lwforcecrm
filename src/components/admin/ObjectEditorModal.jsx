import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";
import ObjectFieldsEditor from "./ObjectFieldsEditor";

export default function ObjectEditorModal({ object, open, onClose, onSave }) {
    const [formData, setFormData] = useState({
        display_name_singular: "",
        display_name_plural: "",
        system_key: "",
        record_number: null,
        is_system: false,
        is_editable: true,
        is_active: true
    });
    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        if (object) {
            setFormData(object);
        } else {
            // יצירת מספר רשומה חדש
            generateRecordNumber();
        }
    }, [object]);

    const generateRecordNumber = async () => {
        try {
            const objects = await base44.entities.SystemObject.list();
            const maxNumber = Math.max(...objects.map(o => o.record_number || 0), 0);
            setFormData(prev => ({ ...prev, record_number: maxNumber + 1 }));
        } catch (error) {
            console.error("שגיאה ביצירת מספר רשומה:", error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (object) {
                await base44.entities.SystemObject.update(object.id, formData);
            } else {
                await base44.entities.SystemObject.create(formData);
            }
            onSave();
        } catch (error) {
            console.error("שגיאה בשמירת אובייקט:", error);
        }
    };

    const generateSystemKey = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        {object ? `רשומה: ${object.display_name_singular}` : "רשומה חדשה"}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">פרטי רשומה</TabsTrigger>
                        <TabsTrigger value="fields" disabled={!object}>
                            שדות רשומה
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h3 className="font-medium mb-3">פרטי רשומה</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {/* שם רשומה - יחיד */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1">שם רשומה</Label>
                                    <Input
                                        value={formData.display_name_singular}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData({
                                                ...formData,
                                                display_name_singular: value,
                                                system_key: object ? formData.system_key : generateSystemKey(value)
                                            });
                                        }}
                                        disabled={object?.is_system}
                                    />
                                </div>

                                {/* שם רשומה - רבים */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1">שם רשומה - רבים</Label>
                                    <Input
                                        value={formData.display_name_plural}
                                        onChange={(e) => setFormData({...formData, display_name_plural: e.target.value})}
                                        disabled={object?.is_system}
                                    />
                                </div>

                                {/* שם מערכת */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        שם מערכת
                                        {object && <Lock className="w-3 h-3" />}
                                    </Label>
                                    <Input
                                        value={formData.system_key}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                </div>

                                {/* מספר רשומה */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        מספר רשומה
                                        <Lock className="w-3 h-3" />
                                    </Label>
                                    <Input
                                        value={formData.record_number || ""}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="fields" className="mt-6">
                        {object && <ObjectFieldsEditor objectId={object.id} />}
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        ביטול
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className="bg-[#67BF91] hover:bg-[#5AA880]"
                        disabled={!formData.display_name_singular || !formData.display_name_plural}
                    >
                        שמור
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}