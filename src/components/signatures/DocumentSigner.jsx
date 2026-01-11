import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Lock, Loader2, CheckCircle2, X } from 'lucide-react';
import SignaturePad from './SignaturePad';

export default function DocumentSigner({ template, lead, onSubmit, isSigning, userIP }) {
  const [fieldValues, setFieldValues] = useState({});
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const allFields = template.fields;

  useEffect(() => {
    const initialValues = {};
    allFields.forEach(field => {
      if (field.type === 'text') {
        if (field.label.includes('שם') || field.label.includes('Name')) {
          initialValues[field.id] = lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
        } else if (field.label.includes('מייל') || field.label.includes('Email')) {
          initialValues[field.id] = lead.email || '';
        } else if (field.label.includes('טלפון') || field.label.includes('Phone')) {
          initialValues[field.id] = lead.phone || '';
        }
      } else if (field.type === 'date') {
        initialValues[field.id] = new Date().toISOString().split('T')[0];
      } else if (field.type === 'checkbox') {
        initialValues[field.id] = 'false';
      }
    });
    setFieldValues(initialValues);
  }, [template, lead, allFields]);

  const requiredFields = allFields.filter(f => f.required);
  const completedRequiredFields = requiredFields.filter(f => {
    const value = fieldValues[f.id];
    return value && value !== 'false' && value.trim() !== '';
  }).length;
  const progress = requiredFields.length > 0 ? (completedRequiredFields / requiredFields.length) * 100 : 100;

  const isFieldComplete = (field) => {
    const value = fieldValues[field.id];
    return value && value !== 'false' && value.trim() !== '';
  };

  const handleValueChange = (fieldId, value) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFieldClick = (field) => {
    setSelectedFieldId(field.id);
    setCurrentPage(field.page);
    setShowSignaturePad(false);
  };

  const handleSubmit = () => {
    const missingRequired = allFields.filter(f => f.required && !isFieldComplete(f));
    
    if (missingRequired.length > 0) {
      alert(`שדות חובה חסרים:\n${missingRequired.map(f => `- ${f.label}`).join('\n')}`);
      setSelectedFieldId(missingRequired[0].id);
      setCurrentPage(missingRequired[0].page);
      return;
    }
    onSubmit(fieldValues);
  };

  const selectedField = allFields.find(f => f.id === selectedFieldId);

  const renderFieldInput = () => {
    if (!selectedField) return null;

    switch (selectedField.type) {
      case 'text':
        return (
          <Input
            value={fieldValues[selectedField.id] || ''}
            onChange={(e) => handleValueChange(selectedField.id, e.target.value)}
            placeholder={`הזן ${selectedField.label}`}
            className="text-lg"
            autoFocus
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValues[selectedField.id] || ''}
            onChange={(e) => handleValueChange(selectedField.id, e.target.value)}
            className="text-lg"
            autoFocus
          />
        );
      case 'checkbox':
        const isChecked = fieldValues[selectedField.id] === 'true';
        return (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => handleValueChange(selectedField.id, isChecked ? 'false' : 'true')}
              className={`w-20 h-20 rounded-xl border-4 flex items-center justify-center transition-all transform hover:scale-105 ${
                isChecked 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-600 shadow-xl' 
                  : 'bg-white border-gray-300 hover:border-gray-400 shadow-md'
              }`}
            >
              {isChecked && <span className="text-white text-5xl font-bold">✓</span>}
            </button>
            <Label 
              onClick={() => handleValueChange(selectedField.id, isChecked ? 'false' : 'true')}
              className="text-lg cursor-pointer font-semibold"
            >
              {isChecked ? '✅ מסומן' : 'לחץ לסימון'}
            </Label>
          </div>
        );
      case 'signature':
        return (
          <div>
            {!showSignaturePad ? (
              <Button
                onClick={() => setShowSignaturePad(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                פתח לוח חתימה
              </Button>
            ) : (
              <div className="space-y-3">
                <SignaturePad
                  onSignatureChange={(data) => handleValueChange(selectedField.id, data)}
                />
                <Button
                  onClick={() => setShowSignaturePad(false)}
                  variant="outline"
                  className="w-full"
                >
                  סגור לוח חתימה
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div dir="rtl" className="h-screen w-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white shadow-md p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">{template.name}</h1>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <Lock className="w-3 h-3 md:w-4 md:h-4"/>
              <span className="hidden md:inline">תהליך מאובטח</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-gray-600">
                {completedRequiredFields} מתוך {requiredFields.length} שדות חובה מולאו
              </span>
              <span className="text-emerald-600 font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {requiredFields.length === 0 && (
              <p className="text-xs text-gray-500 text-center">אין שדות חובה במסמך</p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Document View */}
        <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-gray-100">
          <div className="max-w-5xl mx-auto">
            {/* Page Navigation */}
            {template.page_image_urls.length > 1 && (
              <div className="flex justify-center gap-2 mb-4">
                {template.page_image_urls.map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            )}

            <div className="relative bg-white shadow-2xl">
              <img 
                src={template.page_image_urls?.[currentPage - 1]} 
                alt={`עמוד ${currentPage}`}
                className="w-full h-auto"
              />
              
              {/* Show all fields as clickable */}
              {allFields
                .filter(f => f.page === currentPage)
                .map(field => {
                  const isComplete = isFieldComplete(field);
                  const isSelected = selectedFieldId === field.id;
                  
                  return (
                    <div
                      key={field.id}
                      className={`absolute cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-4 border-blue-500 bg-blue-100/40 shadow-lg z-10' 
                          : isComplete
                            ? 'border-2 border-green-500 bg-green-100/30 hover:bg-green-100/50'
                            : field.required
                              ? 'border-2 border-red-400 bg-red-50/30 hover:bg-red-50/50'
                              : 'border-2 border-gray-400 bg-gray-50/30 hover:bg-gray-100/50'
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                      }}
                      onClick={() => handleFieldClick(field)}
                    >
                      {field.type === 'checkbox' && isComplete && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-green-600">✓</span>
                        </div>
                      )}
                      {field.type !== 'checkbox' && isComplete && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      {field.required && !isComplete && (
                        <div className="absolute top-1 right-1">
                          <span className="text-red-500 text-sm font-bold">*</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Field Input Sidebar */}
        <div className="w-full md:w-96 flex-shrink-0 bg-white border-t md:border-t-0 md:border-r shadow-xl overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedField ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      {selectedField.label}
                      {selectedField.required && <span className="text-red-500">*</span>}
                    </Label>
                    <p className="text-xs text-gray-500">עמוד {selectedField.page}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFieldId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderFieldInput()}
                </div>

                {isFieldComplete(selectedField) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    שדה זה הושלם
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">לחץ על שדה במסמך כדי למלא אותו</p>
                
                {allFields.filter(f => !isFieldComplete(f)).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">שדות למילוי:</p>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {allFields
                        .filter(f => !isFieldComplete(f))
                        .map(field => (
                          <Button
                            key={field.id}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleFieldClick(field)}
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t space-y-3">
              {requiredFields.length > 0 && completedRequiredFields < requiredFields.length && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-800 font-medium">
                    יש למלא {requiredFields.length - completedRequiredFields} שדות חובה נוספים לפני שליחה
                  </p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span>IP: {userIP || 'N/A'}</span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSigning || (requiredFields.length > 0 && completedRequiredFields < requiredFields.length)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed py-6 text-lg shadow-lg"
              >
                {isSigning ? (
                  <><Loader2 className="w-5 h-5 ml-2 animate-spin"/> שולח...</>
                ) : (
                  '✅ סיים ושלח חתימה'
                )}
              </Button>
              
              {requiredFields.length === 0 && (
                <p className="text-xs text-gray-500 text-center">
                  ניתן לשלוח את המסמך גם בלי למלא את כל השדות
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}