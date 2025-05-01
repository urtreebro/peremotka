import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import Cookies from 'js-cookie';

const COOKIE_EXPIRY = 7; // days
const COOKIE_PATH = '/';

function createQuizzestore() {
	const defaultState = {
		quizzes: [],
		submissions: []
	};

	const loadState = () => {
		try {
			const cookieQuizzes = Cookies.get('quizzes');
			const cookieSubmissions = Cookies.get('submissions');
			
			if (cookieQuizzes && cookieSubmissions) {
				return {
					quizzes: JSON.parse(cookieQuizzes),
					submissions: JSON.parse(cookieSubmissions)
				};
			}

			const localQuizzes = localStorage.getItem('quizzes');
			const localSubmissions = localStorage.getItem('submissions');

			if (localQuizzes && localSubmissions) {
				Cookies.set('quizzes', localQuizzes, { expires: COOKIE_EXPIRY, path: COOKIE_PATH });
				Cookies.set('submissions', localSubmissions, { expires: COOKIE_EXPIRY, path: COOKIE_PATH });

				return {
					quizzes: JSON.parse(localQuizzes),
					submissions: JSON.parse(localSubmissions)
				};
			}

			return defaultState;
		} catch (error) {
			console.error('Error loading state:', error);
			return defaultState;
		}
	};

	const saveState = (quizzes, submissions) => {
		try {
			const quizzesJson = JSON.stringify(quizzes);
			const submissionsJson = JSON.stringify(submissions);
			Cookies.set('quizzes', quizzesJson, { expires: COOKIE_EXPIRY, path: COOKIE_PATH });
			Cookies.set('submissions', submissionsJson, { expires: COOKIE_EXPIRY, path: COOKIE_PATH });
			localStorage.setItem('quizzes', quizzesJson);
			localStorage.setItem('submissions', submissionsJson);
		} catch (error) {
			console.error('Error saving state:', error);
		}
	};

	const { subscribe, set, update } = writable(loadState());

	return {
		subscribe,
		addQuiz: (quiz) => {
			update(state => {
				const newQuizzes = [...state.quizzes, quiz];
				saveState(newQuizzes, state.submissions);
				return { ...state, quizzes: newQuizzes };
			});
		},
		addBlockToQuiz: (quizId, blockId, questions) => {
			update(state => {
				const quiz = state.quizzes.find(t => t.id === quizId) || 
					{ id: quizId, blocks: {}, title: `Quiz ${state.quizzes.length + 1}` };
				
				quiz.blocks[blockId] = questions;
				
				const newQuizzes = state.quizzes.filter(t => t.id !== quizId).concat(quiz);
				saveState(newQuizzes, state.submissions);
				return { ...state, quizzes: newQuizzes };
			});
		},
		submitAnswers: (quizId, blockId, answers, studentName) => {
			update(state => {
				const submission = state.submissions.find(s => s.quizId === quizId && s.studentName === studentName) || 
					{ 
						id: crypto.randomUUID(), 
						quizId, 
						studentName, 
						blocks: {}, 
						marks: {},
						status: 'in-progress' 
					};
				
				submission.blocks[blockId] = answers;
				
				if (blockId === 7) {
					submission.status = 'completed';
				}
				
				const newSubmissions = state.submissions
					.filter(s => !(s.quizId === quizId && s.studentName === studentName))
					.concat(submission);
				
				saveState(state.quizzes, newSubmissions);
				return { ...state, submissions: newSubmissions };
			});
		},
		markAnswers: (submissionId, blockId, marks) => {
			update(state => {
				const submission = state.submissions.find(s => s.id === submissionId);
				if (!submission) return state;

				submission.marks = submission.marks || {};
				submission.marks[blockId] = marks;
				
				const newSubmissions = state.submissions
					.filter(s => s.id !== submissionId)
					.concat(submission);
				
				saveState(state.quizzes, newSubmissions);
				return { ...state, submissions: newSubmissions };
			});
		},
		clearData: () => {
			Cookies.remove('quizzes', { path: COOKIE_PATH });
			Cookies.remove('submissions', { path: COOKIE_PATH });
			localStorage.removeItem('quizzes');
			localStorage.removeItem('submissions');
			set(defaultState);
		}
	};
}

export const quizzes = createQuizzestore();

const createPersistentStore = (/** @type {any} */ key, /** @type {any} */ initialValue) => {
    const getCookie = () => {
        if (!browser) return null;
        const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
        return match ? JSON.parse(decodeURIComponent(match[2])) : null;
    };

    const setCookie = (/** @type {any} */ value) => {
        if (!browser) return;
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
    };

    const stored = getCookie();
    const initial = stored !== null ? stored : initialValue;
    const store = writable(initial);

    store.subscribe(value => {
        if (browser) {
            setCookie(value);
        }
    });

    return store;
};

export const TeamStore = writable({username: '',});

export const AdminStore = writable({username: ''});


export const currentQuiz = createPersistentStore('currentQuiz', null);

export const isAdmin = createPersistentStore('isAdmin', false);

export const submissions = createPersistentStore('submissions', []);

export const currentPlayer = createPersistentStore('currentPlayer', '');