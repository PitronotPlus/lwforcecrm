import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, List, LayoutGrid, ChevronLeft, ChevronRight, Columns, Eye } from "lucide-react";
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
    const [currentUser, setCurrentUser] = useState(null);
    const [canAddRecords, setCanAddRecords] = useState(false);
    const [subAccounts, setSubAccounts] = useState([]);

    useEffect(() => {
        if (objectId) {
            loadObjectData();
            checkUserPermissions();
        }
    }, [objectId]);

    const checkUserPermissions = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
            const userRole = user.user_role || user.role;
            // רק מנהלי מערכת, בעלי משרד וראשי מחלקות יכולים להוסיף רשומות
            setCanAddRecords(userRole === 'admin' || userRole === 'owner' || userRole === 'department_head');
        } catch (error) {
            console.error('שגיאה בבדיקת הרשאות:', error);
            setCanAddRecords(false);
        }
    };

    useEffect(() => {
        filterRecords();
    }, [records, searchQuery, selectedFilter]);

    const loadObjectData = async () => {
        try {
            const [objectData, sectionsData, fieldsData, columnsData, subAccountsData] = await Promise.all([
                base44.entities.SystemObject.get(objectId),
                base44.entities.ObjectSection.filter({ object_id: objectId }),
                base44.entities.ObjectField.filter({ object_id: objectId }),
                base44.entities.ObjectColumn.filter({ object_id: objectId }),
                base44.entities.SubAccount.list()
            ]);
            
            setObject(objectData);
            setSections(sectionsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setFields(fieldsData.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
            setSubAccounts(subAccountsData);
            
            // טען רשומות
            const recordsData = await base44.entities.CustomRecord.filter({ object_id: objectId });
            setRecords(recordsData);
            setFilteredRecords(recordsData);
        } catch (error) {
            console.error('שגיאה בטעינת נתוני הדף:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        if (!records.length && !searchQuery && selectedFilter === 'הכל') {
            setFilteredRecords([]);
            return;
        }

        let filtered = [...records];

        if (searchQuery.trim()) {
            filtered = filtered.filter(record => {
                return fields.some(field => {
                    const value = record.data?.[field.field_name];
                    return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
                });
            });
        }

        if (selectedFilter !== 'הכל') {
            const section = sections.find(s => s.section_name === selectedFilter);
            if (section) {
                filtered = filtered.filter(record => record.section_id === section.id);
            }
        }

        setFilteredRecords(filtered);
        setCurrentPage(1);
    };

    const handleDeleteRecord = async (recordId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
            try {
                await base44.entities.CustomRecord.delete(recordId);
                loadObjectData();
            } catch (error) {
                console.error('שגיאה במחיקת רשומה:', error);
                alert('שגיאה במחיקת הרשומה');
            }
        }
    };

    // סינון דינאמי לפי מקטעי הסיידבר
    const getFilterOptions = () => {
        const options = ['הכל'];
        sections.forEach(section => {
            options.push(section.section_name);
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
        const subAccount = subAccounts.find(s => s.id === record.sub_account_id);
        
        return (
            <div className="bg-white border border-[#D9D9D9] rounded-[15px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                        <ViewRecordModal
                            record={record}
                            object={object}
                            fields={fields}
                            sections={sections}
                            subAccount={subAccount}
                        >
                            <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-700">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </ViewRecordModal>
                        <EditRecordModal
                            record={record}
                            object={object}
                            fields={fields}
                            sections={sections}
                            onRecordUpdated={loadObjectData}
                        >
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </EditRecordModal>
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
                
                <div className="space-y-2">
                    {subAccount && (
                        <div className="pb-2 border-b">
                            <div className="text-sm text-gray-500">משרד מקושר</div>
                            <div className="text-base font-medium" style={{ fontFamily: 'Heebo' }}>
                                {subAccount.name}
                            </div>
                        </div>
                    )}
                    {displayFields.map(field => (
                        <div key={field.id}>
                            <div className="text-sm text-gray-500">{field.field_label}</div>
                            <div className="text-base font-medium" style={{ fontFamily: 'Heebo' }}>
                                {record.data?.[field.field_name] || '-'}
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
                        {canAddRecords && (
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
                        )}
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
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-none ${currentView === 'כרטיסיה' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo', borderRadius: '15px 0 0 15px' }}
                            onClick={() => setCurrentView('כרטיסיה')}
                        >
                            <LayoutGrid className="w-5 h-5" />
                            כרטיסיה
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-none border-x ${currentView === 'לוח' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo' }}
                            onClick={() => setCurrentView('לוח')}
                        >
                            <Columns className="w-5 h-5" />
                            לוח
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-none ${currentView === 'רשימה' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo', borderRadius: '0 15px 15px 0' }}
                            onClick={() => setCurrentView('רשימה')}
                        >
                            <List className="w-5 h-5" />
                            רשימה
                        </Button>
                    </div>
                </div>

                {/* Mobile Top Controls */}
                <div className="md:hidden space-y-3 mb-4">
                    {canAddRecords && (
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
                    )}
                    
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
                            {filterOptions.map((option, index) => {
                                const section = sections.find(s => s.section_name === option);
                                const count = option === 'הכל' 
                                    ? records.length 
                                    : records.filter(r => section && r.section_id === section.id).length;
                                
                                return (
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
                                                ({count})
                                            </span>
                                        </div>
                                        {index < filterOptions.length - 1 && (
                                            <hr style={{ border: '1px solid #D9D9D9' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        {/* Pagination Controls - Desktop only, מוסתר בתצוגת לוח */}
                        {currentView !== 'לוח' && (
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
                        )}

                        {currentView === 'לוח' ? (
                            /* Board View */
                            <div className="hidden md:grid grid-cols-4 gap-4">
                                {sections.length > 0 ? (
                                    sections.map(section => {
                                        const sectionRecords = filteredRecords.filter(r => r.section_id === section.id);
                                        
                                        return (
                                            <div key={section.id} className="bg-gray-50/50 rounded-lg p-3 min-h-[200px]">
                                                <h3 
                                                    className="text-[18px] font-medium text-right mb-4"
                                                    style={{ 
                                                        color: '#484848',
                                                        fontFamily: 'Heebo'
                                                    }}
                                                >
                                                    {section.section_name} ({sectionRecords.length})
                                                </h3>
                                                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                                    {sectionRecords.map((record) => (
                                                        <RecordCard key={record.id} record={record} />
                                                    ))}
                                                    {sectionRecords.length === 0 && (
                                                        <p className="text-sm text-gray-400 text-center py-4">אין רשומות</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-4 text-center py-12">
                                        <p className="text-gray-500">אין מקטעי סיידבר מוגדרים</p>
                                    </div>
                                )}
                            </div>
                        ) : currentView === 'כרטיסיה' ? (
                            /* Card Grid View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {paginatedRecords.map((record) => (
                                    <RecordCard key={record.id} record={record} />
                                ))}
                            </div>
                        ) : (
                            /* Table View */
                            <div className="space-y-2">
                                {/* Table Header - Desktop Only */}
                                <div className="hidden md:block bg-white rounded-[15px] p-6 mb-2">
                                    <div className="grid gap-4 items-center text-[16px] font-bold text-[#484848]" style={{ fontFamily: 'Heebo', gridTemplateColumns: `repeat(${Math.min(fields.length, 5)}, 1fr) auto` }}>
                                        {fields.slice(0, 5).map(field => (
                                            <div key={field.id} className="text-right">{field.field_label}</div>
                                        ))}
                                        <div className="text-right">פעולות</div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[#D9D9D9] mb-4"></div>

                                {/* Table Rows */}
                                {paginatedRecords.map((record) => (
                                    <div key={record.id} className="bg-white rounded-[15px] p-3 md:p-6 hover:shadow-md transition-shadow">
                                        {/* Desktop Table Row */}
                                        <div className="hidden md:grid gap-4 items-center text-[16px] text-[#484848]" style={{ fontFamily: 'Heebo', gridTemplateColumns: `repeat(${Math.min(fields.length, 5)}, 1fr) auto` }}>
                                            {fields.slice(0, 5).map(field => (
                                                <div key={field.id} className="text-right">
                                                    {record.data?.[field.field_name] || '-'}
                                                </div>
                                            ))}
                                            <div className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <ViewRecordModal
                                                        record={record}
                                                        object={object}
                                                        fields={fields}
                                                        sections={sections}
                                                        subAccount={subAccounts.find(s => s.id === record.sub_account_id)}
                                                    >
                                                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-700">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </ViewRecordModal>
                                                    <EditRecordModal
                                                        record={record}
                                                        object={object}
                                                        fields={fields}
                                                        sections={sections}
                                                        onRecordUpdated={loadObjectData}
                                                    >
                                                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </EditRecordModal>
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

                                        {/* Mobile Card Layout */}
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
                                {canAddRecords && (
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
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FieldInput({ field, value, onChange }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Heebo' }}>
                {field.field_label}
                {field.is_required && <span className="text-red-500">*</span>}
                {field.is_read_only && <span className="text-xs text-gray-500">(לקריאה בלבד)</span>}
            </label>
            
            {field.field_type === 'textarea' && (
                <Textarea 
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-right"
                />
            )}
            
            {field.field_type === 'select' && (
                <Select 
                    disabled={field.is_read_only}
                    value={value}
                    onValueChange={onChange}
                >
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
                        checked={value === true}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4"
                    />
                </div>
            )}
            
            {!['textarea', 'select', 'checkbox'].includes(field.field_type) && (
                <Input
                    type={field.field_type}
                    placeholder={`הזן ${field.field_label}`}
                    disabled={field.is_read_only}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="text-right"
                />
            )}
        </div>
    );
}

function EditRecordModal({ record, object, fields, sections, onRecordUpdated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedSection, setSelectedSection] = useState('');

    useEffect(() => {
        if (record?.data) {
            setFormData(record.data);
        }
        if (record?.section_id) {
            setSelectedSection(record.section_id);
        }
    }, [record]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const missingFields = fields.filter(f => f.is_required && !formData[f.field_name]);
        if (missingFields.length > 0) {
            alert(`יש למלא את השדות הבאים: ${missingFields.map(f => f.field_label).join(', ')}`);
            return;
        }

        if (!selectedSection && sections.length > 0) {
            alert('יש לבחור מקטע');
            return;
        }

        try {
            await base44.entities.CustomRecord.update(record.id, {
                section_id: selectedSection,
                data: formData
            });
            
            onRecordUpdated();
            setIsOpen(false);
        } catch (error) {
            console.error('שגיאה בעדכון רשומה:', error);
            alert('שגיאה בעדכון הרשומה');
        }
    };

    const updateField = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        ערוך {object.object_name_singular}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {sections.length > 0 && (
                        <div className="border-b pb-4">
                            <label className="text-sm font-medium mb-2 block" style={{ fontFamily: 'Heebo' }}>
                                בחר מקטע *
                            </label>
                            <Select 
                                value={selectedSection}
                                onValueChange={setSelectedSection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר מקטע" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(section => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.section_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(field => (
                            <FieldInput 
                                key={field.id} 
                                field={field} 
                                value={formData[field.field_name] || ''}
                                onChange={(value) => updateField(field.field_name, value)}
                            />
                        ))}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            ביטול
                        </Button>
                        <Button type="submit" className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                            עדכן
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ViewRecordModal({ record, object, fields, sections, subAccount, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const section = sections.find(s => s.id === record.section_id);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Heebo' }}>
                        צפייה ב{object.object_name_singular}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {subAccount && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-gray-700 mb-1">משרד מקושר</div>
                            <div className="text-lg font-bold text-[#3568AE]" style={{ fontFamily: 'Heebo' }}>
                                {subAccount.name}
                            </div>
                        </div>
                    )}
                    
                    {section && (
                        <div className="border-b pb-4">
                            <div className="text-sm font-medium text-gray-700 mb-1">מקטע</div>
                            <Badge className="text-base" style={{ backgroundColor: section.color || '#3568AE' }}>
                                {section.section_name}
                            </Badge>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map(field => (
                            <div key={field.id} className="space-y-1">
                                <div className="text-sm font-medium text-gray-700">
                                    {field.field_label}
                                </div>
                                <div className="text-base p-3 bg-gray-50 rounded-lg" style={{ fontFamily: 'Heebo' }}>
                                    {field.field_type === 'checkbox' 
                                        ? (record.data?.[field.field_name] ? 'כן' : 'לא')
                                        : (record.data?.[field.field_name] || '-')
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t">
                        <Button type="button" onClick={() => setIsOpen(false)}>
                            סגור
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CreateRecordModal({ object, sections, fields, onRecordCreated, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedSection, setSelectedSection] = useState('');

    useEffect(() => {
        const initialData = {};
        fields.forEach(field => {
            if (field.default_value) {
                initialData[field.field_name] = field.default_value;
            }
        });
        setFormData(initialData);
    }, [fields]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const missingFields = fields.filter(f => f.is_required && !formData[f.field_name]);
        if (missingFields.length > 0) {
            alert(`יש למלא את השדות הבאים: ${missingFields.map(f => f.field_label).join(', ')}`);
            return;
        }

        if (!selectedSection && sections.length > 0) {
            alert('יש לבחור מקטע');
            return;
        }

        try {
            const user = await base44.auth.me();
            
            // בדיקה שהמשתמש מורשה להוסיף רשומות
            const userRole = user.user_role || user.role;
            if (userRole === 'lawyer') {
                alert('אין לך הרשאה להוסיף רשומות');
                return;
            }
            
            await base44.entities.CustomRecord.create({
                object_id: object.id,
                section_id: selectedSection,
                data: formData,
                sub_account_id: user?.sub_account_id
            });
            
            onRecordCreated();
            setIsOpen(false);
            setFormData({});
            setSelectedSection('');
        } catch (error) {
            console.error('שגיאה ביצירת רשומה:', error);
            alert('שגיאה ביצירת הרשומה');
        }
    };

    const updateField = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
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
                    {sections.length > 0 && (
                        <div className="border-b pb-4">
                            <label className="text-sm font-medium mb-2 block" style={{ fontFamily: 'Heebo' }}>
                                בחר מקטע *
                            </label>
                            <Select 
                                value={selectedSection}
                                onValueChange={setSelectedSection}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר מקטע" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(section => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.section_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(field => (
                            <FieldInput 
                                key={field.id} 
                                field={field} 
                                value={formData[field.field_name] || ''}
                                onChange={(value) => updateField(field.field_name, value)}
                            />
                        ))}
                    </div>
                    
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