export type TalentRequired = {
    tier: number;
    index: number;
    points: number;
};

export type TalentDependency = {
    tier: string;
    talentIndex: number;
    minPoints: number;
};

export type Talent = {
    name: string;
    icon: string;
    maxPoints: number;
    talentRequired?: TalentRequired;
    requires?: TalentDependency[];
};

export type TalentWithPoints = Talent & {
    currentPoints: number;
};

export type TalentTier = {
    talents: Talent[];
    requiredPoints: number;
};

export type TalentTierWithPoints = {
    talents: TalentWithPoints[];
    requiredPoints: number;
};

export type SpecTalents = {
    [tier: string]: TalentTier;
};

export type SpecTalentsWithPoints = {
    [tier: string]: TalentTierWithPoints;
};

export type ClassTalents = {
    [spec: string]: SpecTalents;
};

export type ClassTalentsWithPoints = {
    [spec: string]: SpecTalentsWithPoints;
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

export type ResponseData = Pick<SavedTalentSpec, 'id' | 'name' | 'className' | 'assignedPoints' | 'totalPoints' | 'availablePoints' | 'createdAt'>;
