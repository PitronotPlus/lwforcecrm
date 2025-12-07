import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import FieldEditorModal from "./FieldEditorModal";

export default function ObjectFieldsEditor({ objectId }) {
    const [fields, setFields] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("display_name");
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [selectedField, setSelectedField] = useState(null);

    useEffect(() => {
        loadFields();
    }, [objectId]);

    const loadFields = async () => {
        try {
            const data = await base44.entities.ObjectField.filter({ object_id: objectId });
            setFields(data);
        } catch (error) {
            console.error("שגיאה בטעינת שדות:", error);
        }
    };

    const handleCreateField = () => {
        setSelectedField(null);
        setShowFieldEditor(true);
    };

    const handleEditField = (field) => {
        setSelectedField(field);
        setShowFieldEditor(true);
    };

    const filteredFields = fields
        .filter(f => f.display_name?.includes(searchQuery) || f.system_key?.includes(searchQuery))
        .sort((a, b) => {
            const aVal = a[sortBy] || "";
            const bVal = b[sortBy] || "";
            return aVal > bVal ? 1 : -1;
        });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">שדות רשומה ({filteredFields.length})</h3>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button className="px-3 py-1 bg-white rounded text-sm">רשימה</button>
                        <button className="px-3 py-1 text-gray-500 text-sm">לוח</button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Input
                            placeholder="חיפוש שדות..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 w-[250px]"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    
                    <Button
                        onClick={handleCreateField}
                        size="sm"
                        className="bg-[#67BF91] hover:bg-[#5AA880]"
                    >
                        <Plus className="w-4 h-4 ml-1" />
                        חדש
                    </Button>
                </div>
            </div>

            {/* Fields Table */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-right p-3 w-12">
                                <input type="checkbox" className="w-4 h-4" />
                            </th>
                            <th 
                                className="text-right p-3 cursor-pointer hover:bg-gray-100"
                                onClick={() => setSortBy("display_name")}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-xs">שם שדה</span>
                                    {sortBy === "display_name" && <ArrowUpDown className="w-3 h-3" />}
                                </div>
                            </th>
                            <th className="text-right p-3">
                                <span className="font-bold text-xs">שם מערכת</span>
                            </th>
                            <th className="text-right p-3">
                                <span className="font-bold text-xs">סוג שדה</span>
                            </th>
                            <th className="text-right p-3">
                                <span className="font-bold text-xs">שדה נוסחה</span>
                            </th>
                            <th className="text-right p-3">
                                <span className="font-bold text-xs">שדה סיכומי</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFields.map((field) => (
                            <tr
                                key={field.id}
                                className="border-t hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleEditField(field)}
                            >
                                <td className="p-3">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td className="p-3">
                                    <span className="text-xs">{field.display_name}</span>
                                </td>
                                <td className="p-3">
                                    <span className="text-xs text-gray-600">{field.system_key}</span>
                                </td>
                                <td className="p-3">
                                    <span className="text-xs">{field.field_type}</span>
                                </td>
                                <td className="p-3">
                                    <span className="text-xs text-gray-400">-</span>
                                </td>
                                <td className="p-3">
                                    <span className="text-xs text-gray-400">-</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    לא נמצאו שדות. הוסף שדה ראשון.
                </div>
            )}

            {showFieldEditor && (
                <FieldEditorModal
                    field={selectedField}
                    objectId={objectId}
                    open={showFieldEditor}
                    onClose={() => {
                        setShowFieldEditor(false);
                        setSelectedField(null);
                    }}
                    onSave={() => {
                        setShowFieldEditor(false);
                        setSelectedField(null);
                        loadFields();
                    }}
                />
            )}
        </div>
    );
}