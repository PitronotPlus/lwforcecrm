import React, { useState, useEffect } from "react";
import { Client } from "@/entities/Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, List, LayoutGrid, Filter, ChevronLeft, ChevronRight, ChevronDown, Plus, Edit, Trash2, Eye } from 'lucide-react';
import CreateClientModal from "../components/clients/CreateClientModal";
import ViewClientModal from "../components/clients/ViewClientModal";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExportClients from "../components/clients/ExportClients";
import ImportClients from "../components/clients/ImportClients";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('לוח');
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('כל הלקוחות');
    const [loading, setLoading] = useState(true);

    const filterOptions = [
        'כל הלקוחות',
        'לידים',
        'פולואפ',
        'לקוחות',
        'לא נסגר',
        'יקר עבורו'
    ];

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page on filter change
        filterClients();
    }, [clients, searchQuery, selectedFilter]);
    
    useEffect(() => {
        filterClients();
    }, [currentPage, itemsPerPage]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await Client.list('-created_date');
            setClients(data);
            setFilteredClients(data); // Initial set
        } catch (error) {
            console.error('שגיאה בטעינת לקוחות:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        let filtered = [...clients];

        // סינון לפי חיפוש
        if (searchQuery.trim()) {
            filtered = filtered.filter(client =>
                client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.phone?.includes(searchQuery) ||
                client.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // סינון לפי סטטוס
        if (selectedFilter !== 'כל הלקוחות') {
            const statusMap = {
                'לידים': 'ליד',
                'פולואפ': 'פולואפ',
                'לקוחות': 'לקוח',
                'לא נסגר': 'לא נסגר',
                'יקר עבורו': 'יקר עבורו'
            };
            
            if (statusMap[selectedFilter]) {
                filtered = filtered.filter(client => client.status === statusMap[selectedFilter]);
            }
        }

        setFilteredClients(filtered);
    };

    const handleDeleteClient = async (clientId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את הלקוח?')) {
            try {
                await Client.delete(clientId);
                loadClients();
            } catch (error) {
                console.error('שגיאה במחיקת לקוח:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'ליד': 'bg-blue-100 text-blue-800',
            'פולואפ': 'bg-yellow-100 text-yellow-800',
            'לקוח': 'bg-green-100 text-green-800',
            'לא נסגר': 'bg-red-100 text-red-800',
            'יקר עבורו': 'bg-orange-100 text-orange-800',
            'נתפס לפני שטופל': 'bg-purple-100 text-purple-800',
            'לא רלוונטי': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // חישוב עמודים
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

    const ClientCard = ({ client }) => (
        <div className="bg-white border border-[#D9D9D9] rounded-[15px] p-4 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div>
                 <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                        <ViewClientModal client={client}>
                            <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-700">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </ViewClientModal>
                        <Link to={`${createPageUrl('ClientDetails')}?id=${client.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <Badge className={getStatusColor(client.status)}>
                        {client.status}
                    </Badge>
                </div>
            
                <Link to={`${createPageUrl('ClientDetails')}?id=${client.id}`} className="block">
                    <div 
                        className="text-[16px] font-medium leading-[24px] text-right mb-2 hover:text-blue-600"
                        style={{ 
                            color: '#484848',
                            fontFamily: 'Heebo'
                        }}
                    >
                        {client.full_name}
                    </div>
                     <div 
                        className="text-[14px] leading-[21px] text-right mb-1"
                        style={{ 
                            color: '#484848',
                            fontFamily: 'Heebo'
                        }}
                    >
                        <span className="text-[#3B7CDF] cursor-pointer">טלפון: {client.phone}</span>
                    </div>
                </Link>
            </div>
            <div>
                 {client.service_type && (
                    <div 
                        className="text-[12px] leading-[18px] text-right mt-2 text-gray-600"
                        style={{ fontFamily: 'Heebo' }}
                    >
                        שירות: {client.service_type}
                    </div>
                )}
            </div>
        </div>
    );

    // קיבוץ לקוחות לפי סטטוס עבור תצוגת לוח - מציג את כל הלקוחות המסוננים בלי פגינציה
    const boardColumns = {
        'לידים': 'ליד',
        'פולואפ': 'פולואפ',
        'לקוחות': 'לקוח',
        'אחר': null // עמודה לכל השאר
    };
    
    const groupedClientsForBoard = Object.keys(boardColumns).reduce((acc, columnTitle) => {
        const status = boardColumns[columnTitle];
        if (status === null) {
            // עמודת "אחר" - כל מה שלא נכלל בקטגוריות הקודמות
            acc[columnTitle] = filteredClients.filter(c => 
                !['ליד', 'פולואפ', 'לקוח'].includes(c.status)
            );
        } else {
            acc[columnTitle] = filteredClients.filter(c => c.status === status);
        }
        return acc;
    }, {});


    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
                <div className="max-w-[1344px] mx-auto flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3568AE] mx-auto mb-4"></div>
                        <p style={{ fontFamily: 'Heebo', color: '#858C94' }}>טוען לקוחות...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-full md:max-w-[1500px] mx-auto">
                
                {/* Desktop Top Controls */}
                <div className="hidden md:flex items-center justify-between mb-8">
                    {/* Left side - New Client Button */}
                    <div className="flex items-center gap-4">
                        <CreateClientModal onClientCreated={loadClients} />
                        <ExportClients clients={filteredClients} />
                        <ImportClients onImportComplete={loadClients} />
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-[470px] mx-8">
                        <div className="relative">
                            <Input
                                placeholder="חיפוש לפי שם/ טלפון/ סטטוס"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-[43px] pr-12 pl-4 border border-[#484848] rounded-[15px] text-right text-[16px]"
                                style={{ fontFamily: 'Heebo', color: '#858C94' }}
                            />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#3568AE]" />
                        </div>
                    </div>

                    {/* Right side - View Options */}
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
                            className={`h-full px-4 flex items-center gap-2 text-[16px] rounded-none ${currentView === 'לוח' ? 'bg-[#3568AE] text-white hover:bg-[#3568AE]' : 'bg-white text-[#858C94] hover:bg-gray-100'}`}
                            style={{ fontFamily: 'Heebo' }}
                            onClick={() => setCurrentView('לוח')}
                        >
                            <LayoutGrid className="w-5 h-5" />
                            לוח
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
                    <div className="flex items-center justify-between gap-2">
                        <CreateClientModal onClientCreated={loadClients} />
                        <ExportClients clients={filteredClients} />
                        <ImportClients onImportComplete={loadClients} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={currentView} onValueChange={setCurrentView}>
                            <SelectTrigger className="flex-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="כרטיסיה">כרטיסיה</SelectItem>
                                <SelectItem value="רשימה">רשימה</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="relative">
                        <Input
                            placeholder="חיפוש לקוח..."
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
                                סינון לקוחות
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
                                            ({(option === 'כל הלקוחות' ? clients : clients.filter(c => c.status === {
                                                    'לידים': 'ליד',
                                                    'פולואפ': 'פולואפ',
                                                    'לקוחות': 'לקוח',
                                                    'לא נסגר': 'לא נסגר',
                                                    'יקר עבורו': 'יקר עבורו'
                                                }[option]
                                            )).length})
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
                                    מציג {paginatedClients.length} מתוך {filteredClients.length}
                                </span>
                            </div>

                            <div className="text-[18px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                עמוד {currentPage} מתוך {totalPages || 1}
                            </div>
                        </div>
                        )}

                        {currentView === 'לוח' ? (
                            <div className="hidden md:grid grid-cols-4 gap-4">
                                {Object.entries(groupedClientsForBoard).map(([columnTitle, clientsInColumn]) => (
                                    <div key={columnTitle} className="bg-gray-50/50 rounded-lg p-3 min-h-[200px]">
                                        <h3 
                                            className="text-[18px] font-medium text-right mb-4"
                                            style={{ 
                                                color: '#484848',
                                                fontFamily: 'Heebo'
                                            }}
                                        >
                                            {columnTitle} ({clientsInColumn.length})
                                        </h3>
                                        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                            {clientsInColumn.map((client) => (
                                                <ClientCard key={client.id} client={client} />
                                            ))}
                                            {clientsInColumn.length === 0 && (
                                                <p className="text-sm text-gray-400 text-center py-4">אין לקוחות</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : currentView === 'כרטיסיה' ? (
                            /* Card Grid View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {paginatedClients.map((client) => (
                                    <ClientCard key={client.id} client={client} />
                                ))}
                            </div>
                        ) : (
                            /* Table View */
                            <div className="space-y-2">
                                {/* Table Header - Desktop Only */}
                                <div className="hidden md:block bg-white rounded-[15px] p-6 mb-2">
                                    <div className="grid grid-cols-6 gap-4 items-center text-[16px] font-bold text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                        <div className="text-right">שם הלקוח</div>
                                        <div className="text-right">טלפון</div>
                                        <div className="text-right">סטטוס</div>
                                        <div className="text-right">שירות</div>
                                        <div className="text-right">תאריך יצירה</div>
                                        <div className="text-right">פעולות</div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[#D9D9D9] mb-4"></div>

                                {/* Table Rows */}
                                {paginatedClients.map((client) => (
                                    <div key={client.id} className="bg-white rounded-[15px] p-3 md:p-6 hover:shadow-md transition-shadow">
                                        {/* Desktop Table Row */}
                                        <div className="hidden md:grid grid-cols-6 gap-4 items-center text-[16px] text-[#484848]" style={{ fontFamily: 'Heebo' }}>
                                            <div className="text-right">
                                                <Link 
                                                    to={`${createPageUrl('ClientDetails')}?id=${client.id}`}
                                                    className="font-medium hover:text-blue-600"
                                                >
                                                    {client.full_name}
                                                </Link>
                                            </div>
                                            <div className="text-right">
                                                <a href={`tel:${client.phone}`} className="text-[#3B7CDF] hover:underline">
                                                    {client.phone}
                                                </a>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(client.status)}>
                                                    {client.status}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                {client.service_type || '-'}
                                            </div>
                                            <div className="text-right">
                                                {new Date(client.created_date).toLocaleDateString('he-IL')}
                                            </div>
                                            <div className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <ViewClientModal client={client}>
                                                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-700">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </ViewClientModal>
                                                    <Link to={`${createPageUrl('ClientDetails')}?id=${client.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClient(client.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Mobile Card Layout */}
                                        <div className="md:hidden">
                                            <div className="flex items-start justify-between mb-2">
                                                <Link to={`${createPageUrl('ClientDetails')}?id=${client.id}`} className="flex-1">
                                                    <div className="font-medium text-base mb-1">{client.full_name}</div>
                                                    <a href={`tel:${client.phone}`} className="text-sm text-[#3B7CDF]" onClick={(e) => e.stopPropagation()}>
                                                        {client.phone}
                                                    </a>
                                                </Link>
                                                <Badge className={getStatusColor(client.status)}>
                                                    {client.status}
                                                </Badge>
                                            </div>
                                            {client.service_type && (
                                                <div className="text-sm text-gray-600 mb-2">
                                                    שירות: {client.service_type}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Link to={`${createPageUrl('ClientDetails')}?id=${client.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Edit className="w-4 h-4 ml-1" />
                                                        ערוך
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredClients.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p 
                                    className="text-[18px] mb-4"
                                    style={{ 
                                        color: '#858C94',
                                        fontFamily: 'Heebo'
                                    }}
                                >
                                    {searchQuery || selectedFilter !== 'כל הלקוחות' 
                                        ? 'לא נמצאו לקוחות התואמים לחיפוש'
                                        : 'אין לקוחות במערכת'}
                                </p>
                                <CreateClientModal 
                                    onClientCreated={loadClients}
                                    triggerText="צור לקוח ראשון"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}