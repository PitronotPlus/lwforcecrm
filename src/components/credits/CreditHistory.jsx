import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

export default function CreditHistory({ transactions }) {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'usage': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'refund': return <Minus className="w-4 h-4 text-blue-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-700 border-green-200';
      case 'usage': return 'bg-red-100 text-red-700 border-red-200';
      case 'refund': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'purchase': return 'רכישה';
      case 'usage': return 'שימוש';
      case 'refund': return 'החזר';
      default: return type;
    }
  };

  const getServiceLabel = (service) => {
    switch (service) {
      case 'sms': return 'SMS';
      case 'email': return 'מייל';
      case 'phone_call': return 'שיחה';
      case 'phone_number': return 'מספר טלפון';
      case 'mixed': return 'קרדיטים מעורבים';
      default: return service;
    }
  };

  const formatMixedTransaction = (transaction) => {
    if (transaction.service === 'mixed' && transaction.metadata && typeof transaction.metadata === 'object') {
      const parts = [];
      if (transaction.metadata.sms_credits > 0) {
        parts.push(`${transaction.metadata.sms_credits} SMS`);
      }
      if (transaction.metadata.email_credits > 0) {
        parts.push(`${transaction.metadata.email_credits} מיילים`);
      }
      if (transaction.metadata.phone_minutes > 0) {
        parts.push(`${transaction.metadata.phone_minutes} דקות`);
      }
      if (transaction.metadata.phone_numbers > 0) {
        parts.push(`${transaction.metadata.phone_numbers} מספרי טלפון`);
      }
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    if (transaction.service === 'mixed') {
        return 'פירוט לא זמין';
    }
    return `${transaction.amount} ${getServiceLabel(transaction.service)}`;
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
          <History className="w-6 h-6 text-[#3568AE]" />
          היסטוריית עסקאות
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p style={{ color: '#858C94', fontFamily: 'Heebo' }}>אין עסקאות עדיין</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium" style={{ color: '#484848', fontFamily: 'Heebo' }}>
                      {transaction.description || `${getTransactionLabel(transaction.type)} ${getServiceLabel(transaction.service)}`}
                    </div>
                    <div className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>
                      {format(new Date(transaction.created_date), "dd/MM/yyyy בשעה HH:mm")}
                    </div>
                    {transaction.service === 'mixed' && (
                      <div className="text-sm text-[#3568AE] mt-1" style={{ fontFamily: 'Heebo' }}>
                        {formatMixedTransaction(transaction)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold" style={{ fontFamily: 'Heebo' }}>
                      {transaction.service === 'mixed' ? 
                        `$${transaction.cost_usd?.toFixed(2) || '0.00'}` : 
                        `${transaction.type === 'usage' ? '-' : '+'}${transaction.amount} ${getServiceLabel(transaction.service)}`
                      }
                    </div>
                    {transaction.cost_usd && transaction.service !== 'mixed' && (
                      <div className="text-sm" style={{ color: '#858C94', fontFamily: 'Heebo' }}>
                        ${transaction.cost_usd.toFixed(3)}
                      </div>
                    )}
                  </div>
                  <Badge className={`${getTransactionColor(transaction.type)} border`}>
                    {getTransactionLabel(transaction.type)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}