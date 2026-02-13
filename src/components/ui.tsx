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
                "w-full rounded-xl border text-left transition-all duration-200 flex flex-col items-center shadow-sm relative overflow-hidden",
                selected
                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                    : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md",
                imageSrc ? "p-0 aspect-video" : "py-4 px-3 md:p-6 justify-center gap-2",
                className
            )}
        >
            {/* Checkmark for selected state */}
            {selected && (
                <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-0.5 z-10">
                    <Check size={12} strokeWidth={3} />
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
                    <div className="w-full h-1/4 flex items-center justify-center bg-white border-t border-gray-100">
                        <span className={cn("text-sm font-bold text-center leading-tight px-2", selected ? "text-green-900" : "text-gray-700")}>
                            {label}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    {icon && <span className={cn("text-3xl transition-colors", selected ? "text-green-600" : "text-gray-400 group-hover:text-green-500")}>{icon}</span>}
                    <span className={cn("text-base font-semibold text-center leading-tight", selected ? "text-green-900" : "text-gray-700")}>{label}</span>
                </>
            )}
        </motion.button>
    );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    prefix?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, prefix, className, ...props }) => {
    return (
        <div className="w-full mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {label}
            </label>
            <div className="relative group">
                {prefix && (
                    <div className="absolute left-0 top-0 bottom-0 px-4 bg-gray-50 border-r border-gray-300 rounded-l-lg flex items-center text-gray-500 font-medium z-10">
                        {prefix}
                    </div>
                )}
                <input
                    className={cn(
                        "w-full py-3 text-lg rounded-lg border bg-white outline-none transition-all duration-200",
                        "border-gray-300 hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10",
                        prefix ? "pl-[4.5rem] pr-4" : "px-4",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1.5 font-medium flex items-center gap-1">• {error}</p>}
        </div>
    );
};
