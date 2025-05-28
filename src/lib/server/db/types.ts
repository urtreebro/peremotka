export type SessionInfo = {
    username: string;
    role: string;
};

export type SessionInfoCache = SessionInfo & {
    invalidAt: number;
};

export type Quiz = {
    title: string;
    slug: string;
    is_current: boolean;
    rounds: Round[];
}

export type Round = {
    round_id: number;
    round_type: string;
    round_number: number;
    quiz_id: string;
    round_template_id: string;
}

export type Template = {
    id: string;
    title: string;
    number_of_questions: number;
    number_of_fields: number;
    placeholders: string;
    specials: string;
}

export type Question = {
    questionFields: string[];
    round_id: number;
}