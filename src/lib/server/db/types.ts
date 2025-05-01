export type SessionInfo = {
    username: string;
    roles: string[];
};

export type SessionInfoCache = SessionInfo & {
    invalidAt: number;
};

export type Quiz = {
    title: string;
    slug: string;
    rounds: Round[];
}

export type Round = {
    round_id: number;
    type: string;
    questions: Question[];
    round_number: number;
    quiz_id: string;
}

export type Question = {
    type: string;
    questionFields: string[];
    round_id: string;
}