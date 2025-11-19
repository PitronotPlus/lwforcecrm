import { useState, useEffect } from "react";
import { CreditBalance } from "@/entities/CreditBalance";
import { CreditTransaction } from "@/entities/CreditTransaction";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Zap,
  Loader2
} from "lucide-react";

import CreditPurchase from "../components/credits/CreditPurchase";
import CreditHistory from "../components/credits/CreditHistory";

export default function Credits() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user || !user.id) {
        console.error("User not found or has no ID, stopping credit data load.");
        setIsLoading(false);
        return;
      }

      // טעינת יתרת קרדיטים או יצירה אם לא קיימת
      let balanceData = await CreditBalance.filter({ user_id: user.id });
      let currentBalance;

      if (balanceData.length > 0) {
        currentBalance = balanceData[0];
      } else {
        // אם אין יתרה, ניצור אחת חדשה עם 0 קרדיטים
        currentBalance = await CreditBalance.create({
          user_id: user.id,
          sms_credits: 0,
          email_credits: 0,
          phone_minutes: 0,
          phone_numbers: [],
          last_updated: new Date().toISOString()
        });
      }

      setBalance(currentBalance);

      // טעינת היסטוריית עסקאות
      const transactionsData = await CreditTransaction.filter(
        { user_id: user.id },
        "-created_date",
        20
      );
      setTransactions(transactionsData);

    } catch (error) {
      console.error("שגיאה בטעינת נתוני קרדיטים:", error);
    }
    setIsLoading(false);
  };

  const pricing = {
    sms: { price: 0.035, currency: "USD", label: "SMS" },
    email: { price: 0.005, currency: "USD", label: "מייל" },
    phone_call: { price: 0.035, currency: "USD", label: "דקת שיחה" },
    phone_number: { price: 25.00, currency: "USD", label: "מספר טלפון/חודש" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <div className="text-center flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#3568AE] animate-spin" />
            <p className="text-lg font-semibold" style={{ fontFamily: 'Heebo', color: '#484848' }}>
              טוען נתוני קרדיטים...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 
              className="text-[32px] font-bold mb-2"
              style={{ 
                color: '#3568AE',
                fontFamily: 'Heebo'
              }}
            >
              מרכז קרדיטים
            </h1>
            <p 
              className="text-[16px]"
              style={{ 
                color: '#858C94',
                fontFamily: 'Heebo'
              }}
            >
              נהל את יתרת הקרדיטים שלך למיילים, SMS ושיחות
            </p>
          </div>
          <Button
            onClick={() => setShowPurchase(true)}
            className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
          >
            <Plus className="w-5 h-5 ml-2" />
            רכישת קרדיטים
          </Button>
        </div>

        {/* Credit Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3568AE] font-medium mb-1" style={{ fontFamily: 'Heebo' }}>SMS</p>
                  <p className="text-2xl font-bold" style={{ color: '#484848', fontFamily: 'Heebo' }}>{balance?.sms_credits || 0}</p>
                  <p className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>קרדיטים זמינים</p>
                </div>
                <MessageSquare className="w-12 h-12 text-[#3568AE]" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#67BF91] font-medium mb-1" style={{ fontFamily: 'Heebo' }}>מיילים</p>
                  <p className="text-2xl font-bold" style={{ color: '#484848', fontFamily: 'Heebo' }}>{balance?.email_credits || 0}</p>
                  <p className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>קרדיטים זמינים</p>
                </div>
                <Mail className="w-12 h-12 text-[#67BF91]" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-medium mb-1" style={{ fontFamily: 'Heebo' }}>שיחות</p>
                  <p className="text-2xl font-bold" style={{ color: '#484848', fontFamily: 'Heebo' }}>{balance?.phone_minutes || 0}</p>
                  <p className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>דקות זמינות</p>
                </div>
                <Phone className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 font-medium mb-1" style={{ fontFamily: 'Heebo' }}>מספרי טלפון</p>
                  <p className="text-2xl font-bold" style={{ color: '#484848', fontFamily: 'Heebo' }}>{balance?.phone_numbers?.length || 0}</p>
                  <p className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>מספרים פעילים</p>
                </div>
                <Zap className="w-12 h-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <Card className="dashboard-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
              <CreditCard className="w-6 h-6 text-[#3568AE]" />
              מחירון שירותים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(pricing).map(([service, info]) => (
                <div key={service} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#484848', fontFamily: 'Heebo' }}>{info.label}</h4>
                  <div className="text-2xl font-bold text-[#3568AE]" style={{ fontFamily: 'Heebo' }}>
                    ${info.price}
                  </div>
                  <p className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>
                    {service === 'phone_number' ? 'לחודש' : 'ליחידה'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <CreditHistory transactions={transactions} />

        {/* Purchase Modal */}
        {showPurchase && (
          <CreditPurchase
            balance={balance}
            onClose={() => setShowPurchase(false)}
            onPurchaseComplete={loadData}
            pricing={pricing}
          />
        )}
      </div>
    </div>
  );
}