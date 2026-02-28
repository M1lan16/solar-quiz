import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    className?: string; // Allow custom styling
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, className }) => {
    const progress = Math.min((currentStep / totalSteps) * 100, 100);

    return (
        <div className={cn("w-full bg-gray-100 h-1 rounded-none overflow-hidden", className)}>
            <motion.div
                className="h-full bg-green-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
};

interface SelectionCardProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    imageSrc?: string;
    className?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ label, selected, onClick, icon, imageSrc, className }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                "w-full rounded-xl border text-left transition-all duration-300 flex flex-col items-center shadow-sm relative overflow-hidden cursor-pointer",
                "bg-white border-gray-200",
                "hover:-translate-y-1 hover:shadow-lg hover:border-green-500",
                selected
                    ? "border-2 border-green-600 bg-green-50 ring-2 ring-green-600/20"
                    : "",
                imageSrc ? "p-0 aspect-video" : "py-6 px-1 md:px-8 justify-center gap-3",
                className
            )}
        >
            {/* Checkmark for selected state */}
            {selected && (
                <div className="absolute top-3 right-3 bg-green-600 text-white rounded-full p-1 z-10 shadow-sm">
                    <Check size={16} strokeWidth={4} />
                </div>
            )}

            {imageSrc ? (
                <>
                    <div className="w-full h-3/4">
                        <img
                            src={imageSrc}
                            alt={label}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-full h-1/4 flex items-center justify-center bg-white border-t border-gray-200">
                        <span className={cn("text-[11px] min-[375px]:text-xs sm:text-sm md:text-base font-bold text-center leading-tight break-words px-1 w-full", selected ? "text-green-900" : "text-gray-800")}>
                            {label}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    {icon && <span className={cn("text-4xl transition-colors", selected ? "text-green-600" : "text-gray-500 group-hover:text-green-600")}>{icon}</span>}
                    <span className={cn("text-[11px] min-[375px]:text-xs sm:text-sm md:text-base font-bold text-center leading-tight break-words px-1 w-full", selected ? "text-green-900" : "text-gray-800")}>{label}</span>
                </>
            )}
        </motion.button>
    );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    prefix?: string;
    requiredIndicator?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, prefix, requiredIndicator, className, ...props }) => {
    return (
        <div className="w-full mb-6">
            {label && (
                <label className="block text-base font-bold text-gray-800 mb-3 uppercase tracking-wider">
                    {label} {requiredIndicator && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {prefix && (
                    <div className="absolute left-0 top-0 bottom-0 px-5 bg-gray-50 border-r border-gray-400 rounded-l-lg flex items-center text-gray-600 font-bold z-10 text-lg">
                        {prefix}
                    </div>
                )}
                <input
                    className={cn(
                        "w-full py-4 text-xl rounded-lg border-2 bg-white outline-none transition-all duration-200",
                        "border-gray-400 hover:border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-600/10",
                        prefix ? "pl-[5.5rem] pr-4" : "px-5",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-red-600 text-base mt-2 font-bold flex items-center gap-1.5">• {error}</p>}
        </div>
    );
};
