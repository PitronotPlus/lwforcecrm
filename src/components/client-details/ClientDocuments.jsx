import React, { useState, useEffect } from "react";
import { ClientDocument } from "@/entities/ClientDocument";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Download, Trash2, Upload } from "lucide-react";
import { logClientActivity } from './activityLogger';

export default function ClientDocuments({ client }) {
    const [documents, setDocuments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newDocument, setNewDocument] = useState({
        document_name: '',
        document_type: 'אחר',
        notes: '',
        file: null
    });

    useEffect(() => {
        loadDocuments();
        loadUser();
    }, [client.id]);

    const loadUser = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
        } catch (error) {
            console.error("שגיאה בטעינת משתמש:", error);
        }
    };

    const loadDocuments = async () => {
        try {
            const data = await ClientDocument.filter({ client_id: client.id });
            setDocuments(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error("שגיאה בטעינת מסמכים:", error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({
                ...newDocument,
                file: file,
                document_name: newDocument.document_name || file.name
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newDocument.file) {
            alert('יש לבחור קובץ');
            return;
        }

        const performedBy = currentUser?.full_name || currentUser?.email || 'לא ידוע';

        try {
            setUploading(true);
            
            // העלאת הקובץ
            const { file_url } = await base44.integrations.Core.UploadFile({
                file: newDocument.file
            });

            // יצירת רשומת מסמך
            await ClientDocument.create({
                client_id: client.id,
                client_name: client.full_name,
                document_name: newDocument.document_name,
                document_type: newDocument.document_type,
                file_url: file_url,
                file_size: newDocument.file.size,
                uploaded_by: performedBy,
                notes: newDocument.notes
            });

            // תיעוד בלוג פעילות
            await logClientActivity(
                client.id,
                'מסמך הועלה',
                `הועלה מסמך: ${newDocument.document_name} (${newDocument.document_type})`,
                performedBy
            );

            setNewDocument({ document_name: '', document_type: 'אחר', notes: '', file: null });
            setShowForm(false);
            loadDocuments();
        } catch (error) {
            console.error("שגיאה בהעלאת מסמך:", error);
            alert('שגיאה בהעלאת המסמך');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (doc) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את המסמך?')) {
            const performedBy = currentUser?.full_name || currentUser?.email || 'לא ידוע';
            try {
                await ClientDocument.delete(doc.id);

                // תיעוד בלוג פעילות
                await logClientActivity(
                    client.id,
                    'מסמך נמחק',
                    `נמחק מסמך: ${doc.document_name}`,
                    performedBy
                );

                loadDocuments();
            } catch (error) {
                console.error("שגיאה במחיקת מסמך:", error);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ fontFamily: 'Heebo' }}>מסמכים ({documents.length})</CardTitle>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                >
                    <Plus className="ml-2 w-4 h-4" />
                    {showForm ? 'ביטול' : 'העלה מסמך'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-purple-100">
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer w-full">
                                <Upload className="w-5 h-5" />
                                <span>{newDocument.file ? newDocument.file.name : 'לחץ לבחירת קובץ'}</span>
                            </label>
                        </div>

                        <Input
                            placeholder="שם המסמך"
                            value={newDocument.document_name}
                            onChange={(e) => setNewDocument({...newDocument, document_name: e.target.value})}
                            required
                        />
                        
                        <Select
                            value={newDocument.document_type}
                            onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="תעודת זהות">תעודת זהות</SelectItem>
                                <SelectItem value="חוזה">חוזה</SelectItem>
                                <SelectItem value="מסמך משפטי">מסמך משפטי</SelectItem>
                                <SelectItem value="תכתובת">תכתובת</SelectItem>
                                <SelectItem value="חשבונית">חשבונית</SelectItem>
                                <SelectItem value="אחר">אחר</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Textarea
                            placeholder="הערות (אופציונלי)"
                            value={newDocument.notes}
                            onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                            rows={2}
                        />
                        
                        <div className="flex gap-2">
                            <Button 
                                type="submit" 
                                disabled={uploading}
                                className="bg-[#67BF91] hover:bg-[#5AA880]"
                            >
                                {uploading ? 'מעלה...' : 'שמור'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
                        </div>
                    </form>
                )}

                {documents.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div className="flex items-start gap-3 flex-1">
                                    <FileText className="w-5 h-5 text-blue-500 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-medium">{doc.document_name}</p>
                                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                            <span>{doc.document_type}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(doc.file_size)}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.created_date).toLocaleDateString('he-IL')}</span>
                                        </div>
                                        {doc.notes && <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>}
                                        <p className="text-xs text-gray-500 mt-1">הועלה על ידי: {doc.uploaded_by}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </a>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDelete(doc)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">אין מסמכים</p>
                )}
            </CardContent>
        </Card>
    );
}