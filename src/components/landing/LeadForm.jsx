import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lead } from '@/entities/Lead';

export default function LeadForm() {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        specialization: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await Lead.create(formData);
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit lead:", error);
            alert("שגיאה בשליחת הפרטים. אנא נסה שוב.");
        }
    };

    if (submitted) {
        return <div className="text-center p-8 bg-green-50 rounded-lg"><h3 className="text-xl font-bold text-green-800">תודה! הפרטים נשלחו בהצלחה.</h3><p className="text-green-700">נחזור אליך בהקדם.</p></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="full_name" placeholder="שם מלא" value={formData.full_name} onChange={handleChange} required className="text-right"/>
            <Input name="phone" placeholder="טלפון" value={formData.phone} onChange={handleChange} required className="text-right"/>
            <Input name="email" type="email" placeholder="אימייל" value={formData.email} onChange={handleChange} required className="text-right"/>
            <Input name="specialization" placeholder="תחום התמחות" value={formData.specialization} onChange={handleChange} className="text-right"/>
            <Button type="submit" className="w-full bg-[#67BF91] hover:bg-[#5AA880]">השאר פרטים</Button>
        </form>
    );
}