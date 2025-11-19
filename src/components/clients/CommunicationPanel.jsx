import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, MessageSquare } from 'lucide-react';
import { SendEmail } from "@/integrations/Core";
import { CommunicationLog } from '@/entities/CommunicationLog';

export default function CommunicationPanel({ client, clientSettings, onMessageSent }) {
    const [messageType, setMessageType] = useState('whatsapp');
    const [messageBody, setMessageBody] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const handleTemplateChange = (templateId) => {
        const template = clientSettings?.message_templates?.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(templateId);
            let body = template.body.replace('{{full_name}}', client.full_name);
            setMessageBody(body);
        }
    };
    
    const interpolateMessage = (text) => {
        return text.replace('{{full_name}}', client.full_name)
                   .replace('{{service_type}}', client.service_type || '');
    }

    const handleSend = async () => {
        if (!messageBody.trim()) return;

        const finalMessage = interpolateMessage(messageBody);

        try {
            if (messageType === 'email') {
                await SendEmail({
                    to: client.email,
                    subject: `הודעה ממשרד עו"ד`,
                    body: finalMessage,
                });
            } else if (messageType === 'whatsapp') {
                const whatsappUrl = `https://wa.me/${client.phone}?text=${encodeURIComponent(finalMessage)}`;
                window.open(whatsappUrl, '_blank');
            }

            await CommunicationLog.create({
                client_id: client.id,
                type: messageType,
                content: finalMessage,
                status: 'sent',
            });
            
            setMessageBody('');
            setSelectedTemplate('');
            onMessageSent();
        } catch (error) {
            console.error(`Failed to send ${messageType}:`, error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant={messageType === 'whatsapp' ? 'default' : 'outline'}
                        onClick={() => setMessageType('whatsapp')}
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        וואטסאפ
                    </Button>
                    <Button
                        variant={messageType === 'email' ? 'default' : 'outline'}
                        onClick={() => setMessageType('email')}
                        className="flex items-center gap-2"
                    >
                        <Mail className="w-4 h-4" />
                        אימייל
                    </Button>
                </div>
                
                <div className="w-64">
                     <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="בחר תבנית הודעה" />
                        </SelectTrigger>
                        <SelectContent>
                            {(clientSettings?.message_templates || []).map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Textarea
                placeholder={`כתוב הודעה ל${client.full_name}...`}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-h-32 text-right"
                style={{ fontFamily: 'Heebo' }}
            />

            <div className="flex justify-end">
                <Button
                    onClick={handleSend}
                    className="bg-[#67BF91] hover:bg-[#5AA880] text-white"
                    disabled={!messageBody.trim()}
                >
                    <Send className="ml-2 w-4 h-4" />
                    שלח הודעה
                </Button>
            </div>
        </div>
    );
}