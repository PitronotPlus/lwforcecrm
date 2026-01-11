import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, List, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPageUrl } from "@/utils";

export default function CustomObject() {
    const [searchParams] = useSearchParams();
    const objectId = searchParams.get('id');
    
    const [object, setObject] = useState(null);
    const [sections, setSections] = useState([]);
    const [fields, setFields] = useState([]);
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('כרטיסיה');
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('הכל');

    useEffect(() => {
        if (objectId) {
            loadObjectData();
        }
    }, [objectId]);

    useEffect(() => {
        setCurrentPage(1);
        filterRecords();
    }, [records, searchQuery, selectedFilter]);

    useEffect(() => {
        filterRecords();
    }, [currentPage, itemsPerPage]);

    const loadObjectData = async () => {
        try {
            const [objectData, sectionsData, fieldsData] = await Promise.all([
                base44.entities.SystemObject.get(objectId),
                base44.entities.ObjectSection.filter({ object_id: objectId }),
                base44.entities.ObjectField.filter({ object_id: objectId })
            ]);
            
            setObject(objectData);
            setSections(sectionsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setFields(fieldsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            
            // TODO: טען רשומות בפועל כשיהיה ישות דינאמית
            setRecords([]);
            setFilteredRecords([]);
        } catch (error) {
            console.error('שגיאה בטעינת נתוני הדף:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        let filtered = [...records];

        if (searchQuery.trim()) {
            // חיפוש בכל השדות
            filtered = filtered.filter(record => {
                return fields.some(field => {
                    const value = record[field.field_name];
                    return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
                });
            });
        }

        if (selectedFilter !== 'הכל') {
            // כאן אפשר להוסיף סינונים נוספים בעתיד
        }

        setFilteredRecords(filtered);
    };

    const handleDeleteRecord = async (recordId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
            // TODO: מחיקת רשומה בפועל
            alert('פיצ׳ר מחיקה בפיתוח');
        }
    };

    // סינון דינאמי לפי שדות select
    const getFilterOptions = () => {
        const selectFields = fields.filter(f => f.field_type === 'select' && f.select_options?.length > 0);
        const options = ['הכל'];
        
        selectFields.forEach(field => {
            field.select_options.forEach(opt => {
                if (!options.includes(opt)) {
                    options.push(opt);
                }
            });
        });
        
        return options;
    };

    const filterOptions = getFilterOptions();

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                    <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען...</p>
                </div>
            </div>
        );
    }

    if (!object) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="text-center py-8">
                    <p className="text-gray-500">דף לא נמצא</p>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    const RecordCard = ({ record }) => {
        const displayFields = fields.slice(0, 3);
        
        return (
            <div className="bg-white border border-[#D9D9D9] rounded-[15px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {displayFields.map(field => (
                        <div key={field.id}>
                            <div className="text-sm text-gray-500">{field.field_label}</div>
                            <div className="text-base font-medium" style={{ fontFamily: 'Heebo' }}>
                                {record[field.field_name] || '-'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-full md:max-w-[1500px] mx-auto">
                
                {/* Desktop Top Controls */}
                <div className="hidden md:flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <CreateRecordModal 
                            object={object}
                            sections={sections}
                            fields={fields}
                            onRecordCreated={loadObjectData}
                        >
                            <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white py-2 h-12 px-6 rounded-[15px] text-[18px] font-bold">
                                <Plus className="w-5 h-5 ml-2" />
                                הוסף {object.object_name_singular}
                            </Button>
                        </CreateRecordModal>
                    </div>

                    <div className="flex-1 max-w-[470px] mx-8">
                        <div className="relative">
                            <Input
                                placeholder="חיפוש..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-[43px] pr-12 pl-4 border border-[#484848] rounded-[15px] text-right text-[16px]"
                                style={{ fontFamily: 'Heebo', color: '#858C94' }}
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#3568AE]" />
                        </div>
                    </div>

                    <div className="flex items-center border border-[#3568AE] rounded-[15px] h-12 overflow-hidden bg-white">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-r-none ${currentView === 'כרטיסיה' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo' }}
                            onClick={() => setCurrentView('כרטיסיה')}
                        >
                            <LayoutGrid className="w-5 h-5" />
                            כרטיסיה
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-l-none ${currentView === 'רשימה' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo' }}
                            onClick={() => setCurrentView('רשימה')}
                        >
                            <List className="w-5 h-5" />
                            רשימה
                        </Button>
                    </div>
                </div>

                {/* Mobile Top Controls */}
                <div className="md:hidden space-y-3 mb-4">
                    <CreateRecordModal 
                        object={object}
                        sections={sections}
                        fields={fields}
                        onRecordCreated={loadObjectData}
                    >
                        <Button className="w-full bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            <Plus className="w-5 h-5 ml-2" />
                            הוסף {object.object_name_singular}
                        </Button>
                    </CreateRecordModal>
                    
                    <div className="relative">
                        <Input
                            placeholder="חיפוש..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {filterOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    {/* Right Sidebar - Filter Panel - Desktop Only */}
                    <div className="hidden md:block w-[275px] bg-white rounded-[30px] p-6" style={{ height: 'fit-content' }}>
                        <div className="mb-6">
                            <h3 
                                className="text-[16px] font-bold leading-[24px] text-right mb-4"
                                style={{ 
                                    color: '#484848',
                                    fontFamily: 'Heebo'
                                }}
                            >
                                סינון {object.object_name}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {filterOptions.map((option, index) => (
                                <div key={option}>
                                    <div 
                                        className={`text-[16px] leading-[24px] text-right cursor-pointer py-3 px-2 rounded-lg transition-colors ${
                                            selectedFilter === option ? 'bg-blue-50 text-[#3568AE] font-medium' : 'text-[#484848] hover:bg-gray-50'
                                        }`}
                                        style={{ fontFamily: 'Heebo' }}
                                        onClick={() => setSelectedFilter(option)}
                                    >
                                        {option}
                                        <span className="text-sm text-gray-500 mr-2">
                                            ({option === 'הכל' ? records.length : 0})
                                        </span>
                                    </div>
                                    {index < filterOptions.length - 1 && (
                                        <hr style={{ border: '1px solid #D9D9D9' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        {/* Pagination Controls - Desktop only */}
                        <div className="hidden md:flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        <ChevronRight className="w-6 h-6 text-[#484848] cursor-pointer" />
                                    </Button>
                                    <Select onValueChange={(value) => setItemsPerPage(Number(value))} defaultValue={String(itemsPerPage)}>
                                        <SelectTrigger className="w-[80px] text-right border-[#484848] rounded-[15px] h-10">
                                            <SelectValue placeholder={itemsPerPage} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="8">8</SelectItem>
                                            <SelectItem value="12">12</SelectItem>
                                            <SelectItem value="24">24</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                        <ChevronLeft className="w-6 h-6 text-[#484848] cursor-pointer" />
                                    </Button>
                                </div>
                                <span className="text-[18px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                    מציג {paginatedRecords.length} מתוך {filteredRecords.length}
                                </span>
                            </div>

                            <div className="text-[18px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                עמוד {currentPage} מתוך {totalPages || 1}
                            </div>
                        </div>

                        {currentView === 'כרטיסיה' ? (
                            /* Card Grid View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {paginatedRecords.map((record) => (
                                    <RecordCard key={record.id} record={record} />
                                ))}
                            </div>
                        ) : (
                            /* Table View */
                            <div className="space-y-2">
                                <div className="hidden md:block bg-white rounded-[15px] p-6 mb-2">
                                    <div className="grid gap-4 items-center text-[16px] font-bold text-[#484848]" style={{ fontFamily: 'Heebo', gridTemplateColumns: `repeat(${Math.min(fields.length + 1, 6)}, 1fr)` }}>
                                        {fields.slice(0, 5).map(field => (
                                            <div key={field.id} className="text-right">{field.field_label}</div>
                                        ))}
                                        <div className="text-right">פעולות</div>
                                    </div>
                                </div>

                                <div className="border-t border-[#D9D9D9] mb-4"></div>

                                {paginatedRecords.map((record) => (
                                    <div key={record.id} className="bg-white rounded-[15px] p-3 md:p-6 hover:shadow-md transition-shadow">
                                        <div className="hidden md:grid gap-4 items-center text-[16px] text-[#484848]" style={{ fontFamily: 'Heebo', gridTemplateColumns: `repeat(${Math.min(fields.length + 1, 6)}, 1fr)` }}>
                                            {fields.slice(0, 5).map(field => (
                                                <div key={field.id} className="text-right">
                                                    {record[field.field_name] || '-'}
                                                </div>
                                            ))}
                                            <div className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="md:hidden">
                                            <RecordCard record={record} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredRecords.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p 
                                    className="text-[18px] mb-4"
                                    style={{ 
                                        color: '#858C94',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {searchQuery || selectedFilter !== 'הכל' 
                                        ? 'לא נמצאו רשומות התואמות לחיפוש'
                                        : `אין ${object.object_name} במערכת`}
                                </p>
                                <CreateRecordModal 
                                    object={object}
                                    sections={sections}
                                    fields={fields}
                                    onRecordCreated={loadObjectData}
                                >
                                    <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                        <Plus className="w-5 h-5 ml-2" />
                                        צור {object.object_name_singular} ראשון
                                    </Button>
                                </CreateRecordModal>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FieldPreview({ field }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
                {field.field_label}
                {field.is_required && <span className="text-red-500">*</span>}
                {field.is_read_only && <span className="text-xs text-gray-500">(לקריאה בלבד)</span>}
            </label>
            
            {field.field_type === 'textarea' && (
                <Textarea 
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    className="text-right"
                />
            )}
            
            {field.field_type === 'select' && (
                <Select disabled={field.is_read_only}>
                    <SelectTrigger>
                        <SelectValue placeholder={`בחר ${field.field_label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.select_options || []).map((option, idx) => (
                            <SelectItem key={idx} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            
            {field.field_type === 'checkbox' && (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        disabled={field.is_read_only}
                        className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">{field.field_label}</span>
                </div>
            )}
            
            {!['textarea', 'select', 'checkbox'].includes(field.field_type) && (
                <Input
                    type={field.field_type}
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    defaultValue={field.default_value || ''}
                    className="text-right"
                />
            )}
            
            {field.is_tracked && (
                <p className="text-xs text-gray-400">השדה מעוקב לשינויים</p>
            )}
        </div>
    );
}

function CreateRecordModal({ object, sections, fields, onRecordCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        // כאן תתווסף הלוגיקה לשמירת הרשומה במסד הנתונים
        alert('פיצ׳ר זה בפיתוח - יאפשר שמירת רשומות חדשות');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        הוסף {object.object_name_singular} חדש
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {sections.map(section => {
                        const sectionFields = fields.filter(f => f.section_id === section.id);
                        
                        return (
                            <div key={section.id} className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-4" style={{ fontFamily: 'Heebo' }}>
                                    {section.section_name}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sectionFields.map(field => (
                                        <FieldPreview key={field.id} field={field} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            שמור
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}