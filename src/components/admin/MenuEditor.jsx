import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GripVertical, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MenuEditor() {
    const [availableItems, setAvailableItems] = useState([]);
    const [mainMenuItems, setMainMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMenuConfiguration();
    }, []);

    const loadMenuConfiguration = async () => {
        try {
            setLoading(true);
            
            // טוען את כל האובייקטים מהמערכת
            const objects = await base44.entities.SystemObject.list();
            
            // טוען את הגדרות התפריט
            const menuConfig = await base44.entities.MenuConfiguration.list();
            
            // מפריד בין פריטים בתפריט ראשי לזמינים
            const mainItems = menuConfig
                .filter(item => item.menu_group === 'main' && item.is_visible)
                .sort((a, b) => a.order_index - b.order_index);
            
            const availableObjects = objects.filter(obj => {
                const inMainMenu = mainItems.some(item => item.object_id === obj.id);
                return !inMainMenu && !obj.is_system;
            });
            
            setMainMenuItems(mainItems);
            setAvailableItems(availableObjects);
        } catch (error) {
            console.error("שגיאה בטעינת תפריט:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        
        if (!destination) return;

        // העברה מזמין לראשי
        if (source.droppableId === "available" && destination.droppableId === "main") {
            const item = availableItems[source.index];
            const newAvailable = [...availableItems];
            newAvailable.splice(source.index, 1);
            
            const newMain = [...mainMenuItems];
            newMain.splice(destination.index, 0, {
                object_id: item.id,
                display_name: item.display_name_plural,
                is_visible: true,
                menu_group: 'main',
                order_index: destination.index
            });
            
            setAvailableItems(newAvailable);
            setMainMenuItems(newMain);
            
            // שמירה לדאטאבייס
            await saveMenuConfiguration(newMain);
        }
        
        // הסרה מראשי לזמין
        if (source.droppableId === "main" && destination.droppableId === "available") {
            const item = mainMenuItems[source.index];
            const newMain = [...mainMenuItems];
            newMain.splice(source.index, 1);
            
            setMainMenuItems(newMain);
            
            // טעינה מחדש של הזמינים
            loadMenuConfiguration();
            
            // מחיקת הפריט מהגדרות התפריט
            await base44.entities.MenuConfiguration.delete(item.id);
        }
        
        // שינוי סדר בתפריט הראשי
        if (source.droppableId === "main" && destination.droppableId === "main") {
            const newMain = [...mainMenuItems];
            const [moved] = newMain.splice(source.index, 1);
            newMain.splice(destination.index, 0, moved);
            
            setMainMenuItems(newMain);
            await saveMenuConfiguration(newMain);
        }
    };

    const saveMenuConfiguration = async (menuItems) => {
        try {
            // עדכון כל הפריטים עם הסדר החדש
            for (let i = 0; i < menuItems.length; i++) {
                const item = menuItems[i];
                if (item.id) {
                    await base44.entities.MenuConfiguration.update(item.id, {
                        order_index: i
                    });
                } else {
                    await base44.entities.MenuConfiguration.create({
                        ...item,
                        order_index: i
                    });
                }
            }
        } catch (error) {
            console.error("שגיאה בשמירת תפריט:", error);
        }
    };

    const removeFromMain = async (index) => {
        const item = mainMenuItems[index];
        const newMain = [...mainMenuItems];
        newMain.splice(index, 1);
        
        setMainMenuItems(newMain);
        
        if (item.id) {
            await base44.entities.MenuConfiguration.delete(item.id);
        }
        
        loadMenuConfiguration();
    };

    const filteredAvailable = availableItems.filter(item =>
        item.display_name_singular?.includes(searchQuery) ||
        item.display_name_plural?.includes(searchQuery)
    );

    if (loading) {
        return <div className="p-8">טוען...</div>;
    }

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle style={{ fontFamily: 'Heebo' }}>עריכת תפריט</CardTitle>
                    <p className="text-sm text-gray-500">
                        גרור שמאלה את הערכים שתרצה שיוצגו בתפריט הראשי
                    </p>
                </CardHeader>
                <CardContent>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-2 gap-6">
                            {/* פריטים זמינים */}
                            <div>
                                <div className="mb-4">
                                    <div className="relative">
                                        <Input
                                            placeholder="חפש..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10"
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                
                                <Droppable droppableId="available">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2 min-h-[400px] bg-gray-50 p-4 rounded-lg"
                                        >
                                            {filteredAvailable.map((item, index) => (
                                                <Draggable
                                                    key={item.id}
                                                    draggableId={item.id}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white p-3 rounded-md shadow-sm flex items-center gap-2 cursor-move hover:shadow-md transition-shadow"
                                                        >
                                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                                            <span>{item.display_name_plural}</span>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>

                            {/* תפריט ראשי */}
                            <div>
                                <h3 className="font-medium mb-4">תפריט ראשי</h3>
                                <Droppable droppableId="main">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2 min-h-[400px] bg-blue-50 p-4 rounded-lg"
                                        >
                                            {mainMenuItems.map((item, index) => (
                                                <Draggable
                                                    key={item.id || `new-${index}`}
                                                    draggableId={item.id || `new-${index}`}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between cursor-move hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <GripVertical className="w-4 h-4 text-gray-400" />
                                                                <span>{item.display_name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromMain(index)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </DragDropContext>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={loadMenuConfiguration}>
                            ביטול
                        </Button>
                        <Button className="bg-[#67BF91] hover:bg-[#5AA880]">
                            שמור
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}