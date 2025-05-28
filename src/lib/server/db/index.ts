import {DB_PATH} from "$env/static/private";
import Database from "better-sqlite3";
import type {Question, Quiz, Round, SessionInfo, SessionInfoCache, Template} from "$lib/server/db/types";
import bcrypt from 'bcrypt';

const db = new Database(DB_PATH, {verbose: console.log});
db.pragma('foreign_keys = 1')
// TODO: add Takes table, geography maps table, answer form table

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

function Preset(){
    const sql = `PRAGMA foreign_keys = ON`;
    const statement = db.prepare(sql);
    statement.run();
}

function addPlayersTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS players
    (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
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
            id integer PRIMARY KEY,
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
        specials text
    ) strict; 
    `;
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
            round_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            FOREIGN KEY (round_id) REFERENCES rounds (id) on delete cascade
        ) strict;`
    // @formatter:on
    const statement = db.prepare(sql);
    statement.run();
}

function addAnswerFieldsTable() {
    // @formatter: off
    const sql = `
        CREATE TABLE IF NOT EXISTS answer_fields
        (
            id
            integer
            PRIMARY
            KEY,
            answer
            TEXT
            NOT
            NULL,
            answer_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            answer_id
        ) REFERENCES answers
        (
            id
        )  on delete cascade)`
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
        select q.title as title, q.id as slug, q.is_current as is_current
        from quizzes q
    `;
    const statement = db.prepare(sql);
    const rows = statement.all();
    return rows as Quiz[];
}

export function getRound(quiz_id: string, round_number: number): Round {
    const round = db.prepare('SELECT r.round_template_id as round_template_id, r.id as round_id, r.round_number as round_number FROM rounds r WHERE r.quiz_id = ? AND r.round_number = ?').get(quiz_id, round_number);
    return round as Round;
}

export function getRounds(quiz_id: string): Round[] {
    const round = db.prepare('SELECT r.round_type as type, r.id as round_id FROM rounds r WHERE r.quiz_id = ?').all(quiz_id);
    return round as Round[];
}

export function getRoundTemplates(): Template[] {
    const templates = db.prepare('select id as id from round_templates').all();
    return templates as Template[];
}

export function getRoundTemplate( round_template_id: string): Template {
    const template = db.prepare('SELECT r.title as title, r.number_of_questions as number_of_questions, r.number_of_fields as number_of_fields, r.placeholders as placeholders, r.specials as specials from round_templates r where r.id = ?').get(round_template_id);
    return template as Template;
}

export function getQuestions(round_id: number): Question[] {
    const question = db.prepare(`SELECT id
                                 FROM questions
                                 WHERE round_id = ?`).all(round_id);
    return question as Question[];
}

export function getQuiz(id: string) {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(id);
    return {quiz, questions};
}

export async function createQuiz(title: string, id: string) {
    const sql = `
        insert into quizzes (title, id, is_current)
        values ($title, $id, $is_current)
    `
    const statement = db.prepare(sql);
    statement.run({title, id, is_current: 0});
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

export function getCurrentQuiz(): Quiz[] {
    const quiz = db.prepare('select q.title as title, q.id as slug, q.is_current as is_current from quizzes q WHERE is_current = ?').all(1);
    return quiz as Quiz[];
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
                                          number_of_fields: number, placeholders: string, specials: string | null) {
    const sql = `
        insert into round_templates (id, title, number_of_questions, number_of_fields, placeholders, specials)
        values ($slug, $title, $number_of_questions, $number_of_fields, $placeholders, $specials)
    `
    const statement = db.prepare(sql);
    statement.run({slug, title, number_of_questions, number_of_fields, placeholders, specials});
}

export async function createQuestion(round_id: number) {
    const sql = `insert into questions (round_id)
                 values ($round_id)`
    const statement = db.prepare(sql);
    const result = statement.run({round_id});
    return result.lastInsertRowid;
}

export async function createQuestionField(question_id: number, correct_answer: string) {
    const sql = `insert into question_fields (question_id, correct_answer)
                 values ($question_id, $correct_answer)`;
    const statement = db.prepare(sql);
    statement.run({question_id, correct_answer});
}

export async function createAnswer(round_id: number, username: string) {
    const sql = `insert into answers (round_id, username)
                 values ($round_id, $username)`
    const statement = db.prepare(sql);
    const result = statement.run({round_id, username});
    return result.lastInsertRowid;
}

export async function createAnswerField(answer_id: number | bigint, answer: string) {
    const sql = `insert into answer_fields (answer_id, answer)
                 values ($answer_id, $answer)`;
    const statement = db.prepare(sql);
    statement.run({answer_id, answer});
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
    } else {
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

