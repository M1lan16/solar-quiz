import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ProgressBar, SelectionCard, InputField } from './ui';
import { FunnelState, INITIAL_STATE } from '../types';

const TOTAL_STEPS = 12;
// Placeholder n8n webhook
const WEBHOOK_URL = 'https://n8n.placeholder.com/webhook/solar-funnel';

export const Funnel = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FunnelState>(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDisqualified, setIsDisqualified] = useState(false);

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Loading screen logic for Step 7
    useEffect(() => {
        if (step === 7) {
            const timer = setTimeout(() => {
                handleNext();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const updateField = (field: keyof FunnelState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(prev => prev + 1);
        } else {
            submitData();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    // Special handler for Owner check
    const handleOwnerSelect = (isOwner: boolean) => {
        updateField('isOwner', isOwner);
        if (!isOwner) {
            setIsDisqualified(true);
        } else {
            handleNext();
        }
    };

    const submitData = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            console.log('Sending data to n8n:', formData, 'Target:', WEBHOOK_URL);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Actual fetch would go here:
            // await fetch(WEBHOOK_URL, { 
            //   method: 'POST', 
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData) 
            // });

            setIsSuccess(true);
        } catch (error) {
            console.error('Submission failed', error);
            alert('Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation helper
    const canProceed = () => {
        switch (step) {
            case 6: // Region Check (Nürnberg/Fürth/Erlangen only)
                return /^\d{5}$/.test(formData.zipCode) &&
                    (['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p)));
            case 8:
                return formData.firstName.length > 2 &&
                    formData.lastName.length > 2 &&
                    /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(formData.firstName) &&
                    /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(formData.lastName) &&
                    /^\d{5}$/.test(formData.zipCode) &&
                    (['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p)));
            case 9: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
            case 10: return formData.phone.startsWith('+49') && formData.phone.length >= 11;
            default: return true;
        }
    };

    if (isDisqualified) return <DisqualifiedScreen />;
    if (isSuccess) return <SuccessScreen />;



    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <div className="w-full max-w-xl mx-auto px-4 pb-12 pt-8">

                <div className="bg-white rounded-none md:rounded-2xl md:shadow-sm md:border md:border-gray-100 overflow-visible relative">

                    {/* Content Area */}
                    <div className="px-4 md:px-8 pb-6 md:pb-10 pt-6 md:pt-8 min-h-[400px] flex flex-col">
                        {/* Horizontal Header: Logo + Progress */}
                        <div className="flex items-center gap-6 mb-8">
                            {/* Logo */}
                            <img src="/logo1.png" alt="Solar Logo" className="h-20 w-auto object-contain flex-shrink-0" />

                            {/* Progress Bar (Fills remaining space) */}
                            <div className="flex-1">
                                <ProgressBar
                                    currentStep={step}
                                    totalSteps={TOTAL_STEPS}
                                    className="h-2 rounded-full"
                                />
                            </div>
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full"
                            >
                                <StepContent
                                    step={step}
                                    formData={formData}
                                    updateField={updateField}
                                    handleNext={handleNext}
                                    handleOwnerSelect={handleOwnerSelect}
                                    canProceed={canProceed}
                                    isSubmitting={isSubmitting}
                                />

                                {/* Bottom Back Button */}
                                {step > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={handleBack}
                                            className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors hover:underline"
                                        >
                                            Zurück
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Trust Badges Footer */}
                <div className="mt-12 flex justify-center gap-6 text-gray-400 grayscale opacity-80">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                        <CheckCircle size={14} className="text-green-600" /> Kostenlos & Unverbindlich
                    </div>
                    <a
                        href="https://solar-sed.de/impressum-datenschutz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-semibold tracking-wide hover:underline hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <CheckCircle size={14} className="text-green-600" /> Datensicher (SSL)
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components (Screens) ---

const DisqualifiedScreen = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Vielen Dank für Ihr Interesse</h2>
            <p className="text-slate-600 mb-6">
                Leider können wir aktuell nur Hauseigentümer beraten, da die Installation einer Solaranlage
                die Zustimmung des Eigentümers erfordert. Wir bitten um Ihr Verständnis.
            </p>
            <a href="/" className="text-primary font-medium hover:underline">Zurück zur Startseite</a>
        </div>
    </div>
);

const SuccessScreen = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-50">
            {/* Hero Image */}
            <div className="w-full h-48 md:h-56 overflow-hidden">
                <img
                    src="/dankepage.jpg"
                    alt="Success Hero"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Success Content */}
            <div className="p-8 md:p-10 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle className="text-green-600 w-10 h-10" strokeWidth={3} />
                </motion.div>

                <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                    Vielen Dank!
                </h2>

                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    Wir haben Ihre Angaben erhalten.
                </p>

                <a
                    href="https://solar-sed.de/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group text-green-700 font-bold text-lg hover:text-green-800 transition-colors border-2 border-green-100 hover:border-green-200 px-8 py-3 rounded-full"
                >
                    Besuchen Sie unsere Website
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
            </div>
        </div>
    </div>
);

// --- Main Step Switcher ---

// Validation Helper
const getValidationError = (field: keyof FunnelState, value: string): string | null => {
    if (!value) return null; // No error if empty (just disabled button)

    switch (field) {
        case 'firstName':
        case 'lastName':
            if (!/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(value)) {
                return "Bitte geben Sie einen gültigen Namen ein (keine Zahlen).";
            }
            break;
        case 'email': {
            const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
            const match = value.match(emailRegex);
            if (!match) return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";

            const domain = match[1].toLowerCase();
            const domainParts = domain.split('.');
            const domainName = domainParts[0];
            const tld = '.' + domainParts[domainParts.length - 1];

            // Layer 1: Safe List (Always Allow)
            const safeList = [
                'gmail.com', 'googlemail.com', 'gmx.de', 'gmx.net', 'web.de',
                't-online.de', 'outlook.com', 'outlook.de', 'hotmail.com',
                'hotmail.de', 'icloud.com', 'yahoo.com', 'yahoo.de', 'freenet.de'
            ];
            if (safeList.includes(domain)) break;

            // Layer 3: Junk Filter (Block specific words & short domains)
            // Rule: If domain name contains junk words or is < 3 chars
            const junkWords = ['test', 'fake', 'beispiel', 'muster', 'asd', 'qwe', 'xyz', 'mail'];
            const isJunk = junkWords.some(word => domainName.includes(word));
            if (isJunk || domainName.length < 3) {
                return "Bitte geben Sie eine gültige E-Mail-Adresse ein. (Keine Test-Adressen).";
            }

            // Layer 2: Business Check (Trusted TLDs)
            const trustedTLDs = ['.de', '.com', '.eu', '.net', '.org', '.at', '.ch', '.info'];
            if (!trustedTLDs.includes(tld)) {
                return "Bitte geben Sie eine gültige E-Mail-Adresse ein. (Keine Test-Adressen).";
            }

            break;
        }
        case 'phone':
            // Check start and length
            if (!value.startsWith('+49')) {
                return "Die Nummer muss mit +49 beginnen (z.B. +49 151...).";
            }
            if (value.length < 11) {
                // Short numbers are not valid yet, but we might wait to show error?
                // Request said "Real-time... as soon as... types something invalid".
                // We'll show the error to be safe and responsive.
                return "Die Nummer muss mit +49 beginnen (z.B. +49 151...).";
            }
            // Basic number check (optional, but requested "If invalid")
            if (!/^[\d\s+]+$/.test(value)) {
                return "Bitte nur Zahlen und Leerzeichen verwenden.";
            }
            break;
    }
    return null;
};

const StepContent = ({ step, formData, updateField, handleNext, handleOwnerSelect, canProceed, isSubmitting }: any) => {
    switch (step) {
        case 1: // Start
            return (
                <div className="text-center py-4">
                    <h1 className="text-3xl md:text-6xl font-extrabold text-gray-900 mb-4 md:mb-8 leading-tight tracking-tight">
                        Machen Sie den <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent font-extrabold">Solar-Check</span> für Ihr Gebäude.
                    </h1>
                    <p className="text-xl text-slate-500 mb-12 font-medium max-w-xl mx-auto">
                        Erhalten Sie in 2 Minuten eine unabhängige Einschätzung Ihres Solarpotenzials. Region Nürnberg.
                    </p>
                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
                    >
                        JETZT STARTEN
                    </button>
                    <p className="mt-6 text-sm text-slate-400">Dauert nur 2 Minuten • Kostenlos</p>
                </div>
            );

        case 2: // Building Type
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Um was für ein Gebäude handelt es sich?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                        <SelectionCard
                            label="Einfamilienhaus"
                            selected={formData.buildingType === 'Einfamilienhaus'}
                            onClick={() => { updateField('buildingType', 'Einfamilienhaus'); handleNext(); }}
                            imageSrc="/Einfamilienhaus.jpg"
                            className="!h-32 md:!h-auto !aspect-auto md:!aspect-video"
                        />
                        <SelectionCard
                            label="Doppelhaushälfte"
                            selected={formData.buildingType === 'Doppelhaushälfte'}
                            onClick={() => { updateField('buildingType', 'Doppelhaushälfte'); handleNext(); }}
                            imageSrc="/Doppelhaus-hälfte.jpg"
                            className="!h-32 md:!h-auto !aspect-auto md:!aspect-video"
                        />
                        <SelectionCard
                            label="Reihenhaus"
                            selected={formData.buildingType === 'Reihenhaus'}
                            onClick={() => { updateField('buildingType', 'Reihenhaus'); handleNext(); }}
                            imageSrc="/Reihenhaus.jpg"
                            className="!h-32 md:!h-auto !aspect-auto md:!aspect-video"
                        />
                        <SelectionCard
                            label="Mehrfamilienhaus"
                            selected={formData.buildingType === 'Mehrfamilienhaus'}
                            onClick={() => { updateField('buildingType', 'Mehrfamilienhaus'); handleNext(); }}
                            imageSrc="/Mehrfamilien-haus.jpg"
                            className="!h-32 md:!h-auto !aspect-auto md:!aspect-video"
                        />
                        <div className="col-span-2">
                            <SelectionCard
                                label="Gewerbe"
                                selected={formData.buildingType === 'Gewerbe'}
                                onClick={() => { updateField('buildingType', 'Gewerbe'); handleNext(); }}
                                imageSrc="/gewerbe.jpg"
                                className="!h-32 md:!h-auto !aspect-auto md:!aspect-video"
                            />
                        </div>
                    </div>
                </div>
            );

        case 3: // Persons
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Wie viele Personen leben in Ihrem Haushalt?
                    </h2>
                    <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4">
                        {['1-2', '3-4', '5+'].map((opt) => (
                            <SelectionCard
                                key={opt}
                                label={opt}
                                selected={formData.householdSize === opt}
                                onClick={() => { updateField('householdSize', opt); handleNext(); }}
                            />
                        ))}
                    </div>
                </div>
            );

        case 4: // Consumption
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Wie hoch ist Ihr jährlicher Stromverbrauch?
                    </h2>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
                        {['< 2500 kWh', '2500-4000 kWh', '4000-6000 kWh', '> 6000 kWh'].map((opt) => (
                            <SelectionCard
                                key={opt}
                                label={opt}
                                selected={formData.yearlyConsumption === opt}
                                onClick={() => { updateField('yearlyConsumption', opt); handleNext(); }}
                            />
                        ))}
                    </div>
                </div>
            );

        case 5: // Owner (Critical)
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Sind Sie Eigentümer des genannten Gebäudes?
                    </h2>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
                        <SelectionCard
                            label="Ja, ich bin Eigentümer"
                            selected={formData.isOwner === true}
                            onClick={() => handleOwnerSelect(true)}
                        />
                        <SelectionCard
                            label="Nein, ich bin Mieter"
                            selected={formData.isOwner === false}
                            onClick={() => handleOwnerSelect(false)}
                        />
                    </div>
                </div>
            );

        case 6: // ZIP
            const isZipLengthValid = /^\d{5}$/.test(formData.zipCode);
            const isRegionValid = ['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p));

            let zipError;
            if (formData.zipCode && !isZipLengthValid) {
                zipError = "Bitte geben Sie eine gültige PLZ ein (5 Ziffern).";
            } else if (formData.zipCode && isZipLengthValid && !isRegionValid) {
                zipError = "Derzeit sind wir nur in den Regionen 90, 91, 92 und 96 tätig.";
            }

            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Wo soll die Anlage installiert werden?
                    </h2>
                    <InputField
                        label="Postleitzahl"
                        value={formData.zipCode}
                        onChange={(e) => updateField('zipCode', e.target.value)}
                        placeholder="90403"
                        type="tel"
                        maxLength={5}
                        autoFocus
                        error={zipError}
                    />
                    <button
                        disabled={!canProceed() || !!zipError}
                        onClick={handleNext}
                        className="w-full mt-6 py-4 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-lg"
                    >
                        Weiter
                    </button>
                </div>
            );

        case 7: // Loading
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                    <h3 className="text-xl font-semibold text-slate-800">Ihre Daten werden analysiert...</h3>
                    <p className="text-slate-500 mt-2">Wir suchen den besten Experten in Ihrer Region.</p>
                </div>
            );

        case 8: // Name & PLZ
            const firstNameError = getValidationError('firstName', formData.firstName);
            const lastNameError = getValidationError('lastName', formData.lastName);

            const isZipLengthValidMerged = /^\d{5}$/.test(formData.zipCode);
            const isRegionValidMerged = ['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p));

            let zipErrorMerged;
            if (formData.zipCode && !isZipLengthValidMerged) {
                zipErrorMerged = "Bitte geben Sie eine gültige PLZ ein (5 Ziffern).";
            } else if (formData.zipCode && isZipLengthValidMerged && !isRegionValidMerged) {
                zipErrorMerged = "Derzeit sind wir nur in den Regionen 90, 91, 92 und 96 tätig.";
            }

            const hasStepError = !!firstNameError || !!lastNameError || !!zipErrorMerged;

            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Wie dürfen wir Sie ansprechen?
                    </h2>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <InputField
                            label="Vorname"
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            placeholder="Max"
                            error={firstNameError || undefined}
                        />
                        <InputField
                            label="Nachname"
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            placeholder="Mustermann"
                            error={lastNameError || undefined}
                        />
                    </div>
                    <InputField
                        label="Postleitzahl"
                        value={formData.zipCode}
                        onChange={(e) => updateField('zipCode', e.target.value)}
                        placeholder="90403"
                        type="tel"
                        maxLength={5}
                        error={zipErrorMerged}
                    />
                    <button
                        disabled={!canProceed() || hasStepError}
                        onClick={handleNext}
                        className="w-full mt-6 py-4 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-lg"
                    >
                        Weiter
                    </button>
                </div>
            );

        case 9: // Email
            const emailError = getValidationError('email', formData.email);

            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Ihre E-Mail Adresse für das Angebot?
                    </h2>
                    <InputField
                        label="E-Mail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="max@beispiel.de"
                        error={emailError || undefined}
                    />
                    <button
                        disabled={!canProceed() || !!emailError}
                        onClick={handleNext}
                        className="w-full mt-6 py-4 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-lg"
                    >
                        Weiter
                    </button>
                </div>
            );

        case 10: // Phone
            const phoneError = getValidationError('phone', formData.phone);

            // Helper to handle input change: strip 0, prepend +49
            const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (val.startsWith('0')) {
                    val = val.substring(1); // Strip leading zero
                }
                updateField('phone', '+49' + val);
            };

            // Display value: remove +49 for the input field
            const displayValue = formData.phone.startsWith('+49') ? formData.phone.substring(3) : formData.phone;

            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Unter welcher Nummer sind Sie für Rückfragen erreichbar?
                    </h2>
                    <InputField
                        label="Mobilfunknummer / Festnetz"
                        type="tel"
                        prefix="+49"
                        value={displayValue}
                        onChange={handlePhoneChange}
                        placeholder="170 12345678"
                        error={phoneError || undefined}
                    />
                    <button
                        disabled={!canProceed() || !!phoneError}
                        onClick={handleNext}
                        className="w-full mt-6 py-4 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-lg"
                    >
                        Weiter
                    </button>
                </div>
            );

        case 11: // Contact Pref
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-8 leading-tight text-center">
                        Wie möchten Sie am liebsten kontaktiert werden?
                    </h2>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        {[
                            { id: 'Anruf', label: 'Anruf', icon: '/icons8-phone-call-100.png' },
                            { id: 'WhatsApp', label: 'WhatsApp', icon: '/icons8-whatsapp-240.png' }
                        ].map((opt) => (
                            <SelectionCard
                                key={opt.id}
                                label={opt.label}
                                selected={formData.contactPreference === opt.id}
                                onClick={() => { updateField('contactPreference', opt.id); handleNext(); }}
                                icon={
                                    <img
                                        src={opt.icon}
                                        alt={opt.label}
                                        className="h-14 w-auto object-contain"
                                    />
                                }
                                className="aspect-auto py-5 flex flex-col justify-center items-center"
                            />
                        ))}
                    </div>
                </div>
            );

        case 12: // Timing & Submit
            return (
                <div>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8 text-center leading-tight">
                        Wann soll das Projekt realisiert werden?
                    </h2>
                    <div className="flex flex-col gap-3 mb-8 max-w-md mx-auto">
                        {['So schnell wie möglich', 'In 1-3 Monaten', 'Ich informiere mich nur'].map((opt) => (
                            <SelectionCard
                                key={opt}
                                label={opt}
                                selected={formData.projectTiming === opt}
                                onClick={() => updateField('projectTiming', opt)}
                                className="!aspect-auto !py-4 !min-h-0"
                            />
                        ))}
                    </div>
                    <button
                        disabled={!formData.projectTiming || isSubmitting}
                        onClick={handleNext}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full text-xl font-bold shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'KOSTENLOS ANFRAGEN'}
                    </button>
                    <p className="text-center text-gray-400 mt-4 text-sm">
                        Unverbindlich & <a href="https://solar-sed.de/impressum-datenschutz/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-600 transition-colors cursor-pointer">Datensicher</a>
                    </p>
                </div>
            );

        default:
            return null;
    }
};
