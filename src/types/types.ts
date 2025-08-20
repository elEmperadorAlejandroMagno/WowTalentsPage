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

export interface SavedTalentSpec {
    id: string;
    name: string;
    className: string;
    assignedPoints: {
        [spec: string]: {
            [tier: string]: {
                [talentIndex: number]: number;
            };
        };
    };
    totalPoints: number;
    availablePoints: number;
    createdAt: string;
}
