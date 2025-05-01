<script>
	import { goto } from '$app/navigation';
	import { quizzes } from '$lib/stores';

	$: submissions = $quizzes.submissions.filter(s => s.status === 'completed');
</script>

<div class="container">
	
	<div class="submissions">
		<h2>Сданные бланки</h2>
		{#if submissions.length === 0}
			<p>Нет сданных бланков.</p>
		{:else}
			<ul>
				{#each submissions as submission}
					<li>
						<button on:click={() => goto(`/admin/reviewer/submission/${submission.id}/block/1`)}>
							{submission.studentName} – квиз #{submission.quizId}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.submissions {
		margin: 2rem 0;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.25rem;
		background-color: orangered;
		color: white;
		cursor: pointer;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		margin: 1rem 0;
	}
</style>