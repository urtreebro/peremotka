<script lang="ts">
    import type {PageData} from './$types';
    import type {Question, Template} from "$lib/server/db/types";

    export let data: PageData;

    let round = data.round;
    let template: Template = data.round_template;
    console.log(template.placeholders);
    let placeholders: string[] = template.placeholders.split(';');
    console.log(placeholders);
    let questions = [] as Question[];
    for (let i = 0; i < template.number_of_questions; i++) {
        questions.push({round_id: round.round_id, questionFields: []})
        for (let j = 0; j < placeholders.length; j++) {
            questions[i].questionFields[j] = "";
        }
    }
</script>

<div class="container">
    <form class="create-form" method="POST">
    <h1 class="title">Раунд {round.round_number}</h1>
    {#each questions as question, idx}
        <div class="questions m-4">
            <h1>Вопрос {idx + 1}</h1>
            {#each placeholders as placeholder, idx2}
                <div>
                    <h1>{placeholder}</h1>
                    <input type="text" id="placeholder" name="placeholder" bind:value={questions[idx].questionFields[idx2]} />
                </div>
            {/each}
        </div>
    {/each}
        <input type="hidden" id="questions" name="questions" value="{JSON.stringify(questions)}"/>
        <button
                type="submit"
                formaction="?/submit">
            Сохранить
        </button>
    </form>
</div>

<style>

</style>