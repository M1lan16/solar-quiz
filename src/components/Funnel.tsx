import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, ThumbsUp, ThumbsDown, HelpCircle, Sun, SunMoon, Scale } from 'lucide-react';
import { ProgressBar, SelectionCard, InputField } from './ui';
import { FunnelState, INITIAL_STATE } from '../types';
import { trackEvent } from '../lib/analytics';

const TOTAL_STEPS = 10;
// Placeholder n8n webhook
const WEBHOOK_URL = 'https://sedsolar.app.n8n.cloud/webhook-test/f338b67d-1087-4828-8a1f-fb84a790fd0c';

// --- Sub-components (Screens) ---

// DisqualifiedScreen removed as Renters now flow to Step 99

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

                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent leading-tight">
                    Vielen Dank! <br />Ihre Anfrage ist eingegangen.
                </h2>

                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    Wir haben Ihre Daten erhalten und prüfen diese aktuell. Einer unserer Solar-Experten wird sich in Kürze bei Ihnen melden.
                </p>

                {/* Contact Section */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 flex flex-col gap-4">
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Haben Sie dringende Fragen?</p>

                    <a href="tel:+4991160057787" className="text-2xl font-bold text-green-700 hover:text-green-800 transition-colors">
                        0911 600 577 87
                    </a>

                    <a href="mailto:info@solar-sed.de" className="text-lg font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        info@solar-sed.de
                    </a>
                </div>

                <a
                    href="https://solar-sed.de"
                    className="w-full block bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    Zurück zur Website
                </a>
            </div>
        </div>
    </div>
);

// Validation Helper
const getValidationError = (field: keyof FunnelState, value: string): string | null => {
    if (!value && (field === 'email' || field === 'phone')) {
        return "Dieses Feld ist ein Pflichtfeld.";
    }
    if (!value) return null; // No error if empty for non-mandatory fields (just disabled button)

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
            const digitsOnly = value.replace(/\D/g, ''); // Count only the numbers

            if (!value.startsWith('+49') && !value.startsWith('0')) {
                return "Die Nummer muss mit 0 oder +49 beginnen.";
            }
            if (digitsOnly.length < 7) {
                return "Die Telefonnummer ist zu kurz.";
            }

            // Basic Spam/Fake checks
            if (/^(.)\1+$/.test(digitsOnly)) {
                return "Bitte geben Sie eine gültige Telefonnummer ein.";
            }

            break;
    }
    return null;
};

const StepContent = ({ step, formData, updateField, handleNext, handleDelayedSelection, handleOwnerSelect, canProceed, isSubmitting, submitData, loadingPhase }: any) => {
    switch (step) {


        case 0: // Pre-Page
            return (
                <div className="flex flex-col items-center justify-start md:justify-center text-center min-h-full max-w-xl mx-auto px-2 pt-2 md:pt-0 pb-8">
                    <img src="/logo1.png" alt="SED Solar Logo" className="h-20 md:h-28 w-auto object-contain mb-4 md:mb-8" />

                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3 md:mb-4 leading-tight text-left w-full">
                        In 2 Minuten zur Solareinschätzung für Ihr Zuhause
                    </h1>

                    <div className="w-full text-left mb-6 md:mb-8">
                        <div className="bg-green-50 border border-green-100 rounded-xl py-3 md:py-4 pr-3 md:pr-4 pl-2 md:pl-4 -ml-2 md:-ml-4 w-[calc(100%+1rem)] md:w-[calc(100%+2rem)] shadow-sm">
                            <p className="text-base md:text-lg text-slate-800 leading-relaxed font-semibold">
                                Kurzer Fragen-Check – anschließend erhalten Sie eine <span className="text-green-700 font-extrabold block md:inline mt-1 md:mt-0">individuelle Erstberatung</span> durch SED Solar
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full max-w-md py-4 md:py-5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-[17px] sm:text-lg md:text-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mb-2"
                    >
                        Persönliche Einschätzung starten
                    </button>

                    <p className="text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wider mb-8 md:mb-10">
                        Kostenlos · unverbindlich
                    </p>

                    <div className="flex flex-col gap-3 mb-8 text-left w-full max-w-md mx-auto">
                        <div className="flex items-center gap-4 p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-green-200 hover:shadow-md active:scale-[0.98] cursor-default">
                            <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-lg font-semibold text-slate-700">Regionaler Fachbetrieb aus Nürnberg</span>
                        </div>
                        <div className="flex items-center gap-4 p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-green-200 hover:shadow-md active:scale-[0.98] cursor-default">
                            <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={2.5} />
                            </div>
                            <span className="text-sm md:text-lg font-semibold text-slate-700">Beratung, Planung & Umsetzung aus einer Hand</span>
                        </div>
                    </div>

                    {/* Partner Logos */}
                    <div className="w-full max-w-md mb-8 px-2">
                        <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x">
                            <img src="https://solar-sed.de/wp-content/uploads/2025/06/viessman-e1750618168882.jpg" alt="Viessmann" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                            <img src="https://solar-sed.de/wp-content/uploads/2025/03/solarfabrik.png" alt="Solar Fabrik" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                            <img src="https://solar-sed.de/wp-content/uploads/2025/03/SMA.png" alt="SMA" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                            <img src="https://solar-sed.de/wp-content/uploads/2025/03/senec.png" alt="SENEC" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                            <img src="https://solar-sed.de/wp-content/uploads/2025/03/huawei.png" alt="Huawei" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                            <img src="https://solar-sed.de/wp-content/uploads/2025/03/alpha.png" alt="Alpha ESS" className="h-6 md:h-8 w-auto object-contain transition-all duration-300 snap-center shrink-0" />
                        </div>
                    </div>

                    {/* Google Reviews Badge */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=SED+Solar+GmbH+Nürnberg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2.5 shadow-sm hover:shadow hover:bg-gray-50 transition-all cursor-pointer mb-2"
                        >
                            <img src="/google.jpg" alt="Google" className="w-6 h-6 object-contain" />
                            <span className="font-bold text-slate-700 text-sm md:text-base">4,9</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-xs md:text-sm text-slate-500 font-medium whitespace-nowrap">(97)</span>
                        </a>
                        <p className="text-xs md:text-sm text-slate-400 font-medium">
                            Standort Nürnberg · 4,9 Sterne bei Google
                        </p>
                    </div>
                </div>
            );

        case 1: // Building Type
            return (
                <div>
                    <div className="text-center max-w-4xl mx-auto mb-8">
                        {/* Question for the cards */}
                        <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-5 leading-tight">Welcher Haustyp ist es?</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectionCard
                            label="Einfamilienhaus"
                            selected={formData.buildingType === 'Einfamilienhaus'}
                            onClick={() => handleDelayedSelection('buildingType', 'Einfamilienhaus')}
                            imageSrc="/Einfamilienhaus.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                        <SelectionCard
                            label="Doppelhaushälfte"
                            selected={formData.buildingType === 'Doppelhaushälfte'}
                            onClick={() => handleDelayedSelection('buildingType', 'Doppelhaushälfte')}
                            imageSrc="/Doppelhaushalfte.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                        <SelectionCard
                            label="Reihenhaus"
                            selected={formData.buildingType === 'Reihenhaus'}
                            onClick={() => handleDelayedSelection('buildingType', 'Reihenhaus')}
                            imageSrc="/Reihenhaus.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                        <SelectionCard
                            label="Mehrfamilienhaus"
                            selected={formData.buildingType === 'Mehrfamilienhaus'}
                            onClick={() => handleDelayedSelection('buildingType', 'Mehrfamilienhaus')}
                            imageSrc="/Mehrfamilien-haus.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                        <SelectionCard
                            label="Gewerbe"
                            selected={formData.buildingType === 'Gewerbe'}
                            onClick={() => handleDelayedSelection('buildingType', 'Gewerbe')}
                            imageSrc="/gewerbe.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                        <SelectionCard
                            label="Nicht sicher"
                            selected={formData.buildingType === 'other'}
                            onClick={() => handleDelayedSelection('buildingType', 'other')}
                            imageSrc="/nichtsicher.jpg"
                            className="!h-24 md:!h-auto !aspect-auto md:!aspect-video h-full"
                        />
                    </div>
                </div>
            );

        case 2: // Persons
            return (
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-10 text-center leading-tight">
                        Wie viele Personen leben in Ihrem Haushalt?
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
                        <SelectionCard
                            label="1 bis 2"
                            selected={formData.householdSize === '1-2'}
                            onClick={() => handleDelayedSelection('householdSize', '1-2')}
                            imageSrc="/1-2.jpg"
                            className="!aspect-square h-full"
                        />
                        <SelectionCard
                            label="3 bis 4"
                            selected={formData.householdSize === '3-4'}
                            onClick={() => handleDelayedSelection('householdSize', '3-4')}
                            imageSrc="/3.jpg"
                            className="!aspect-square h-full"
                        />
                        <SelectionCard
                            label="5 oder mehr"
                            selected={formData.householdSize === '5+'}
                            onClick={() => handleDelayedSelection('householdSize', '5+')}
                            imageSrc="/5.jpg"
                            className="!aspect-square h-full"
                        />
                        <SelectionCard
                            label="Weiß ich nicht"
                            selected={formData.householdSize === 'unsure'}
                            onClick={() => handleDelayedSelection('householdSize', 'unsure')}
                            icon={<HelpCircle className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors" />}
                            className="!aspect-square h-full flex flex-col items-center justify-center bg-gray-50 border-dashed"
                        />
                    </div>
                </div>
            );

        case 3: // Usage Time
            return (
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-10 text-center leading-tight">
                        Wann verbrauchen Sie den meisten Strom?
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <SelectionCard
                            label="Morgens & Abends"
                            selected={formData.usageTime === 'morgens_abends'}
                            onClick={() => handleDelayedSelection('usageTime', 'morgens_abends')}
                            icon={<SunMoon className="w-12 h-12 text-gray-700" strokeWidth={1.5} />}
                            className="h-full"
                        />
                        <SelectionCard
                            label="Tagsüber"
                            selected={formData.usageTime === 'tagsueber'}
                            onClick={() => handleDelayedSelection('usageTime', 'tagsueber')}
                            icon={<Sun className="w-12 h-12 text-gray-700" strokeWidth={1.5} />}
                            className="h-full"
                        />
                        <SelectionCard
                            label="Gleichmäßig"
                            selected={formData.usageTime === 'gleichmaessig'}
                            onClick={() => handleDelayedSelection('usageTime', 'gleichmaessig')}
                            icon={<Scale className="w-12 h-12 text-gray-700" strokeWidth={1.5} />}
                            className="h-full"
                        />
                        <SelectionCard
                            label="Weiß ich nicht"
                            selected={formData.usageTime === 'unsure'}
                            onClick={() => handleDelayedSelection('usageTime', 'unsure')}
                            icon={<HelpCircle className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors" strokeWidth={1.5} />}
                            className="bg-gray-50 border-dashed h-full"
                        />
                    </div>
                </div>
            );


        case 4: // Owner
            return (
                <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-10 text-center leading-tight">
                        Sind Sie Eigentümer des genannten Gebäudes?
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <SelectionCard
                            label="Ja, Eigentümer"
                            selected={formData.isOwner === true}
                            // Directly call handleOwnerSelect, which now handles delay and navigation
                            onClick={() => handleOwnerSelect(true)}
                            icon={<ThumbsUp className="w-8 h-8 md:w-10 md:h-10 text-green-600" />}
                            className="h-full"
                        />
                        <SelectionCard
                            label="Nein, Mieter"
                            selected={formData.isOwner === false}
                            onClick={() => handleOwnerSelect(false)}
                            icon={<ThumbsDown className="w-8 h-8 md:w-10 md:h-10 text-red-400" />}
                            className="h-full"
                        />
                    </div>
                </div>
            );

        case 99: // Renter Capture
            return (
                <div className="text-center py-12 md:py-20">
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-10 animate-in fade-in zoom-in duration-700" />
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        Vielen Dank!
                    </h2>
                    <p className="text-lg md:text-2xl text-gray-600 mb-12 max-w-md mx-auto">
                        Auch für Mieter gibt es Lösungen! Wir haben Ihre Informationen erhalten.
                    </p>
                    <p className="text-gray-600 mb-6 text-center">
                        Hinterlassen Sie Ihre Kontaktdaten für eine unverbindliche Beratung zu Balkonkraftwerken.
                    </p>
                    <div className="flex flex-col gap-4">
                        <InputField
                            label="Name"
                            required
                            requiredIndicator={true}
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            placeholder="Ihr Name"
                        />
                        <InputField
                            label="Telefonnummer"
                            type="tel"
                            prefix="+49"
                            required
                            requiredIndicator={true}
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="170 12345678"
                        />
                    </div>
                    <button
                        onClick={submitData}
                        className="w-full mt-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-xl transition-all shadow-lg"
                    >
                        Rückruf anfordern
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Ihre Daten werden streng vertraulich behandelt (DSGVO-konform).
                    </p>
                </div>
            );

        case 5: // ZIP
            const isZipLengthValid = /^\d{5}$/.test(formData.zipCode);
            const isRegionValid = ['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p));

            let zipError;
            if (formData.zipCode && !isZipLengthValid) {
                zipError = "Bitte geben Sie eine gültige PLZ ein (5 Ziffern).";
            } else if (formData.zipCode && isZipLengthValid && !isRegionValid) {
                zipError = "Derzeit sind wir nur in den Regionen 90, 91, 92 und 96 tätig.";
            }

            return (
                <div className="max-w-md mx-auto text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4 text-center leading-tight">
                        Prüfen Sie jetzt, ob wir in Ihrer Region tätig sind
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-10 text-center">
                        Bitte geben Sie Ihre Postleitzahl ein.
                    </p>
                    <InputField
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
                        className="w-full mt-8 py-5 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-2xl transition-all shadow-lg h-16 md:h-20 flex items-center justify-center"
                    >
                        Weiter
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Ihre Daten werden streng vertraulich behandelt (DSGVO-konform).
                    </p>
                </div>
            );

        case 6: // Loading
            return (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center max-w-xl mx-auto">
                    {loadingPhase === 'spinner' ? (
                        <Loader2 className="w-20 h-20 text-primary animate-spin mb-8 text-green-600" />
                    ) : (
                        <CheckCircle className="w-24 h-24 text-green-500 mb-8 animate-in fade-in zoom-in duration-700" />
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                        Wir prüfen Ihre regionale Verfügbarkeit
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                        Einen Moment bitte – wir analysieren Ihre Angaben und berechnen Ihr individuelles Solarpotenzial.
                    </p>
                    <div className="flex flex-col gap-3 text-left max-w-xs mx-auto bg-green-50/50 p-6 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-800 font-medium">Kostenlos & unverbindlich</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-800 font-medium">Planung durch zertifizierte Experten</span>
                        </div>
                    </div>
                </div>
            );

        case 7: // Name (Strictly Name Only)
            const firstNameError = getValidationError('firstName', formData.firstName);
            const lastNameError = getValidationError('lastName', formData.lastName);

            // We still need to ensure ZIP is valid from previous step, but we don't ask it here.
            // The canProceed check for Step 8 should theoretically handle it, but let's just check names here for the UI error.

            return (
                <div>
                    {formData.zipCode && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm text-center animate-fade-in">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="text-green-800 font-bold text-sm md:text-base">
                                    Ja, wir sind in {formData.zipCode} verfügbar!
                                </p>
                            </div>
                            <p className="text-green-700 text-xs md:text-sm font-medium">
                                Heute wurden bereits 14 Dächer in Ihrer Region geprüft.
                            </p>
                        </div>
                    )}
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500 animate-in fade-in zoom-in duration-500" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 text-center leading-tight">
                        Klasse! Nur noch ein kleiner Schritt...
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 text-center">
                        Wie dürfen wir Sie ansprechen?
                    </p>
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
                    {/* PLZ Input Removed - Handled in Step 6 */}
                    <button
                        disabled={!canProceed() || !!firstNameError || !!lastNameError}
                        onClick={handleNext}
                        className="w-full mt-8 py-5 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-2xl transition-all shadow-lg h-16 md:h-20 flex items-center justify-center"
                    >
                        Weiter
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Ihre Daten werden streng vertraulich behandelt (DSGVO-konform).
                    </p>
                </div>
            );

        case 8: // Email Only
            const emailError = getValidationError('email', formData.email);

            return (
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 text-center leading-tight">
                        Wohin dürfen wir Ihr individuelles Angebot senden?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 text-center">
                        Bitte geben Sie Ihre E-Mail-Adresse ein.
                    </p>
                    <InputField
                        label="E-Mail Adresse"
                        type="email"
                        required
                        requiredIndicator={true}
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="max@beispiel.de"
                        error={emailError || undefined}
                    />
                    <p className="text-sm text-gray-500 mt-2 mb-6 flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Ihre E-Mail verwenden wir ausschließlich zur Zusendung Ihres Angebots.</span>
                    </p>
                    <button
                        disabled={!canProceed() || !!emailError}
                        onClick={handleNext}
                        className="w-full mt-8 py-5 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-2xl transition-all shadow-lg h-16 md:h-20 flex items-center justify-center placeholder:text-gray-400"
                    >
                        Weiter
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Ihre Daten werden streng vertraulich behandelt (DSGVO-konform).
                    </p>
                </div>
            );

        case 9: // Contact Preference (New)
            return (
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 text-center leading-tight">
                        Wie sollen wir Sie am besten kontaktieren?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 text-center">
                        Wählen Sie Ihren bevorzugten Kanal.
                    </p>
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <SelectionCard
                            label="Per WhatsApp"
                            selected={formData.contactPreference === 'WhatsApp'}
                            onClick={() => handleDelayedSelection('contactPreference', 'WhatsApp')}
                            icon={
                                <img
                                    src="/icons8-whatsapp-240.png"
                                    alt="WhatsApp"
                                    className="w-16 h-16 object-contain mb-4"
                                />
                            }
                            className="flex flex-col items-center justify-center py-8"
                        />
                        <SelectionCard
                            label="Per Anruf"
                            selected={formData.contactPreference === 'Anruf'}
                            onClick={() => handleDelayedSelection('contactPreference', 'Anruf')}
                            icon={
                                <img
                                    src="/icons8-phone-call-100.png"
                                    alt="Anruf"
                                    className="w-12 h-12 object-contain mb-4"
                                />
                            }
                            className="flex flex-col items-center justify-center py-8"
                        />
                    </div>
                </div>
            );

        case 10: // Phone Only (Final Step)
            const phoneError = getValidationError('phone', formData.phone);

            // Helferfunktion für sichere und optisch schöne Phone-Eingaben
            const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                let val = e.target.value;

                // Allow only digits and plus at the very beginning
                let cleanVal = val.replace(/[^\d+]/g, '');

                // Ensure '+' is only at the beginning
                if (cleanVal.indexOf('+') > 0) {
                    cleanVal = cleanVal.replace(/\+/g, '');
                }

                // Handling explicit raw lengths (15 Max chars)
                if (cleanVal.replace('+', '').length > 15) {
                    cleanVal = cleanVal.slice(0, cleanVal.startsWith('+') ? 16 : 15);
                }

                updateField('phone', cleanVal);
            };

            // Display value: format numbers beautifully (e.g. +49 176 1234567 or 0176 1234567)
            const formatPhoneDisplay = (phone: string) => {
                let cleaned = phone.replace(/[^\d+]/g, ''); // Extract only digits & +

                if (cleaned.startsWith('+49')) {
                    // Format: +49 176 1234567
                    let rest = cleaned.substring(3);
                    if (rest.length > 0) {
                        let areaCode = rest.substring(0, 3);
                        let subscriber = rest.substring(3);
                        return `+49 ${areaCode}${subscriber ? ' ' + subscriber : ''}`.trim();
                    }
                    return '+49';
                } else if (cleaned.startsWith('0')) {
                    // Format: 0176 1234567
                    let areaCode = cleaned.substring(0, 4);
                    let subscriber = cleaned.substring(4);
                    return `${areaCode}${subscriber ? ' ' + subscriber : ''}`.trim();
                }

                return cleaned; // Raw Fallback
            };

            const phoneDisplayValue = formatPhoneDisplay(formData.phone);

            return (
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 text-center leading-tight">
                        Geschafft! Zuletzt Ihre Handynummer:
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 text-center">
                        Wir rufen Sie kurz zur Klärung der Details an.
                    </p>
                    <InputField
                        label="Telefonnummer"
                        type="tel"
                        required
                        requiredIndicator={true}
                        value={phoneDisplayValue}
                        onChange={handlePhoneChange}
                        placeholder="0176 1234567"
                        error={phoneError || undefined}
                    />
                    <button
                        disabled={!canProceed() || !!phoneError || isSubmitting}
                        onClick={handleNext}
                        className="w-full mt-8 py-5 bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white rounded-full font-bold text-2xl transition-all shadow-lg h-16 md:h-20 flex items-center justify-center placeholder:text-gray-400"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin mr-3" /> Angebot wird erstellt...</>
                        ) : (
                            'Kostenlos anfragen'
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Ihre Daten werden streng vertraulich behandelt (DSGVO-konform).
                    </p>
                </div>
            );

        default:
            return null;
    }
};

export const Funnel = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FunnelState>(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<'spinner' | 'success'>('spinner');

    // Determine scroll behavior and track step view
    useEffect(() => {
        window.scrollTo(0, 0);
        trackEvent('StepView', { step });
    }, [step]);

    // Loading screen logic for Step 6
    useEffect(() => {
        if (step === 6) {
            setLoadingPhase('spinner');
            const phaseTimer = setTimeout(() => {
                setLoadingPhase('success');
            }, 2500); // Extended from 1500 to 2500

            const nextStepTimer = setTimeout(() => {
                handleNext();
            }, 4000); // Extended from 3000 to 4000

            return () => {
                clearTimeout(phaseTimer);
                clearTimeout(nextStepTimer);
            };
        }
    }, [step]);

    const sendToWebhook = async (data: FunnelState) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Lead sync failed', error);
        }
    };

    const updateField = (field: keyof FunnelState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(prev => prev + 1);
            // Trigger webhook if email is present (Step 8 onwards or if they went back)
            if (formData.email) {
                sendToWebhook(formData);
            }
        } else {
            submitData();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    // Special handler for Owner check with delay
    const handleOwnerSelect = (val: boolean) => {
        if (val === true) {
            trackEvent('Qualified_Lead_Owner');
        } else {
            trackEvent('Unqualified_Renter');
        }

        setTimeout(() => {
            updateField('isOwner', val);
            if (formData.email) {
                sendToWebhook({ ...formData, isOwner: val });
            }
            if (val === false) {
                // Renter -> Lead Capture
                setStep(99);
            } else {
                // Owner or Unsure -> Next
                if (step < TOTAL_STEPS) {
                    setStep(prev => prev + 1);
                }
            }
        }, 600);
    };

    const handleDelayedSelection = (field: keyof FunnelState, value: any) => {
        // 1. Immediate visual update
        updateField(field, value);

        // Sync immediately if email is already buffered
        if (formData.email) {
            sendToWebhook({ ...formData, [field]: value });
        }

        // 2. Delayed navigation
        setTimeout(() => {
            handleNext();
        }, 600);
    };



    const submitData = async () => {
        setIsSubmitting(true);
        try {
            await sendToWebhook(formData); // Use the helper function
            trackEvent('Lead_Complete');
            setIsSuccess(true);
        } catch (error) {
            console.error('Submission failed', error);
            alert('Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 5: // ZIP
                return /^\d{5}$/.test(formData.zipCode) &&
                    (['90', '91', '92', '96'].some(p => formData.zipCode.startsWith(p)));
            case 7: // Name
                // Name Validation: Letters only
                const nameRegex = /^[a-zA-ZäöüÄÖÜß\s\-]+$/;
                return formData.firstName.length > 2 &&
                    formData.lastName.length > 2 &&
                    nameRegex.test(formData.firstName) &&
                    nameRegex.test(formData.lastName);
            case 8: // Email
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
            case 9: // Contact Preference
                return formData.contactPreference !== null;
            case 10: // Phone
            case 99: // Renter submit (also uses phone)
                const phoneOnlyDigits = formData.phone.replace(/\D/g, ''); // Only numbers without +
                const isRepeatedChars = /^(.)\1+$/.test(phoneOnlyDigits); // E.g. "33333333"

                // Needs to start with +49 or 0, have realistic length (between 7 and 15 digits), and not be spam
                let isValidFormat = (formData.phone.startsWith('+49') || formData.phone.startsWith('0'));

                // If it's pure logic, let's validate against the raw digit length
                let isValidLength = phoneOnlyDigits.length >= 7 && phoneOnlyDigits.length <= 15;

                return isValidFormat && isValidLength && !isRepeatedChars;
            default: return true;
        }
    };

    if (isSuccess) return <SuccessScreen />;

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
            <div className="w-full max-w-xl mx-auto px-4 pb-12 pt-8">

                <div className="bg-white rounded-none md:rounded-2xl md:shadow-sm md:border md:border-gray-100 overflow-visible relative">

                    {/* Content Area */}
                    <div className="px-4 md:px-8 pb-6 md:pb-10 pt-6 md:pt-8 min-h-[400px] flex flex-col">
                        {/* Horizontal Header: Logo + Progress */}
                        {step !== 0 && (
                            <div className="flex items-center gap-6 mb-8">
                                {/* Logo */}
                                <img src="/logo1.png" alt="Solar Logo" className="h-20 w-auto object-contain flex-shrink-0" />

                                {/* Progress Bar (Fills remaining space) */}
                                <div className="flex-1">
                                    {step !== 99 && (
                                        <div className="text-sm font-bold text-slate-600 mb-2 text-right tracking-tight">
                                            {/* Custom percentage mapping to make it uneven/psychologically realistic as requested */}
                                            {step === 1 ? '11 %' :
                                                step === 2 ? '23 %' :
                                                    step === 3 ? '34 %' :
                                                        step === 4 ? '46 %' :
                                                            step === 5 ? '58 %' :
                                                                step === 6 ? '67 %' :
                                                                    step === 7 ? '78 %' :
                                                                        step === 8 ? '89 %' :
                                                                            step === 9 ? '94 %' :
                                                                                step === 10 ? '99 %' :
                                                                                    `${Math.round((step / TOTAL_STEPS) * 100)} %`}
                                        </div>
                                    )}
                                    <ProgressBar
                                        currentStep={step === 99 ? 4 : step}
                                        totalSteps={TOTAL_STEPS}
                                        className="h-2 rounded-full"
                                    />
                                </div>
                            </div>
                        )}
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
                                    handleDelayedSelection={handleDelayedSelection}
                                    handleOwnerSelect={handleOwnerSelect}
                                    canProceed={canProceed}
                                    isSubmitting={isSubmitting}
                                    submitData={submitData}
                                    loadingPhase={loadingPhase}
                                />

                                {/* Bottom Back Button */}
                                {step > 1 && (
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={handleBack}
                                            className="text-lg text-slate-400 hover:text-slate-600 font-bold transition-colors hover:underline py-2"
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
                {/* Trust Badges & Legal Footer */}
                <div className="mt-8 md:mt-12 flex flex-col items-center gap-4 text-gray-400 grayscale opacity-80">
                    {/* Floating Google Review in Footer (only visible when not on Pre-Page to avoid duplication) */}
                    {step !== 0 && (
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=SED+Solar+GmbH+Nürnberg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-gray-600 hover:grayscale-0 transition-all duration-300 mb-2"
                        >
                            <img src="/google.jpg" alt="Google" className="w-4 h-4 object-contain" />
                            <span className="text-[11px] font-bold tracking-wide">4,9 von 5 Sternen</span>
                            <span className="text-[10px] hidden md:inline">(97 Google-Bewertungen)</span>
                        </a>
                    )}

                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                        <CheckCircle size={14} className="text-green-600" /> Kostenlos & Unverbindlich
                        <span className="mx-2">•</span>
                        <CheckCircle size={14} className="text-green-600" /> Datensicher (SSL)
                    </div>
                    <div className="flex gap-6 text-[10px] uppercase tracking-widest font-medium">
                        <a
                            href="https://s-e-d-solar.de/impressum-datenschutz/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-600 transition-colors"
                        >
                            Impressum
                        </a>
                        <a
                            href="https://s-e-d-solar.de/impressum-datenschutz/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-600 transition-colors"
                        >
                            Datenschutz
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
