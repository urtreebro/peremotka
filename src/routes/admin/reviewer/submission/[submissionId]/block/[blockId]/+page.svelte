<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { quizzes } from '$lib/stores';

	$: submissionId = $page.params.submissionId;
	$: blockId = parseInt($page.params.blockId);
	$: submission = $quizzes.submissions.find(s => s.id === submissionId);
	$: quiz = submission ? $quizzes.quizzes.find(t => t.id === submission.quizId) : null;
	$: answers = submission?.blocks[blockId] || [];
	$: marks = submission?.marks?.[blockId] || Array(answers.length).fill(null);

	function markAnswer(index, isCorrect) {
		marks[index] = isCorrect;
	}

	function saveAndNext() {
		quizzes.markAnswers(submissionId, blockId, marks);

		if (blockId < 7) {
			goto(`/admin/reviewer/submission/${submissionId}/block/${blockId + 1}`);
		} else {
			goto('/admin/reviewer');
		}
	}
</script>

<div class="container">
	<h1>Раунд {blockId} из 7</h1>

	<div class="review-blocks">
		{#each answers as answer, i}
			<div class="review-block">
				<div class="question">
					<h3>Вопрос {i + 1}</h3>
					<p class="question-text">{answer.question}</p>
				</div>
				
				<div class="answer">
					<h4>Ответ команды:</h4>
					<p class="answer-text">{answer.answer}</p>
				</div>

				<div class="marking-buttons">
					<button
						class="correct"
						class:selected={marks[i] === true}
						on:click={() => markAnswer(i, true)}
					>
						Пометить верным
					</button>
					<button
						class="incorrect"
						class:selected={marks[i] === false}
						on:click={() => markAnswer(i, false)}
					>
						Пометить неверным
					</button>
				</div>
			</div>
		{/each}
	</div>

	<button class="next" on:click={saveAndNext}>
		{blockId === 7 ? 'Сохранить' : 'Сохранить и перейти к следующему раунду'}
	</button>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.review-block {
		background: white;
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.question, .answer {
		margin-bottom: 1rem;
	}

	.marking-buttons {
		display: flex;
		gap: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	button.correct {
		background-color: #4CAF50;
		color: white;
	}

	button.incorrect {
		background-color: #f44336;
		color: white;
	}

	button.selected {
		opacity: 0.7;
		box-shadow: inset 0 0 5px rgba(0,0,0,0.3);
	}

	button.next {
		background-color: orangered;
		color: white;
		margin-top: 1rem;
	}

	.question-text, .answer-text {
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 0.25rem;
		margin-top: 0.5rem;
	}
</style>