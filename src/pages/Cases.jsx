import { useState, useEffect } from "react";
import { Case } from "@/entities/Case";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseModal from "../components/cases/CaseModal";

export default function Cases() {
    const [cases, setCases] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingCase, setEditingCase] = useState(null);

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            setLoading(true);
            const data = await Case.list('-created_date');
            setCases(data);
        } catch (error) {
            console.error("שגיאה בטעינת תיקים:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCaseSaved = () => {
        setEditingCase(null);
        loadCases();
    }

    const handleDeleteCase = async (caseId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את התיק?')) {
            try {
                await Case.delete(caseId);
                loadCases();
            } catch (error) {
                console.error('שגיאה במחיקת תיק:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'פעיל': 'bg-green-100 text-green-800',
            'סגור': 'bg-red-100 text-red-800',
            'בהמתנה': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredCases = cases.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.case_number && c.case_number.includes(searchQuery))
    );

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex justify-center items-center" style={{ background: '#F5F5F5' }}>
                <p>טוען תיקים...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 
                        className="text-[32px] font-bold"
                        style={{ color: '#3568AE', fontFamily: 'Heebo' }}
                    >
                        ניהול תיקים
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-sm">
                            <Input
                                placeholder="חיפוש לפי כותרת, לקוח, מספר תיק"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <CaseModal onCaseSaved={handleCaseSaved}>
                             <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                <Plus className="w-4 h-4 ml-2" />
                                תיק חדש
                            </Button>
                        </CaseModal>
                    </div>
                </div>

                <div className="bg-white rounded-[20px] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-4 font-medium">כותרת התיק</th>
                                    <th className="p-4 font-medium">לקוח</th>
                                    <th className="p-4 font-medium">סוג</th>
                                    <th className="p-4 font-medium">סטטוס</th>
                                    <th className="p-4 font-medium">תאריך פתיחה</th>
                                    <th className="p-4 font-medium">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCases.map(caseItem => (
                                    <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{caseItem.title}</td>
                                        <td className="p-4">
                                            <Link 
                                                to={`${createPageUrl('ClientDetails')}?id=${caseItem.client_id}`}
                                                className="text-[#3B7CDF] hover:underline flex items-center gap-1"
                                            >
                                                {caseItem.client_name}
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </td>
                                        <td className="p-4">{caseItem.case_type}</td>
                                        <td className="p-4">
                                            <Badge className={getStatusColor(caseItem.status)}>
                                                {caseItem.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {new Date(caseItem.opening_date).toLocaleDateString('he-IL')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <CaseModal caseToEdit={caseItem} onCaseSaved={handleCaseSaved}>
                                                    <Button variant="ghost" size="sm" className="text-blue-500">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </CaseModal>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCase(caseItem.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCases.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">לא נמצאו תיקים.</p>
                             <CaseModal onCaseSaved={handleCaseSaved}>
                                <Button className="bg-[#67BF91] hover:bg-[#5AA880] text-white">
                                    <Plus className="w-4 h-4 ml-2" />
                                    צור תיק ראשון
                                </Button>
                            </CaseModal>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}