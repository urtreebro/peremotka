import {DB_PATH} from "$env/static/private";
import Database from "better-sqlite3";
import type {Question, Quiz, Round, SessionInfo, SessionInfoCache} from "$lib/server/db/types";
import bcrypt from 'bcrypt';

const db = new Database(DB_PATH, {verbose: console.log});
addQuizzesTable();
addRoundsTable();
addQuestionsTable();
addQuestionFieldsTable();
addAnswersTable();
addAnswerFieldsTable();
addSessionsTable();

function addQuizzesTable() {
    // @formatter:off
    const sql = `
    CREATE TABLE IF NOT EXISTS quizzes
    (
        id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NULL DEFAULT NULL,
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
            round_type text NOT NULL,
            round_number integer NOT NULL,
            quiz_id text NOT NULL,
            foreign key (quiz_id) references quizzes (id)
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
        id integer PRIMARY KEY,
        round_type text NOT NULL,
        round_number integer NOT NULL,
        quiz_id text NOT NULL,
        foreign key (quiz_id) references quizzes (id)
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
        FOREIGN KEY (round_id) REFERENCES rounds (id)
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
        placeholder TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions (id)
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
            FOREIGN KEY (round_id) REFERENCES rounds (id),
            FOREIGN KEY (username) REFERENCES users (username)
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
            id integer PRIMARY KEY,
            answer TEXT NOT NULL,
            answer_id INTEGER NOT NULL,
            FOREIGN KEY (answer_id) REFERENCES answers(id) 
            )`
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
        select q.title as title, q.id as slug
        from quizzes q
    `;
    const statement = db.prepare(sql);
    const rows = statement.all();
    return rows as Quiz[];
}

export function getRound(quiz_id: string, round_number: number): Round {
    const round = db.prepare('SELECT r.round_type as type, r.id as round_id, r.round_number as round_number FROM rounds r WHERE r.quiz_id = ? AND r.round_number = ?').get(quiz_id, round_number);
    return round as Round;
}

export function getRounds(quiz_id: string): Round[] {
    const round = db.prepare('SELECT r.round_type as type, r.id as round_id FROM rounds r WHERE r.quiz_id = ?').all(quiz_id);
    return round as Round[];
}

export function getQuestions(round_id: number): Question[] {
    const question = db.prepare(`SELECT id FROM questions WHERE round_id = ?`).all(round_id);
    return question as Question[];
}

export function getQuiz(id: string) {
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(id);
    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(id);
    return {quiz, questions};
}

export async function createQuiz(title: string, slug: string) {
    const sql = `
        insert into quizzes (title, id)
        values ($title, $slug)
    `
    const statement = db.prepare(sql);
    statement.run({title, slug});
}

export async function deleteQuiz(quiz_id: string) {
    const sql = `
        DELETE
        FROM quizzes
        WHERE id = $quiz_id`
    const statement = db.prepare(sql);
    statement.run({quiz_id});
}

export async function createRound(type: string, round_number: number, quiz_id: string) {
    const sql = `
        insert into rounds (round_type, round_number, quiz_id)
        values ($type, $round_number, $quiz_id)
    `
    const statement = db.prepare(sql);
    statement.run({type, round_number, quiz_id});
}

export async function createQuestion(round_id: number) {
    const sql = `insert into questions (round_id)
                 values ($round_id)`
    const statement = db.prepare(sql);
    const result = statement.run({round_id});
    return result.lastInsertRowid;
}

export async function createQuestionField(question_id: number | bigint, placeholder: string, correct_answer: string) {
    const sql = `insert into question_fields (question_id, placeholder, correct_answer)
                 values ($question_id, $placeholder, $correct_answer)`;
    const statement = db.prepare(sql);
    statement.run({question_id, placeholder, correct_answer});
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

export async function createPlayerUser(username: string, roles: string): Promise<void> {
    const sql = `
        insert into users (username, password, roles)
        values ($username, null, $roles)

    `;
    const statement = db.prepare(sql);
    statement.run({username, roles});
}

export async function createAdminUser(username: string, password: string, roles: string): Promise<void> {
    const sql = `
        insert into users (username, password, roles)
        values ($username, $password, $roles)

    `;

    const hashedPassword = await bcrypt.hash(password, 12);

    const statement = db.prepare(sql);
    statement.run({username, password: hashedPassword, roles});
}

export async function checkUserCredentials(username: string, password: string): Promise<boolean> {
    const sql = `
        select password
        from users
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

export function getUserRoles(username: string): string[] {
    const sql = `
        select roles
        from users
        where username = $username
    `;
    const statement = db.prepare(sql);
    const row = statement.get({username}) as { roles: string };
    if (row) {
        return row.roles.split(',');
    }
    return [];
}
