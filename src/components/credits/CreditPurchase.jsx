import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CreditCard, Loader2 } from "lucide-react";

export default function CreditPurchase({ balance, onClose, onPurchaseComplete, pricing }) {
  const [quantities, setQuantities] = useState({
    sms: 100,
    email: 1000,
    phone_call: 60,
    phone_number: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total, [service, qty]) => {
      return total + (qty * pricing[service].price);
    }, 0);
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // כאן תוסיף את הקריאה לפונקציה purchaseCredits
      alert('רכישת קרדיטים תתחבר בקרוב לשירות התשלומים');
      onClose();
    } catch (error) {
      console.error("שגיאה ברכישת קרדיטים:", error);
      setError("שגיאה בחיבור לשרת התשלומים. אנא נסה שוב.");
    }
    
    setIsProcessing(false);
  };

  const totalAmount = calculateTotal();
  const hasItems = totalAmount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
            <CreditCard className="w-6 h-6 text-[#3568AE]" />
            רכישת קרדיטים
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-[#3568AE] mb-3" style={{ fontFamily: 'Heebo' }}>היתרה הנוכחית</h4>
              <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: 'Heebo' }}>
                <div>SMS: {balance?.sms_credits || 0}</div>
                <div>מיילים: {balance?.email_credits || 0}</div>
                <div>דקות שיחה: {balance?.phone_minutes || 0}</div>
                <div>מספרי טלפון: {balance?.phone_numbers?.length || 0}</div>
              </div>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <h4 className="font-semibold" style={{ color: '#484848', fontFamily: 'Heebo' }}>בחר כמויות לרכישה:</h4>
              
              {Object.entries(pricing).map(([service, info]) => (
                <div key={service} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: '#484848', fontFamily: 'Heebo' }}>{info.label}</div>
                    <div className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>${info.price} ליחידה</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantities(prev => ({
                        ...prev,
                        [service]: Math.max(0, prev[service] - (service === 'phone_number' ? 1 : service === 'sms' ? 10 : service === 'email' ? 100 : 10))
                      }))}
                      disabled={quantities[service] === 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={quantities[service]}
                      onChange={(e) => setQuantities(prev => ({
                        ...prev,
                        [service]: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantities(prev => ({
                        ...prev,
                        [service]: prev[service] + (service === 'phone_number' ? 1 : service === 'sms' ? 10 : service === 'email' ? 100 : 10)
                      }))}
                    >
                      +
                    </Button>
                    <div className="w-20 text-left font-medium" style={{ fontFamily: 'Heebo' }}>
                      ${(quantities[service] * info.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Purchase */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold" style={{ fontFamily: 'Heebo' }}>סה"כ לתשלום:</span>
                <span className="text-2xl font-bold text-[#3568AE]" style={{ fontFamily: 'Heebo' }}>${totalAmount.toFixed(2)}</span>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4" style={{ fontFamily: 'Heebo' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  ביטול
                </Button>
                <Button 
                  onClick={handlePurchase}
                  disabled={!hasItems || isProcessing}
                  className="flex-1 bg-[#67BF91] hover:bg-[#5AA880]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      מעבד תשלום...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 ml-2" />
                      רכוש עכשיו
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}