export type Talent = {
    name: string;
    icon: string;
    maxPoints: number;
};

export type TalentTier = {
    talents: Talent[];
    requiredPoints: number;
};

export type SpecTalents = {
    [tier: string]: TalentTier;
};

export type ClassTalents = {
    [spec: string]: SpecTalents;
};
