<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { quizzes } from '$lib/stores';

	let questions = [];
	let quizId;
	$: blockId = parseInt($page.params.blockId);

	onMount(() => {
		if (blockId === 1) {
			quizId = crypto.randomUUID();
		} else {
			quizId = $page.url.pathname.split('/')[3];
		}
		resetQuestions();
	});

	function resetQuestions() {
		questions = [{ question: '', answer: '' }];
	}

	function addQuestion() {
		questions = [...questions, { question: '', answer: '' }];
	}

	function saveAndNext() {
		if (questions.some(q => !q.question.trim() || !q.answer.trim())) {
			alert('Заполните все поля');
			return;
		}

		quizzes.addBlockToQuiz(quizId, blockId, questions);

		if (blockId < 7) {
			resetQuestions();
			goto(`/admin/library/quiz/new/block/${blockId + 1}`);
		} else {
			goto('/admin/library');
		}
	}
</script>

<div class="container">
	<h1>Раунд {blockId} из 3</h1>

	{#each questions as question, i}
		<div class="question-block">
			<h3>Вопрос {i + 1}</h3>
			<div class="input-group">
				<label>
					Вопрос:
					<input type="text" bind:value={question.question} required />
				</label>
			</div>
			<div class="input-group">
				<label>
					Правильный ответ:
					<input type="text" bind:value={question.answer} required />
				</label>
			</div>
		</div>
	{/each}

	<div class="buttons">
		<button on:click={addQuestion}>Добавить вопрос</button>
		<button on:click={saveAndNext}>
			{blockId === 3 ? 'Сохранить' : 'Сохранить и перейти к следующему раунду'}
		</button>
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.question-block {
		background: white;
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.input-group {
		margin: 1rem 0;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		background-color: orangered;
		color: white;
		cursor: pointer;
	}
</style>