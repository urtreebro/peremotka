export type SessionInfo = {
    username: string;
    role: string;
};

export type SessionInfoCache = SessionInfo & {
    invalidAt: number;
};

export type Quiz = {
    title: string;
    id: string;
    is_current: boolean;
    rounds: Round[];
    length: number;
    show_results: boolean;
}

export type Round = {
    round_id: number;
    round_type: string;
    round_number: number;
    quiz_id: string;
    round_template_id: string;
}

export type Blank = {
    id: number;
    round_id: number;
    quiz_id: string;
    player_name: string;
    state: string;
    score: number;
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
    id: number;
    question_fields: QuestionField[];
    round_id: number;
    type: string;
}

export type QuestionField = {
    id: number;
    correct_answer: string;
}

export type AnswerField = {
    answer: string;
    max_score: number;
}

export type Answer = {
    id: number;
    answer_fields: AnswerField[];
    blank_id: number;
    type: string;
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

export type Player = {
    name: string;
    score: number;
}

export type Result = {
    scores: number[];
    final_score: number;
}