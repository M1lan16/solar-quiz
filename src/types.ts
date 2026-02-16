export type BuildingType = 'Einfamilienhaus' | 'Doppelhaushälfte' | 'Reihenhaus' | 'Mehrfamilienhaus' | 'Gewerbe' | 'other';
export type HouseholdSize = '1-2' | '3-4' | '5+' | 'unsure';
export type UsageTime = 'morgens_abends' | 'tagsueber' | 'gleichmaessig' | 'unsure';
export type ContactPreference = 'Anruf' | 'WhatsApp';
export type ProjectTiming = 'So schnell wie möglich' | 'In 1-3 Monaten' | 'Ich informiere mich nur';

export interface FunnelState {
    buildingType: BuildingType | null;
    householdSize: HouseholdSize | null;
    usageTime: UsageTime | null;
    isOwner: boolean | null;
    zipCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    contactPreference: ContactPreference | null;
}

export const INITIAL_STATE: FunnelState = {
    buildingType: null,
    householdSize: null,
    usageTime: null,
    isOwner: null,
    zipCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    contactPreference: null,
};
