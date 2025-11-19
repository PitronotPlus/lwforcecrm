import CreateTaskModal from '../tasks/CreateTaskModal';

export default function WelcomeHeader({ onTaskCreated }) {
    return (
        <div className="flex items-center justify-between mb-8">
            {/* Welcome Message */}
            <div className="flex-1 text-center">
                <h1 
                    className="text-[40px] font-medium leading-[59px] mb-4"
                    style={{ 
                        color: '#3568AE',
                        fontFamily: 'Heebo',
                        textAlign: 'right'
                    }}
                >
                    ברוך הבא עו״ד עוז מוכתר!
                </h1>
            </div>
            
            {/* Add Task Button */}
            <div className="relative">
                <CreateTaskModal 
                    onTaskCreated={onTaskCreated} 
                    triggerText="משימה חדשה"
                    triggerStyle="icon"
                />
            </div>
        </div>
    );
}