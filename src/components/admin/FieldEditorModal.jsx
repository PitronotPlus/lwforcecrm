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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function FieldEditorModal({ field, objectId, open, onClose, onSave }) {
    const [formData, setFormData] = useState({
        object_id: objectId,
        display_name: "",
        system_key: "",
        field_type: "text",
        is_required: false,
        is_unique: false,
        show_in_table: true,
        is_system: false,
        is_readonly: false,
        options: []
    });

    useEffect(() => {
        if (field) {
            setFormData(field);
        }
    }, [field]);

    const generateSystemKey = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    };

    const handleSubmit = async () => {
        try {
            if (field) {
                await base44.entities.ObjectField.update(field.id, formData);
            } else {
                await base44.entities.ObjectField.create(formData);
            }
            onSave();
        } catch (error) {
            console.error("שגיאה בשמירת שדה:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        {field ? "עריכת שדה" : "שדה חדש"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>שם שדה</Label>
                            <Input
                                value={formData.display_name}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({
                                        ...formData,
                                        display_name: value,
                                        system_key: field ? formData.system_key : generateSystemKey(value)
                                    });
                                }}
                            />
                        </div>

                        <div>
                            <Label>שם מערכת</Label>
                            <Input
                                value={formData.system_key}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>סוג שדה</Label>
                        <Select 
                            value={formData.field_type} 
                            onValueChange={(val) => setFormData({...formData, field_type: val})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">טקסט</SelectItem>
                                <SelectItem value="number">מספר</SelectItem>
                                <SelectItem value="date">תאריך</SelectItem>
                                <SelectItem value="datetime">תאריך ושעה</SelectItem>
                                <SelectItem value="boolean">כן/לא</SelectItem>
                                <SelectItem value="picklist">רשימה</SelectItem>
                                <SelectItem value="email">אימייל</SelectItem>
                                <SelectItem value="phone">טלפון</SelectItem>
                                <SelectItem value="url">קישור</SelectItem>
                                <SelectItem value="textarea">טקסט ארוך</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.field_type === "picklist" && (
                        <div>
                            <Label>אפשרויות (מופרדות בפסיק)</Label>
                            <Input
                                value={formData.options?.join(", ") || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    options: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                                })}
                                placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
                            />
                        </div>
                    )}

                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={formData.is_required}
                                onCheckedChange={(checked) => setFormData({...formData, is_required: checked})}
                            />
                            <Label>שדה חובה</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={formData.show_in_table}
                                onCheckedChange={(checked) => setFormData({...formData, show_in_table: checked})}
                            />
                            <Label>הצג בטבלה</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={formData.is_unique}
                                onCheckedChange={(checked) => setFormData({...formData, is_unique: checked})}
                            />
                            <Label>ערך ייחודי</Label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        ביטול
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className="bg-[#67BF91] hover:bg-[#5AA880]"
                    >
                        שמור שדה
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}