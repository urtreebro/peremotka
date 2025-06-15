<script lang="ts">
    import type {PageData} from "./$types"
    import correct_image from '$lib/correct.png'
    import wrong_image from '$lib/wrong.png'
    import {checkStringSimilarity} from "$lib";

    export let data: PageData;

    const correct_answers = data.correct_answers;
    const player_answers = data.player_answers;
    const blank = data.blank;


    const scores: number[][] = [];
    const suggestions: string[][] = [];
    scores.length = correct_answers.length;
    suggestions.length = correct_answers.length;
    for (let i = 0; i < scores.length; i++) {
        scores[i] = [];
        suggestions[i] = [];
        for (let j = 0; j < correct_answers[i].question_fields.length; j++) {
            scores[i].push(0);
            suggestions[i].push('');
        }
    }

    function check(first: string, second: string): { isSimilar: boolean, suggestion?: string } {
        return checkStringSimilarity(first, second);
    }

    async function checkAnswers() {
        for (let i = 0; i < correct_answers.length; i++) {
            for (let j = 0; j < correct_answers[i].question_fields.length; j++) {
                const result = check(correct_answers[i].question_fields[j].correct_answer, player_answers[i].answer_fields[j].answer);
                if (result.isSimilar) {
                    markAsCorrect(i, j);
                }
                else {
                    markAsIncorrect(i, j);
                }
                if (result.suggestion) {
                    suggestions[i][j] = result.suggestion;
                    showSuggestion(i, j);
                }
            }
        }
    }

    function markAsCorrect(i: number, j: number) {
        const field = document.getElementById(`answer${i}-${j}`)!;
        const correct_button = document.getElementById(`correct${i}-${j}`)! as HTMLButtonElement;
        const wrong_button = document.getElementById(`wrong${i}-${j}`)! as HTMLButtonElement;
        field.style.color = 'limegreen';
        correct_button.disabled = true;
        wrong_button.disabled = false;
        scores[i][j] = player_answers[i].answer_fields[j].max_score;
    }

    function markAsIncorrect(i: number, j: number) {
        const field = document.getElementById(`answer${i}-${j}`)!;
        const correct_button = document.getElementById(`correct${i}-${j}`)! as HTMLButtonElement;
        const wrong_button = document.getElementById(`wrong${i}-${j}`)! as HTMLButtonElement;
        field.style.color = 'red';
        correct_button.disabled = false;
        wrong_button.disabled = true;
        scores[i][j] = 0;

    }

    function showSuggestion(i: number, j: number) {
        const field = document.getElementById(`suggest${i}-${j}`)!;
        field.hidden = false;
    }
</script>

<h1>Бланк команды {blank.player_name}</h1>
<div class="container">
        <div class="row">
            <div class="column1">
                <h1>Ответы команды</h1>
            </div>
            <div class="column1">
                <h1>Правильные ответы</h1>
            </div>
            <div class="column2">
                <button on:click={checkAnswers}>Проверить</button>
            </div>
        </div>
        <hr/>
        {#each player_answers as answer, idx}
            {#each answer.answer_fields as field, idx2}
                <div class="row">
                    <div class="column1">
                        <h1 id="answer{idx}-{idx2}">{field.answer}</h1>
                        <h1 hidden="{true}" id="suggest{idx}-{idx2}">Возможно имели в виду: {suggestions[idx][idx2]}</h1>
                    </div>
                    <div class="column1">
                        <h1>{correct_answers[idx].question_fields[idx2].correct_answer}</h1>
                    </div>
                    <div class="column2">
                        <button class="correct_button" id="correct{idx}-{idx2}"
                                on:click={() => markAsCorrect(idx, idx2)}>
                            <img src="{correct_image}" alt=""/>
                        </button>
                        <button class="wrong_button" id="wrong{idx}-{idx2}" on:click={() => markAsIncorrect(idx, idx2)}>
                            <img src="{wrong_image}" alt=""/>
                        </button>


                    </div>
                </div>
                <hr/>
            {/each}

        {/each}
    <form method="POST">
        <input type="hidden" name="scores" value="{JSON.stringify(scores)}">
        <button type="submit" formaction="?/save">Сохранить</button>
    </form>

</div>


<style>
    .row {
        display: flex;
        width: 50%;
    }

    .column1 {
        flex: 10%;
    }

    .column2 {
        flex: 10%;
    }

    hr {
        color: gray;
    }

    .correct_button {
        width: 50px;
        background: gray;
    }

    .correct_button:disabled {
        background: lightgreen;
    }

    .wrong_button {
        width: 50px;
        background: gray;
    }

    .wrong_button:disabled {
        background: red;
    }
</style>