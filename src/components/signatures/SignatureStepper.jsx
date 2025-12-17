import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { number: 1, title: 'צפייה מקדימה ואישור המסמך' },
  { number: 2, title: 'הזנת פרטים וחתימה' },
  { number: 3, title: 'הצגת המסמך החתום' }
];

export default function SignatureStepper({ currentStep }) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 py-3 sm:py-6 bg-white">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className={`flex-1 flex flex-col items-center text-center z-10 ${index === 0 ? 'items-start' : index === steps.length - 1 ? 'items-end' : ''}`}>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-green-500 border-green-500 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-6 sm:h-6" /> : <span className="text-sm sm:text-lg font-bold">{step.number}</span>}
                </div>
                <p className={`mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'} hidden sm:block`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-auto h-0.5 bg-gray-200"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="relative h-1.5 sm:h-2 bg-gray-200 rounded-full mt-2 sm:mt-4">
        <div
          className="absolute top-0 right-0 h-1.5 sm:h-2 bg-green-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}