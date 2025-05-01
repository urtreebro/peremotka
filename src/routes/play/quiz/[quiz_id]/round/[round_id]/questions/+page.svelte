<script lang="ts">
    import type {PageData} from './$types';

    export let data: PageData;

    let round = data.round;
    let questions = data.questions;
    let answers: string[] = [''];
    let quiz_id = data.slug;

</script>

<div class="container">
    <!--{#if round.type === 'geography'}-->
    <!--    <h1 id="geography-title" class="has-text-weight-bold title">География</h1>-->
    <!--    <form id="geography-form" method="POST">-->
    <!--        {#each questions as question, idx }-->
    <!--            <input type="text"-->
    <!--                   id="question-{idx}"-->
    <!--                   bind:value={questions[idx]}-->
    <!--                   placeholder="Введите правильный ответ на вопрос"-->
    <!--                   required-->
    <!--            />-->
    <!--        {/each}-->
    <!--    </form>-->
    <!--{/if}-->
    {#if round.type === 'artist'}
        <h1 class="has-text-weight-bold title">Исполнитель</h1>
        <form id="artist-track-form" method="POST">
            {#each questions as question, idx }
                <div class="answer-group">
                    <h1 class="has-text-weight-bold ml-2 mb-3 is-size-4">Вопрос {idx + 1}</h1>
                    <input class="" type="text" id="artist-{idx}" name="artist-{idx}" placeholder="Исполнитель" required/>
                </div>
                <div class="answer-group">
                    <h1 class="has-text-weight-bold ml-2 mb-3 is-size-4">Вопрос {idx + 1}</h1>
                    <h1 class="m-2 is-size-5">Исполнитель</h1>
                    <input class="" type="text" id="artist-{idx}" name="artist-{idx}" required/>
                </div>
            {/each}
            <input type="hidden" name="answers" value={JSON.stringify(answers)}/>
            <input type="hidden" name="quiz_id" value={quiz_id}/>
            <input type="hidden" name="round_number" value={round.round_number}/>
            <input type="hidden" name="round_id" value={round.round_id}/>
            <input type="hidden" name="round_type" value={round.type}/>
            <button type="submit" formaction="?/submit">
                Перейти к следующему раунду
            </button>
        </form>
        {/if}
    {#if round.type === 'artist-track'}
        <h1 class="has-text-weight-bold title">Исполнитель - Произведение</h1>
        <form id="artist-track-form" method="POST">
            {#each questions as question, idx }
                <div class="answer-group">
                    <input class="" type="text" id="artist-{idx}" name="artist-{idx}" placeholder="Исполнитель" required/>
                    <input type="text" id="track-{idx}" name="track-{idx}" placeholder="Песня" required/>
                </div>
            {/each}
            <input type="hidden" name="answers" value={JSON.stringify(answers)}/>
            <input type="hidden" name="quiz_id" value={quiz_id}/>
            <input type="hidden" name="round_number" value={round.round_number}/>
            <input type="hidden" name="round_id" value={round.round_id}/>
            <input type="hidden" name="round_type" value={round.type}/>
            <button type="submit" formaction="?/submit">
                Перейти к следующему раунду
            </button>
        </form>

    {/if}

</div>

<style>
    .answer-group {
        margin-bottom: 1rem;
    }

    input[type="text"] {
        width: 30%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        margin: 0.75rem;
    }
</style>