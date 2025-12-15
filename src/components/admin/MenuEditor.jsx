import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Menu } from "lucide-react";

export default function MenuEditor() {
    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Heebo' }}>
                        <Menu className="w-6 h-6 text-[#3568AE]" />
                        עריכת תפריט
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Heebo' }}>
                            תכונה בפיתוח
                        </h3>
                        <p className="text-gray-600 mb-4">
                            עריכת התפריט תהיה זמינה בגרסה הבאה של המערכת.
                        </p>
                        <p className="text-sm text-gray-500">
                            כרגע, מבנה התפריט מוגדר בקוד של המערכת ב-Layout.js
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}