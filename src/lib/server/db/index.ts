import {DB_PATH} from "$env/static/private";
import Database from "better-sqlite3";
import type {
    Answer,
    AnswerField,
    Blank,
    MagneticPoint,
    MapImage,
    MapTemplate,
    Question,
    QuestionField,
    Quiz,
    Round,
    SessionInfo,
    SessionInfoCache,
    Template
} from "$lib/server/db/types";
import bcrypt from 'bcrypt';

const db = new Database(DB_PATH, {verbose: console.log});
db.pragma('foreign_keys = 1')

Preset();
addAdminsTable();
addQuizzesTable();
addPlayersTable();
addRoundTemplatesTable();
addRoundsTable();
addQuestionsTable();
addQuestionFieldsTable();
addAnswersTable();
addAnswerFieldsTable();
addSessionsTable();
addBlanksTable();
addMapImagesTable();
addMapTemplatesTable();

function Preset() {
    const sql = `PRAGMA foreign_keys = ON`;
    const statement = db.prepare(sql);
    statement.run();
}

function addPlayersTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS players
    (
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
        PRIMARY KEY (name, quiz_id)
        ) strict;
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addAdminsTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS admins
    (
        username TEXT PRIMARY KEY NOT NULL,
        password TEXT NOT NULL
        
    ) strict;
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addQuizzesTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS quizzes
    (
        id TEXT NOT NULL,
        title TEXT NOT NULL,
        is_current INTEGER NOT NULL,
        show_results INTEGER NOT NULL,
        number_of_rounds INTEGER NOT NULL,
        PRIMARY KEY (id)
        ) strict;
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addRoundsTable() {
    // @formatter:off
    const sql = `
        CREATE TABLE IF NOT EXISTS rounds
        (
            id INTEGER PRIMARY KEY,
            round_number integer NOT NULL,
            quiz_id text NOT NULL,
            round_template_id TEXT,
            foreign key (quiz_id) references quizzes (id) ON DELETE CASCADE,
            foreign key (round_template_id) references round_templates (id)
        ) strict;
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addBlanksTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS blanks (
        id INTEGER PRIMARY KEY,
        round_id INTEGER NOT NULL,
        player_name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        state TEXT NOT NULL,
        score INTEGER NOT NULL,
        foreign key (player_name, quiz_id) references players (name, quiz_id),
        foreign key (round_id) references rounds (id)
    ) strict;
    `
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addRoundTemplatesTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS round_templates
    (
        id text PRIMARY KEY not null,
        title text NOT NULL,
        number_of_questions integer NOT NULL,
        number_of_fields integer NOT NULL,
        placeholders text NOT NULL,
        specials text,
        content text
    ) strict; 
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addMapTemplatesTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS map_templates (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        points TEXT NOT NULL
    ) strict;
    `
    // @formatter:off
    const statement = db.prepare(sql);
    statement.run();
}

function addMapImagesTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS map_images (
         img_template_id      text primary key
        , img_name          text not null
        , img_mime_type     text not null
        , img_size          integer not null
        , img_data          blob not null
        , constraint img_template_id_fk foreign key (img_template_id) references map_templates (id)
                                          
    ) strict;`
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addQuestionsTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS questions(
        id integer PRIMARY KEY,
        round_id INTEGER NOT NULL,
        type text,
        FOREIGN KEY (round_id) REFERENCES rounds (id) on delete cascade
    ) strict;
    `;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addQuestionFieldsTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS question_fields (
        id integer PRIMARY KEY,
        question_id integer NOT NULL,
        correct_answer TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions (id) on delete cascade
    ) strict;`
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addAnswersTable() {
    // @formatter:off
    const sql = `
        CREATE TABLE IF NOT EXISTS answers
        (
            id integer PRIMARY KEY,
            blank_id INTEGER NOT NULL,
            type text,
            FOREIGN KEY (blank_id) REFERENCES blanks (id) on delete cascade
        ) strict;`
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addAnswerFieldsTable() {
    // @formatter:off
    const sql = `
        CREATE TABLE IF NOT EXISTS answer_fields
        (
            id integer PRIMARY KEY, 
            answer TEXT NOT NULL,
            answer_id INTEGER NOT NULL,
            max_score INTEGER NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers (id) on delete cascade 
    ) strict; `
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addSessionsTable() {
    // @formatter:off
    const sql = `
	create table if not exists sessions (
		session_id          text primary key,
        session_created     integer not null default (strftime( '%s', 'now' ) * 1000),
	    session_expires     integer not null, 
	    session_data        text not null
	) strict;
	`;
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

export function getQuizzes(): Quiz[] {
    const sql = `
        select q.title as title, q.id as id, q.is_current as is_current
        from quizzes q
    `;
    const statement = db.prepare(sql);
    const rows = statement.all();
    return rows as Quiz[];
}

export function getQuiz(quiz_id: string): Quiz {
    const quiz = db.prepare('SELECT q.id as id, q.title as title, q.number_of_rounds as length from quizzes q where q.id = ?').get(quiz_id);
    return quiz as Quiz;
}

export function getRound(quiz_id: string, round_number: number): Round {
    const round = db.prepare('SELECT r.round_template_id as round_template_id, r.id as round_id, r.round_number as round_number FROM rounds r WHERE r.quiz_id = ? AND r.round_number = ?').get(quiz_id, round_number);
    return round as Round;
}

export function getRoundById(round_id: number): Round {
    const round = db.prepare('SELECT r.round_template_id as round_template_id, r.id as round_id, r.round_number as round_number FROM rounds r WHERE r.id = ?').get(round_id);
    return round as Round;
}

export function getNextRound(quiz_id: string, round_number: number): number {
    type Exists = {
        round: number;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM rounds  WHERE quiz_id = ? AND round_number = ?) as round').get(quiz_id, round_number) as Exists;
    return exists.round as number;
}

export function checkPlayerExistence(quiz_id: string, player_name: string): boolean {
    type Exists = {
        player: boolean;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM players where quiz_id = ? AND name = ?) AS player').get(quiz_id, player_name) as Exists;
    return exists.player as boolean;
}

export function checkQuizIdExistence(quiz_id: string): boolean {
    type Exists = {
        quiz: boolean;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM quizzes WHERE id = ?) as quiz').get(quiz_id) as Exists;
    return exists.quiz as boolean;
}

export function checkQuizTitleExistence(quiz_title: string): boolean {
    type Exists = {
        quiz: boolean;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM quizzes WHERE title = ?) as quiz').get(quiz_title) as Exists;
    return exists.quiz as boolean;
}

export function checkTemplateTitleExistence(title: string): boolean {
    type Exists = {
        template: boolean;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM round_templates WHERE title = ?) as template').get(title) as Exists;
    return exists.template as boolean;
}

export function checkBlankExistence(player_name: string, round_id: number): boolean {
    type Exists = {
        blank: boolean;
    }
    const exists = db.prepare('SELECT EXISTS(SELECT 1 FROM blanks WHERE player_name = ? AND round_id = ?) as blank').get(player_name, round_id) as Exists;
    return exists.blank as boolean;
}

export function getRounds(quiz_id: string): Round[] {
    const round = db.prepare('SELECT r.round_template_id as round_template_id, r.id as round_id, r.round_number as round_number FROM rounds r WHERE r.quiz_id = ?').all(quiz_id);
    console.log(round)
    return round as Round[];
}

export function getBlanks(round_id: number): Blank[] {
    const blanks = db.prepare('SELECT id as id, round_id as round_id, player_name as player_name, quiz_id as quiz_id, state as state, score as score from blanks where round_id = ?').all(round_id);
    return blanks as Blank[];
}

export function getBlank(blank_id: number): Blank {
    const blank = db.prepare('SELECT id as id, round_id as round_id, player_name as player_name, quiz_id as quiz_id, state as state, score as score from blanks where id = ?').get(blank_id);
    return blank as Blank;
}

export function getBlankId(player_name: string, round_id: number): number {
    const blank = db.prepare('SELECT id from blanks where player_name = ? AND round_id = ?').get(player_name, round_id) as Blank;
    return blank.id;
}

export function getBlankState(player_name: string, round_id: number): string {
    const blank = db.prepare('SELECT state from blanks where player_name = ? AND round_id = ?').get(player_name, round_id) as Blank;
    return blank.state;
}

export function getRoundTemplates(): Template[] {
    const templates = db.prepare('select id as id, title as title from round_templates').all();
    return templates as Template[];
}

export function getRoundTemplate(round_template_id: string): Template {
    const template = db.prepare('SELECT r.title as title, r.number_of_questions as number_of_questions, r.number_of_fields as number_of_fields, r.placeholders as placeholders, r.specials as specials, r.content as content from round_templates r where r.id = ?').get(round_template_id);
    return template as Template;
}

export function getMapTemplate(map_id: string): MapTemplate {
    type unparsedMap = {
        title: string;
        points: string;
    }
    const map = db.prepare('select m.title as title, m.points as points from map_templates m where m.id = ?').get(map_id) as unparsedMap;
    return {id: map_id, title: map.title, points: JSON.parse(map.points) as MagneticPoint[]};
}

export function getMapImage(map_id: string): MapImage {
    const sql = `
        select img_name as filename, img_mime_type as mimeType, img_size as size
  , img_data as data
        from map_images
        where img_template_id = ?`
    type Image = {
        filename: string;
        mimeType: string;
        size: number;
        data: Blob;
    }
    const statement = db.prepare(sql);
    const row = statement.get(map_id) as Image;
    return {
        filename: row.filename,
        mimeType: row.mimeType,
        size: row.size,
        data: new Blob([row.data], {type: row.mimeType}),
    };


}

export function getQuestions(round_id: number): Question[] {
    const question = db.prepare(`SELECT id, type
                                 FROM questions
                                 WHERE round_id = ?`).all(round_id);
    type QuestionId = {
        id: number;
        type: string;
    }
    const questions_id = question as QuestionId[];
    const questions: Question[] = [];
    for (const id of questions_id) {
        questions.push({id: id.id, round_id: round_id, question_fields: [], type: id.type});

        const field = db.prepare(`SELECT id, correct_answer
                                  from question_fields
                                  where question_id = ?`).all(id.id);
        questions[questions.length - 1].question_fields = field as QuestionField[];

    }
    return questions as Question[];
}

export function getAnswers(blank_id: number): Answer[] {
    const answer = db.prepare(`SELECT id, type
                               FROM answers
                               WHERE blank_id = ?`).all(blank_id);
    type AnswerId = {
        id: number;
        type: string;
    }
    const answers_id = answer as AnswerId[];
    const answers: Answer[] = [];
    for (const id of answers_id) {
        answers.push({id: id.id, blank_id: blank_id, answer_fields: [], type: id.type});

        const field = db.prepare(`SELECT answer, max_score
                                  from answer_fields
                                  where answer_id = ?`).all(id.id);
        answers[answers.length - 1].answer_fields = field as AnswerField[];

    }
    return answers as Answer[];
}

export function getQuizLength(id: string): number {
    type Length = {
        number_of_rounds: number;
    }
    const len = db.prepare('SELECT number_of_rounds FROM quizzes WHERE id = ?').get(id) as Length;
    return len.number_of_rounds as number;
}

export async function createQuiz(title: string, id: string, number_of_rounds: number) {
    const sql = `
        insert into quizzes (title, id, is_current, number_of_rounds, show_results)
        values ($title, $id, $is_current, $number_of_rounds, $show_results)
    `
    const statement = db.prepare(sql);
    statement.run({title, id, is_current: 0, number_of_rounds, show_results: 0});
}

export async function makeCurrentQuiz(id: string, is_current: number) {
    const sql = `
        update quizzes
        set is_current = $is_current
        where id = $id
    `
    const statement = db.prepare(sql);
    statement.run({is_current, id});
}

export async function showQuizResults(id: string, show_results: number) {
    const sql = `
        update quizzes
        set show_results = $show_results
        where id = $id
    `
    const statement = db.prepare(sql);
    statement.run({show_results, id});
}

export async function updateQuiz(id: string, title: string) {
    const sql = `
        update quizzes
        set title = $title
        where id = $id
    `
    const statement = db.prepare(sql);
    statement.run({title, id});
}

export async function updateQuestionField(id: number, answer: string) {
    const sql = `
        update question_fields
        set correct_answer = $correct_answer
        where id = $id`
    const statement = db.prepare(sql);
    statement.run({id, correct_answer: answer});
}

export async function updateBlankScore(player_name: string, quiz_id: string, round_id: number, score: number) {
    const sql = `
        update blanks
        set score = $score
        where player_name = $player_name
          and quiz_id = $quiz_id
          and round_id = $round_id`
    const statement = db.prepare(sql);
    statement.run({score, player_name, quiz_id, round_id});
}

export function getBlanksScores(round_id: number): Blank[] {
    const blanks = db.prepare(`SELECT player_name, score
                               FROM blanks
                               where round_id = ?`).all(round_id);
    return blanks as Blank[];
}


export function getCurrentQuiz(): Quiz {
    const quiz = db.prepare('select q.title as title, q.id as id, q.is_current as is_current, q.number_of_rounds as length, q.show_results as show_results from quizzes q WHERE is_current = ? LIMIT 1').all(1);
    const quizzes = quiz as Quiz[];
    return quizzes[0] as Quiz;
}

export async function deleteQuiz(quiz_id: string) {
    Preset();
    const sql = `
        DELETE
        FROM quizzes
        WHERE id = $quiz_id
    `
    const statement = db.prepare(sql);
    statement.run({quiz_id});
}

export async function createRound(round_number: number, quiz_id: string, round_template_id: string) {
    const sql = `
        insert into rounds (round_number, quiz_id, round_template_id)
        values ($round_number, $quiz_id, $round_template_id)
    `
    const statement = db.prepare(sql);
    const result = statement.run({round_number, quiz_id, round_template_id});
    return result.lastInsertRowid;
}

export async function createRoundTemplate(slug: string, title: string, number_of_questions: number,
                                          number_of_fields: number, placeholders: string, specials: string | null, content: string | null) {
    const sql = `
        insert into round_templates (id, title, number_of_questions, number_of_fields, placeholders, specials, content)
        values ($slug, $title, $number_of_questions, $number_of_fields, $placeholders, $specials, $content)
    `
    const statement = db.prepare(sql);
    statement.run({slug, title, number_of_questions, number_of_fields, placeholders, specials, content});
}

export async function createMapTemplate(slug: string, title: string, points: string) {
    const sql = `
        insert into map_templates (id, title, points)
        values ($slug, $title, $points)
    `
    const statement = db.prepare(sql);
    statement.run({slug, title, points});
}

export async function createMapImage(slug: string, image: File) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sql = `
        insert into map_images (img_template_id, img_name, img_mime_type, img_size, img_data)
        values ($img_template_id, $filename, $mimetype, $size, $data)`
    const statement = db.prepare(sql);
    statement.run({img_template_id: slug, filename: image.name, mimetype: image.type, size: image.size, data: buffer});
}

export async function createBlank(quiz_id: string, round_id: number, player_name: string, state: string) {
    const sql = `insert into blanks (quiz_id, round_id, player_name, state, score)
                 values ($quiz_id, $round_id, $player_name, $state, $score)`
    const statement = db.prepare(sql);
    const result = statement.run({quiz_id, round_id, player_name, state, score: 0});
    return result.lastInsertRowid;
}

export async function changeBlankState(blank_id: number, new_state: string) {
    const sql = `update blanks
                 set state = $new_state
                 where id = $blank_id`;
    const statement = db.prepare(sql);
    statement.run({new_state, blank_id});
}

export async function createQuestion(round_id: number, type: string) {
    const sql = `insert into questions (round_id, type)
                 values ($round_id, $type)`
    const statement = db.prepare(sql);
    const result = statement.run({round_id, type});
    return result.lastInsertRowid;
}

export async function createQuestionField(question_id: number, correct_answer: string) {
    const sql = `insert into question_fields (question_id, correct_answer)
                 values ($question_id, $correct_answer)`;
    const statement = db.prepare(sql);
    statement.run({question_id, correct_answer});
}

export async function createAnswer(blank_id: number, type: string) {
    const sql = `insert into answers (blank_id, type)
                 values ($blank_id, $type)`
    const statement = db.prepare(sql);
    const result = statement.run({blank_id, type});
    return result.lastInsertRowid;
}

export async function createAnswerField(answer_id: number, answer: string, max_score: number) {
    const sql = `insert into answer_fields (answer_id, answer, max_score)
                 values ($answer_id, $answer, $max_score)`;
    const statement = db.prepare(sql);
    statement.run({answer_id, answer, max_score});
}

export async function createPlayerUser(name: string, quiz_id: string): Promise<void> {
    const sql = `
        insert into players (name, quiz_id)
        values ($name, $quiz_id)
    `;
    const statement = db.prepare(sql);
    statement.run({name, quiz_id});
}

export async function createAdminUser(username: string, password: string): Promise<void> {
    const sql = `
        insert into admins (username, password)
        values ($username, $password)

    `;

    const hashedPassword = await bcrypt.hash(password, 12);

    const statement = db.prepare(sql);
    statement.run({username, password: hashedPassword});
}

export async function checkUserCredentials(username: string, password: string): Promise<boolean> {
    const sql = `
        select password
        from admins
        where username = $username
    `;
    const statement = db.prepare(sql);
    const row = statement.get({username}) as { password: string };
    if (row) {
        return bcrypt.compare(password, row.password);
    }
    else {
        await bcrypt.hash(password, 12);
        return false;
    }
}

export function deleteExpiredDbSessions(now: number) {
    const sql = `
        delete
        from sessions
        where session_expires < $now
    `;

    const statement = db.prepare(sql);
    statement.run({now});
}

export function insertDbSession(sessionId: string, sessionInfo: SessionInfo, expiresAt: number) {
    const sql = `
        insert into sessions (session_id, session_expires, session_data)
        values ($sessionId, $expires, $data)
    `;

    const statement = db.prepare(sql);
    statement.run({sessionId, expires: expiresAt, data: JSON.stringify(sessionInfo)});
}

export function deleteDbSession(sessionId: string) {
    const sql = `
        delete
        from sessions
        where session_id = $sessionId
    `;
    const statement = db.prepare(sql);
    statement.run({sessionId});
}

export function getDbSession(sessionId: string): SessionInfoCache | undefined {
    const sql = `
        select session_data as data, session_expires as expires
        from sessions
        where session_id = $sessionId
    `;

    const statement = db.prepare(sql);
    const row = statement.get({sessionId}) as { data: string; expires: number };
    if (row) {
        const data = JSON.parse(row.data);
        data.expires = row.expires;
        return data as SessionInfoCache;
    }
    return undefined;
}

