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

export type Blank = {
    round_id: number;
    quiz_id: string;
    player_name: string;
}

export type Template = {
    id: string;
    title: string;
    number_of_questions: number;
    number_of_fields: number;
    placeholders: string;
    specials: string;
    content: string;
}

export type Question = {
    question_fields: string[];
    round_id: number;
}

export type Answer = {
    answer_fields: string[];
    blank_id: number;
}

export type MagneticPoint = {
    x: number,
    y: number,
    id: number,
}

export type MapImage = {
    filename: string;
    mimeType: string;
    size: number;
    data: Blob;
}

export type MapTemplate = {
    id: string;
    title: string;
    points: MagneticPoint[];
}