import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                setShowPrompt(false);
            }
        }
    }, []);

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 z-50 border-2 border-[#3568AE]">
            <button
                onClick={handleDismiss}
                className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
            >
                <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-[#3568AE] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Heebo' }}>
                        התקן את LawForce
                    </h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Heebo' }}>
                        גישה מהירה, חוויה טובה יותר וזמינות גם ללא אינטרנט
                    </p>
                </div>
            </div>

            <Button 
                onClick={handleInstall}
                className="w-full bg-[#3568AE] hover:bg-[#2a5592]"
            >
                <Download className="w-4 h-4 ml-2" />
                התקן כעת
            </Button>
        </div>
    );
}