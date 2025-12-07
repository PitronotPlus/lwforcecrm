import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Eye, LayoutGrid, Plus } from "lucide-react";
import ObjectEditorModal from "./ObjectEditorModal";

export default function ObjectStudio() {
    const [objects, setObjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("record_number");
    const [sortDirection, setSortDirection] = useState("asc");
    const [selectedObject, setSelectedObject] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadObjects();
    }, []);

    const loadObjects = async () => {
        try {
            setLoading(true);
            const data = await base44.entities.SystemObject.list();
            setObjects(data);
        } catch (error) {
            console.error("שגיאה בטעינת אובייקטים:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const getSortedObjects = () => {
        let filtered = objects.filter(obj =>
            obj.display_name_singular?.includes(searchQuery) ||
            obj.display_name_plural?.includes(searchQuery) ||
            obj.system_key?.includes(searchQuery)
        );

        filtered.sort((a, b) => {
            const aVal = a[sortField] || "";
            const bVal = b[sortField] || "";
            
            if (sortDirection === "asc") {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    };

    const handleEditObject = (obj) => {
        setSelectedObject(obj);
        setShowEditor(true);
    };

    const handleCreateNew = () => {
        setSelectedObject(null);
        setShowEditor(true);
    };

    const sortedObjects = getSortedObjects();

    if (loading) {
        return <div className="p-8">טוען רשומות מערכת...</div>;
    }

    return (
        <div className="p-6">
            <Card>
                <CardContent className="pt-6">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-[#3568AE]" />
                                <h2 className="text-xl font-bold" style={{ fontFamily: 'Heebo' }}>
                                    רשומות מערכת ({sortedObjects.length})
                                </h2>
                            </div>
                            
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                                <button className="px-4 py-2 bg-white rounded-md font-medium text-sm">
                                    רשימה
                                </button>
                                <button className="px-4 py-2 text-gray-500 text-sm">
                                    לוח
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Input
                                    placeholder="חיפוש רשומות..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-10 w-[300px]"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            
                            <Button
                                onClick={handleCreateNew}
                                className="bg-[#67BF91] hover:bg-[#5AA880]"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                חדש
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-right p-4 w-12">
                                        <input type="checkbox" className="w-4 h-4" />
                                    </th>
                                    <th 
                                        className="text-right p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort("display_name_singular")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">שם רשומה</span>
                                            {sortField === "display_name_singular" && (
                                                <ArrowUpDown className="w-3 h-3" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="text-right p-4">
                                        <span className="font-bold text-sm">סוג רשומה</span>
                                    </th>
                                    <th 
                                        className="text-right p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort("record_number")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">מספר רשומה</span>
                                            {sortField === "record_number" && (
                                                <ArrowUpDown className="w-3 h-3" />
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedObjects.map((obj) => (
                                    <tr
                                        key={obj.id}
                                        className="border-t hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleEditObject(obj)}
                                    >
                                        <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">{obj.display_name_singular}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600">
                                                {obj.is_system ? "רשומת מערכת קבועה" : "רשומת מערכת ניתנת לשינוי"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm">{obj.record_number}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {sortedObjects.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">לא נמצאו רשומות מערכת</p>
                            <Button
                                onClick={handleCreateNew}
                                className="bg-[#67BF91] hover:bg-[#5AA880]"
                            >
                                <Plus className="w-4 h-4 ml-2" />
                                צור רשומה ראשונה
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {showEditor && (
                <ObjectEditorModal
                    object={selectedObject}
                    open={showEditor}
                    onClose={() => {
                        setShowEditor(false);
                        setSelectedObject(null);
                    }}
                    onSave={() => {
                        setShowEditor(false);
                        setSelectedObject(null);
                        loadObjects();
                    }}
                />
            )}
        </div>
    );
}