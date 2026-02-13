export type BuildingType = 'Einfamilienhaus' | 'Doppelhaushälfte' | 'Reihenhaus' | 'Mehrfamilienhaus' | 'Gewerbe';
export type HouseholdSize = '1-2' | '3-4' | '5+';
export type YearlyConsumption = '< 2500 kWh' | '2500-4000 kWh' | '4000-6000 kWh' | '> 6000 kWh';
export type ContactPreference = 'Anruf' | 'WhatsApp';
export type ProjectTiming = 'So schnell wie möglich' | 'In 1-3 Monaten' | 'Ich informiere mich nur';

export interface FunnelState {
    buildingType: BuildingType | null;
    householdSize: HouseholdSize | null;
    yearlyConsumption: YearlyConsumption | null;
    isOwner: boolean | null;
    zipCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    contactPreference: ContactPreference | null;
    projectTiming: ProjectTiming | null;
}

export const INITIAL_STATE: FunnelState = {
    buildingType: null,
    householdSize: null,
    yearlyConsumption: null,
    isOwner: null,
    zipCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactPreference: null,
    projectTiming: null,
};
