<script lang="ts">
	import type {PageData} from './$types';
	import { goto } from '$app/navigation';
	export let data: PageData;

	let quiz = data.quiz;
</script>

<div class="container" style="max-width: 800px">
	<h1 class="has-text-weight-bold title">{quiz.title}</h1>
	<button class="button mt-4 mr-3" on:click={() => goto(`/play/quiz/${quiz.id}/round/1/questions`)}>
		Начать игру
	</button>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 60vh;
		gap: 10vh;
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
		text-align: center;

	}

	button {
		position: relative;
		padding: 0.5rem 1rem;
		font-size: 1.1rem;
		background: orangered;
		color: white;
		cursor: pointer;
		width: 30ch;
	}

</style>