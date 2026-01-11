import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileSignature, Send, Edit, Trash2, Eye, Mail, Link2, Loader2, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TemplateEditor from '../components/signatures/TemplateEditor';
import SendModal from '../components/signatures/SendModal';
import { createPageUrl } from '@/utils';

export default function DigitalSignatures() {
  const [templates, setTemplates] = useState([]);
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [selectedDocumentForResend, setSelectedDocumentForResend] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [templatesData, documentsData, clientsData] = await Promise.all([
        base44.entities.DigitalSignatureTemplate.list('-created_date'),
        base44.entities.SignedDocument.list('-created_date'),
        base44.entities.Client.list()
      ]);
      
      setTemplates(templatesData);
      setSignedDocuments(documentsData);
      setClients(clientsData);
    } catch (error) {
      console.error('שגיאה בטעינת הנתונים:', error);
    }
    setIsLoading(false);
  };
  
  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await base44.entities.DigitalSignatureTemplate.update(editingTemplate.id, templateData);
      } else {
        await base44.entities.DigitalSignatureTemplate.create(templateData);
      }
      setShowEditor(false);
      setEditingTemplate(null);
      loadData();
    } catch (error) {
      console.error('שגיאה בשמירת התבנית:', error);
      alert('שגיאה בשמירת התבנית');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את התבנית?')) {
      try {
        await base44.entities.DigitalSignatureTemplate.delete(templateId);
        loadData();
      } catch (error) {
        console.error('שגיאה במחיקת התבנית:', error);
        alert('שגיאה במחיקת התבנית');
      }
    }
  };

  const handleOpenSendModal = (template) => {
    setSelectedTemplate(template);
    setShowSendModal(true);
  };
  
  const handleSendRequest = async (templateId, leadId, method = 'email') => {
    try {
      if (method === 'email') {
        const result = await base44.functions.invoke('sendSignatureRequest', { templateId, leadId });
        
        if (result?.data?.success) {
          alert(result.data.message || 'הבקשה לחתימה נשלחה במייל בהצלחה!');
        } else {
          const errorMessage = result?.data?.error || 'שגיאה בשליחת הבקשה';
          let fullAlertMessage = `שגיאה: ${errorMessage}`;
          if (result?.data?.signingUrl) {
            fullAlertMessage += `\n\nבמידה והאימייל לא נשלח, הקישור לחתימה הוא: ${result.data.signingUrl}`;
          }
          alert(fullAlertMessage);
        }
      }
      setShowSendModal(false);
      loadData();
    } catch (error) {
      console.error('שגיאה בשליחת הבקשה:', error);
      alert('שגיאה בשליחת הבקשה לחתימה.');
    }
  };

  const handleCreateLink = async (templateId, leadId) => {
    try {
      const { data } = await base44.functions.invoke('createSigningLink', { templateId, leadId });
      if (data.success) {
        return data.signingUrl;
      } else {
        throw new Error(data.error || 'שגיאה ביצירת הקישור');
      }
    } catch (error) {
      console.error('שגיאה ביצירת הקישור:', error);
      throw error;
    }
  };

  const handleOpenResendModal = (doc) => {
    setSelectedDocumentForResend(doc);
    setShowResendModal(true);
  };

  const handleResendDocument = async (method) => {
    const doc = selectedDocumentForResend;
    const template = templates.find(t => t.id === doc.template_id);
    const client = clients.find(c => c.id === doc.lead_id);
    
    if (!template || !client) {
      alert('לא ניתן למצוא את פרטי התבנית או הלקוח');
      return;
    }

    try {
      if (method === 'email') {
        await base44.functions.invoke('resendSignatureRequest', { 
          documentId: doc.id, 
          method: 'email' 
        });
        alert('המייל נשלח שוב בהצלחה!');
      } else if (method === 'copy') {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const signingUrl = `${protocol}//${host}${createPageUrl(`SignDocument?token=${doc.signing_token}`)}`;
        
        try {
          await navigator.clipboard.writeText(signingUrl);
          alert('הקישור המלא הועתק ללוח! כעת תוכל להדביק אותו בווטסאפ או בכל מקום אחר.');
        } catch (err) {
          prompt('העתק את הקישור המלא הזה:', signingUrl);
        }
      }
      
      setShowResendModal(false);
      setSelectedDocumentForResend(null);
      loadData();
    } catch (error) {
      console.error('שגיאה בשליחה חוזרת:', error);
      alert('שגיאה בשליחה חוזרת: ' + error.message);
    }
  };

  const handleVoidDocument = async (docId) => {
    if (confirm('האם לבטל את המסמך? הקישור לחתימה יפסיק לעבוד.')) {
      try {
        await base44.functions.invoke('voidSignatureRequest', { documentId: docId });
        alert('המסמך בוטל בהצלחה.');
        loadData();
      } catch (error) {
        console.error('שגיאה בביטול המסמך:', error);
        alert('שגיאה בביטול המסמך.');
      }
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מסמך זה לצמיתות? הקובץ יימחק מהשרת והפעולה אינה הפיכה.')) {
      try {
        await base44.functions.invoke('deleteSignedDocument', { documentId: docId });
        alert('המסמך נמחק בהצלחה.');
        loadData();
      } catch (error) {
        console.error('שגיאה במחיקת המסמך:', error);
        alert('שגיאה במחיקת המסמך.');
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen" style={{ background: '#F5F5F5' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#3568AE' }}>
              חתימה דיגיטלית
            </h1>
            <p className="text-sm sm:text-base text-gray-600">צור ונהל תבניות מסמכים לשליחה וחתימה דיגיטלית</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => window.open(createPageUrl('TestSignature'), '_blank')}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto text-xs sm:text-sm"
            >
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">בדיקת מערכת למפתחים</span>
              <span className="sm:hidden">בדיקה</span>
            </Button>
            <Button
              onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
              className="text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
              size="sm"
              style={{ background: '#3568AE' }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
              צור תבנית חדשה
            </Button>
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">תבניות מסמכים</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[640px]">
              <thead className="border-b bg-gray-50/50">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">שם התבנית</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">מספר שדות</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base hidden sm:table-cell">תאריך יצירה</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">טוען תבניות...</td>
                  </tr>
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">לא נמצאו תבניות.</td>
                  </tr>
                ) : (
                  templates.map(template => (
                    <tr key={template.id} className="border-b hover:bg-gray-50/50">
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{template.name}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{template.fields?.length || 0}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base hidden sm:table-cell">{new Date(template.created_date).toLocaleDateString('he-IL')}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenSendModal(template)}
                            className="text-xs sm:text-sm"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> 
                            <span className="hidden sm:inline">שלח</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditTemplate(template)}
                            className="text-xs sm:text-sm"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-xs sm:text-sm"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signed Documents Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold">מסמכים חתומים</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[720px]">
              <thead className="border-b bg-gray-50/50">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">שם המסמך</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">נשלח ל-</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">סטטוס</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base hidden md:table-cell">תאריך שליחה</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-600 text-sm sm:text-base">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">טוען מסמכים...</td>
                  </tr>
                ) : signedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">לא נמצאו מסמכים.</td>
                  </tr>
                ) : (
                  signedDocuments.map(doc => {
                    const template = templates.find(t => t.id === doc.template_id);
                    const client = clients.find(c => c.id === doc.lead_id);
                    const canResend = doc.status !== 'signed' && doc.status !== 'voided';
                    
                    return (
                      <tr key={doc.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{template?.name || 'לא ידוע'}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{client?.full_name || 'לא ידוע'}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            doc.status === 'signed' ? 'bg-green-100 text-green-800' :
                            doc.status === 'sent' || doc.status === 'created' ? 'bg-blue-100 text-blue-800' :
                            doc.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                            doc.status === 'voided' ? 'bg-red-100 text-red-800' :
                            doc.status === 'processing_error' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status === 'signed' && 'נחתם'}
                            {doc.status === 'sent' && 'נשלח'}
                            {doc.status === 'created' && 'נוצר'}
                            {doc.status === 'viewed' && 'נצפה'}
                            {doc.status === 'voided' && 'בוטל'}
                            {doc.status === 'processing_error' && 'שגיאת עיבוד'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base hidden md:table-cell">{new Date(doc.created_date).toLocaleString('he-IL')}</td>
                        <td className="p-3 sm:p-4">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {doc.status === 'signed' ? (
                              <>
                                {doc.signed_pdf_url ? (
                                  <a href={doc.signed_pdf_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> 
                                      <span className="hidden sm:inline">הצג</span>
                                    </Button>
                                  </a>
                                ) : (
                                  <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 animate-spin" /> 
                                    <span className="hidden sm:inline">מעבד...</span>
                                  </Button>
                                )}
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" /> 
                                  <span className="hidden sm:inline">מחק</span>
                                </Button>
                              </>
                            ) : canResend ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOpenResendModal(doc)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Send className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> 
                                  <span className="hidden sm:inline">שלח שוב</span>
                                  <span className="sm:hidden">שלח</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleVoidDocument(doc.id)}
                                  className="text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                                >
                                  בטל
                                </Button>
                                { (doc.status === 'processing_error' || doc.status === 'voided') &&
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-xs sm:text-sm"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" /> 
                                    <span className="hidden sm:inline">מחק</span>
                                  </Button>
                                }
                              </>
                            ) : (doc.status === 'voided') ? (
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" /> 
                                  <span className="hidden sm:inline">מחק</span>
                                </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
      
      {showSendModal && (
        <SendModal
          template={selectedTemplate}
          leads={clients.map(client => ({
            id: client.id,
            first_name: client.full_name?.split(' ')[0] || client.full_name || '',
            last_name: client.full_name?.split(' ').slice(1).join(' ') || '',
            email: client.email,
            phone: client.phone,
            full_name: client.full_name
          }))}
          onSend={handleSendRequest}
          onCreateLink={handleCreateLink}
          onCancel={() => setShowSendModal(false)}
        />
      )}

      {/* Resend Modal */}
      {showResendModal && selectedDocumentForResend && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">שליחה חוזרת של מסמך</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">פרטי המסמך:</h4>
                  <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                    <p><strong>תבנית:</strong> {templates.find(t => t.id === selectedDocumentForResend.template_id)?.name}</p>
                    <p><strong>נמען:</strong> {clients.find(c => c.id === selectedDocumentForResend.lead_id)?.full_name}</p>
                    <p className="break-all"><strong>אימייל:</strong> {clients.find(c => c.id === selectedDocumentForResend.lead_id)?.email}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-4">איך תרצה לשלוח שוב את המסמך?</p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button 
                  onClick={() => handleResendDocument('email')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 h-auto"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">שלח מייל תזכורת</div>
                    <div className="text-xs sm:text-sm opacity-90">שליחה אוטומטית למייל הנמען</div>
                  </div>
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => handleResendDocument('copy')}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-3 sm:py-4 h-auto"
                >
                  <Link2 className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">העתק קישור</div>
                    <div className="text-xs sm:text-sm opacity-70">לשיתוף בווטסאפ, SMS או כל מקום אחר</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="flex justify-end p-4 sm:p-6 border-t bg-gray-50">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResendModal(false);
                  setSelectedDocumentForResend(null);
                }}
              >
                ביטול
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}