import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, GripVertical, Eye, EyeOff, Plus, X, Save, Users } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function MenuEditor() {
    const [availablePages, setAvailablePages] = useState([]);

    const userRoles = [
        { value: 'admin', label: 'מנהל מערכת' },
        { value: 'owner', label: 'בעל משרד' },
        { value: 'department_head', label: 'ראש מחלקה' },
        { value: 'lawyer', label: 'עורך דין' }
    ];

    const [selectedRole, setSelectedRole] = useState('admin');
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', url: '', roles: ['admin', 'owner', 'department_head', 'lawyer'] });
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAvailablePages();
        loadMenuItems();
    }, [selectedRole]);

    const loadAvailablePages = async () => {
        try {
            const { data } = await base44.functions.invoke('getAvailablePages');
            if (data.success) {
                setAvailablePages(data.pages);
            }
        } catch (error) {
            console.error('שגיאה בטעינת רשימת דפים:', error);
            // Fallback to basic pages if function fails
            setAvailablePages([
                { name: 'דשבורד', path: '/Dashboard' },
                { name: 'הגדרות', path: '/Settings' }
            ]);
        }
    };

    const loadMenuItems = async () => {
        setLoading(true);
        try {
            const configs = await base44.entities.MenuConfiguration.list('order_index');
            if (configs.length === 0) {
                await initializeDefaultMenu();
            } else {
                const items = configs.map(c => ({
                    id: c.id,
                    title: c.display_name,
                    url: c.custom_route || '',
                    visible: c.is_visible,
                    order: c.order_index,
                    roles: c.allowed_roles || ['admin', 'owner', 'department_head', 'lawyer']
                }));
                setMenuItems(items);
            }
        } catch (error) {
            console.error('שגיאה בטעינת תפריט:', error);
        }
        setLoading(false);
    };

    const initializeDefaultMenu = async () => {
        const defaultItems = [
            { display_name: 'דשבורד', custom_route: '/Dashboard', is_visible: true, order_index: 1, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'main' },
            { display_name: 'לקוחות', custom_route: '/Clients', is_visible: true, order_index: 2, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'main' },
            { display_name: 'תיקים', custom_route: '/Cases', is_visible: true, order_index: 3, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'main' },
            { display_name: 'משימות', custom_route: '/Tasks', is_visible: true, order_index: 4, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'main' },
            { display_name: 'פגישות', custom_route: '/Appointments', is_visible: true, order_index: 5, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'main' },
            { display_name: 'שיווק', custom_route: '/Marketing', is_visible: true, order_index: 6, allowed_roles: ['admin', 'owner', 'department_head'], menu_group: 'main' },
            { display_name: 'כספים', custom_route: '/Finances', is_visible: true, order_index: 7, allowed_roles: ['admin', 'owner', 'department_head'], menu_group: 'main' },
            { display_name: 'קרדיטים', custom_route: '/Credits', is_visible: true, order_index: 8, allowed_roles: ['admin', 'owner'], menu_group: 'more' },
            { display_name: 'תמיכה', custom_route: '/Support', is_visible: true, order_index: 9, allowed_roles: ['admin', 'owner', 'department_head', 'lawyer'], menu_group: 'more' },
            { display_name: 'ניהול צוות', custom_route: '/TeamManagement', is_visible: true, order_index: 10, allowed_roles: ['admin', 'owner', 'department_head'], menu_group: 'main' },
            { display_name: 'ניהול מערכת', custom_route: '/AdminDashboard', is_visible: true, order_index: 11, allowed_roles: ['admin'], menu_group: 'main' }
        ];

        for (const item of defaultItems) {
            await base44.entities.MenuConfiguration.create(item);
        }

        await loadMenuItems();
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(menuItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

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

    const toggleRole = (id, role) => {
        setMenuItems(menuItems.map(item => {
            if (item.id === id) {
                const roles = item.roles || [];
                const newRoles = roles.includes(role)
                    ? roles.filter(r => r !== role)
                    : [...roles, role];
                return { ...item, roles: newRoles };
            }
            return item;
        }));
    };

    const deleteItem = async (id) => {
        if (confirm('האם למחוק פריט זה מהתפריט?')) {
            try {
                await base44.entities.MenuConfiguration.delete(id);
                setMenuItems(menuItems.filter(item => item.id !== id));
            } catch (error) {
                console.error('שגיאה במחיקת פריט:', error);
                alert('אירעה שגיאה במחיקת הפריט');
            }
        }
    };

    const addNewItem = async () => {
        if (!newItem.title || !newItem.url) return;

        try {
            const created = await base44.entities.MenuConfiguration.create({
                display_name: newItem.title,
                custom_route: newItem.url,
                is_visible: true,
                order_index: menuItems.length + 1,
                allowed_roles: newItem.roles
            });
            
            setMenuItems([
                ...menuItems,
                {
                    id: created.id,
                    title: created.display_name,
                    url: created.custom_route,
                    visible: created.is_visible,
                    order: created.order_index,
                    roles: created.allowed_roles
                }
            ]);
            setNewItem({ title: '', url: '', roles: ['admin', 'owner', 'department_head', 'lawyer'] });
            setShowAddForm(false);
        } catch (error) {
            console.error('שגיאה בהוספת פריט:', error);
            alert('אירעה שגיאה בהוספת הפריט');
        }
    };

    const saveMenu = async () => {
        setSaving(true);
        try {
            for (let i = 0; i < menuItems.length; i++) {
                const item = menuItems[i];
                await base44.entities.MenuConfiguration.update(item.id, {
                    display_name: item.title,
                    custom_route: item.url,
                    is_visible: item.visible,
                    order_index: i + 1,
                    allowed_roles: item.roles
                });
            }
            alert('התפריט נשמר בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת תפריט:', error);
            alert('אירעה שגיאה בשמירת התפריט');
        }
        setSaving(false);
    };

    const filteredMenuItems = menuItems.filter(item => 
        item.roles && item.roles.includes(selectedRole)
    );

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
                            <Menu className="w-6 h-6 text-[#3568AE]" />
                            עריכת תפריט ראשי
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
                            <Button 
                                onClick={saveMenu} 
                                className="bg-[#67BF91] hover:bg-[#5AA880]"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                        שומר...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 ml-2" />
                                        שמור שינויים
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        גרור כדי לשנות סדר, הסתר/הצג פריטים, ובחר לאילו תפקידים הם גלויים
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3568AE] mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">טוען תפריט...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-700">
                                    <strong>📌 תצוגת תפריט עבור: {userRoles.find(r => r.value === selectedRole)?.label}</strong>
                                    <br />
                                    מוצגים {filteredMenuItems.length} פריטים מתוך {menuItems.length} סך הכל
                                </p>
                            </div>

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
                                                            className={`bg-white border rounded-lg p-4 ${
                                                                item.visible ? 'border-gray-200' : 'border-gray-300 opacity-60'
                                                            } ${!item.roles?.includes(selectedRole) ? 'bg-gray-50' : ''}`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">{item.title}</p>
                                                                        <p className="text-xs text-gray-500 mb-3">{item.url}</p>
                                                                        
                                                                        <div className="flex gap-2 flex-wrap">
                                                                            {userRoles.map(role => (
                                                                                <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                                                                                    <Checkbox
                                                                                        checked={item.roles?.includes(role.value)}
                                                                                        onCheckedChange={() => toggleRole(item.id, role.value)}
                                                                                    />
                                                                                    <span className="text-sm">{role.label}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
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
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">בחר דף קיים</label>
                                        <Select
                                            value={newItem.url}
                                            onValueChange={(value) => {
                                                const page = availablePages.find(p => p.path === value);
                                                setNewItem({ ...newItem, title: page?.name || '', url: value });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="בחר דף מהרשימה" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePages.map((page) => (
                                                    <SelectItem key={page.path} value={page.path}>
                                                        {page.name} ({page.path})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">שם בתפריט (אופציונלי)</label>
                                        <Input
                                            placeholder="ישתמש בשם הדף כברירת מחדל"
                                            value={newItem.title}
                                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">גלוי לתפקידים</label>
                                        <div className="flex gap-4 flex-wrap">
                                            {userRoles.map(role => (
                                                <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={newItem.roles.includes(role.value)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setNewItem({ ...newItem, roles: [...newItem.roles, role.value] });
                                                            } else {
                                                                setNewItem({ ...newItem, roles: newItem.roles.filter(r => r !== role.value) });
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">{role.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
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
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}