import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, GripVertical, Eye, EyeOff, Plus, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MenuEditor() {
    const [menuItems, setMenuItems] = useState([
        { id: '1', title: 'דשבורד', url: '/Dashboard', visible: true, order: 1 },
        { id: '2', title: 'לקוחות', url: '/Clients', visible: true, order: 2 },
        { id: '3', title: 'תיקים', url: '/Cases', visible: true, order: 3 },
        { id: '4', title: 'משימות', url: '/Tasks', visible: true, order: 4 },
        { id: '5', title: 'פגישות', url: '/Appointments', visible: true, order: 5 },
        { id: '6', title: 'שיווק', url: '/Marketing', visible: true, order: 6 },
        { id: '7', title: 'כספים', url: '/Finances', visible: true, order: 7 },
        { id: '8', title: 'קרדיטים', url: '/Credits', visible: false, order: 8 },
        { id: '9', title: 'תמיכה', url: '/Support', visible: true, order: 9 }
    ]);
    const [newItem, setNewItem] = useState({ title: '', url: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(menuItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // עדכון הסדר
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        setMenuItems(updatedItems);
    };

    const toggleVisibility = (id) => {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, visible: !item.visible } : item
        ));
    };

    const deleteItem = (id) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    const addNewItem = () => {
        if (!newItem.title || !newItem.url) return;

        const newMenuItem = {
            id: Date.now().toString(),
            title: newItem.title,
            url: newItem.url,
            visible: true,
            order: menuItems.length + 1
        };

        setMenuItems([...menuItems, newMenuItem]);
        setNewItem({ title: '', url: '' });
        setShowAddForm(false);
    };

    const saveMenu = () => {
        // כאן תוכל לשמור ל-backend
        alert('התפריט נשמר בהצלחה! (בגרסת ייצור זה ישמר למערכת)');
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
                            <Menu className="w-6 h-6 text-[#3568AE]" />
                            עריכת תפריט ראשי
                        </CardTitle>
                        <Button onClick={saveMenu} className="bg-[#67BF91] hover:bg-[#5AA880]">
                            שמור שינויים
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        גרור כדי לשנות סדר, הסתר/הצג פריטים, או הוסף חדשים
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="menu">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {menuItems.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-white border rounded-lg p-4 flex items-center justify-between ${
                                                        item.visible ? 'border-gray-200' : 'border-gray-300 opacity-60'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">{item.title}</p>
                                                            <p className="text-xs text-gray-500">{item.url}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleVisibility(item.id)}
                                                        >
                                                            {item.visible ? (
                                                                <Eye className="w-4 h-4" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteItem(item.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {showAddForm ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            <Input
                                placeholder="שם הפריט (למשל: דוחות)"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            />
                            <Input
                                placeholder="נתיב (למשל: /Reports)"
                                value={newItem.url}
                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Button onClick={addNewItem} className="bg-[#67BF91] hover:bg-[#5AA880]">
                                    הוסף
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                    ביטול
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setShowAddForm(true)}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 ml-2" />
                            הוסף פריט חדש לתפריט
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}