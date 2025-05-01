<script lang="ts">
    import type {PageData} from './$types';

    export let data: PageData;

    let round = data.round;
    let questions: string[] = [''];
    let quiz_id = data.slug;

    function addQuestion() {
        questions = [...questions, ''];
    }

    function removeQuestion(questionIndex: number) {
        questions = questions.filter((_, i) => i !== questionIndex);
    }
</script>

<div class="container">
    {#if round.type === 'artist'}
        <h1 class="has-text-weight-bold title">Исполнитель</h1>
        <form id="artist-track-form" method="POST">
            {#each questions as question, idx }
                <div class="question-group">
                    <input type="text" id="artist-{idx}" name="artist-{idx}" placeholder="Введите исполнителя" required/>
                    {#if questions.length > 1}
                        <button type="button" class="remove" on:click={() => removeQuestion(idx)}>
                            Удалить
                        </button>
                    {/if}
                </div>
            {/each}
            <input type="hidden" name="questions" value={JSON.stringify(questions)}/>
            <input type="hidden" name="quiz_id" value={quiz_id}/>
            <input type="hidden" name="round_number" value={round.round_number}/>
            <input type="hidden" name="round_id" value={round.round_id}/>
            <input type="hidden" name="round_type" value={round.type}/>
            <button type="button" class="add-question" on:click={() => addQuestion()}>
                Добавить вопрос
            </button>
            <button type="submit" formaction="?/submit">
                Перейти к следующему раунду
            </button>
        </form>

    {/if}
    {#if round.type === 'artist-track'}
        <h1 class="has-text-weight-bold title">Исполнитель - Произведение</h1>
        <form id="artist-track-form" method="POST">
            {#each questions as question, idx }
                <div class="question-group">
                    <input type="text" id="artist-{idx}" name="artist-{idx}" placeholder="Введите исполнителя" required/>
                    <input type="text" id="track-{idx}" name="track-{idx}" placeholder="Введите название произведения" required/>
                    {#if questions.length > 1}
                        <button type="button" class="remove" on:click={() => removeQuestion(idx)}>
                            Удалить
                        </button>
                    {/if}
                </div>
            {/each}
            <input type="hidden" name="questions" value={JSON.stringify(questions)}/>
            <input type="hidden" name="quiz_id" value={quiz_id}/>
            <input type="hidden" name="round_number" value={round.round_number}/>
            <input type="hidden" name="round_id" value={round.round_id}/>
            <input type="hidden" name="round_type" value={round.type}/>
            <button type="button" class="add-question" on:click={() => addQuestion()}>
                Добавить вопрос
            </button>
            <button type="submit" formaction="?/submit">
                Перейти к следующему раунду
            </button>
        </form>

    {/if}

</div>

<style>
    .question-group {
        margin-bottom: 1rem;
    }
</style>