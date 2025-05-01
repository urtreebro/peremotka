<script lang="ts">
	import type {PageData} from './$types';
	import { goto } from '$app/navigation';
	export let data: PageData;

	let quizzes = data.quizzes;
	console.log(quizzes);
</script>

<div class="container" style="max-width: 800px">
	<h1 class="has-text-weight-bold title">Доступные квизы</h1>
	
	<div class="available-quizzes">
		{#if !quizzes || quizzes.length === 0}
			<p>Нет доступных квизов</p>
		{:else}
				{#each quizzes as quiz}
					<div class="m-5 flex-box">
						<h1 class="m-3">{quiz.title}</h1>
						<div class="m-1 flex-box-2">
							<button on:click={() => goto(`/play/quiz/${quiz.slug}/round/1/questions`)}>
								Начать
							</button>
						</div>
					</div>
				{/each}
		{/if}
	</div>
</div>

<style>
	.container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.available-quizzes {
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
		text-align: right;
	}

	.flex-box {
		display:flex;
		justify-content:space-between;
		outline: 2px solid #ddd;
	}

	.flex-box-2 {
		display:flex;
		justify-content: flex-end;
	}
</style>