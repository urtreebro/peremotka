<script lang="ts">
    import type {PageData} from './$types';
    import type {Answer, Template} from "$lib/server/db/types";
    import {writable} from "svelte/store";
    import {persist} from "svelte-use-persist";

    export let data: PageData;

    let round = data.round;
    let template: Template = data.template;
    let answers = [] as Answer[];
    let blank_id = data.blank_id;
    let map_template = data.map_template;
    let placeholders: string[] = template.placeholders.split(';');
    for (let i = 0; i < template.number_of_questions; i++) {
        answers.push({id: -1, type:'',blank_id: blank_id, answer_fields: []})
        for (let j = 0; j < placeholders.length; j++) {
            answers[i].answer_fields[j] = {answer: '', max_score: 0};
        }
    }

    let imageElement: HTMLImageElement;

    export const numberAssignments = writable({
            value:
                Array.from({length: template.number_of_questions}, (_, i) => ({
                    number: i + 1,
                    pointId: 0
                }))
        }
    );
    let draggedNumber: number | null = null;

    function handleDragStart(event: DragEvent, number: number) {
        draggedNumber = number;
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', number.toString());
        }
        console.log($numberAssignments.value);
    }

    function handleDrop(event: DragEvent, pointId: number) {
        event.preventDefault();
        if (draggedNumber === null) return;

        $numberAssignments.value = $numberAssignments.value.map(assignment => {
            if (assignment.number === draggedNumber) {
                return {...assignment, pointId};
            }
            return assignment;
        });

        draggedNumber = null;
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function handleDragEnd() {
        draggedNumber = null;
    }

</script>

<div class="container">
    <form class="create-form" method="POST" use:persist={{key: `my-form-play-${round.quiz_id}-${round.round_number}`}}>
        <h1 class="title mt-5">Раунд {round.round_number}</h1>
        {#each answers as answer, idx}
            <div class="questions m-4">
                <h1 class="has-text-weight-bold mb-4 mt-4">Вопрос {idx + 1}</h1>
                {#each placeholders as placeholder, idx2}
                    <div class="field">
                        <h1>{placeholder}</h1>
                        <input type="text" id="placeholder" name="placeholder{idx}-{idx2}"
                               bind:value={answers[idx].answer_fields[idx2].answer}/>
                    </div>
                {/each}
            </div>
        {/each}

        {#if template.specials === 'geography'}
            <div class="numbers_dock">
                {#each $numberAssignments.value as {number, pointId}}
                    {#if !pointId}
                        <div role="img"
                             class="number_square"
                             draggable="true"
                             on:dragstart={(e) => handleDragStart(e, number)}
                             on:dragend={handleDragEnd}
                        >
                            {number}
                        </div>
                    {/if}
                {/each}
            </div>
            <div class="image-container">
                {#each map_template.points as point}
                    <div role="img" class="point" style="left: {point.x}%; top: {point.y}%"
                         on:dragover={handleDragOver}
                         on:drop={(e) => handleDrop(e, point.id)}
                    >
                        {#if $numberAssignments.value.find(n => n.pointId === point.id)}
                            <div role="img"
                                 class="number_square"
                                 draggable="true"
                                 on:dragstart={(e) => handleDragStart(e, $numberAssignments.value.find(n => n.pointId === point.id)?.number) }
                                 on:dragend={handleDragEnd}
                            >
                                {$numberAssignments.value.find(n => n.pointId === point.id)?.number}
                            </div>
                        {/if}
                    </div>
                {/each}
                <img bind:this={imageElement}
                     src="{`/api/template/${map_template.id}`}" alt=""/>

            </div>
        {/if}

        <input type="hidden" id="answers" name="answers" value="{JSON.stringify(answers)}"/>
        <input type="hidden" id="numbers" name="numbers" value="{JSON.stringify($numberAssignments.value)}" />
        <button
                type="submit"
                formaction="?/submit">
            Сохранить
        </button>
    </form>


</div>

<style>
    .image-container {
        position: relative;
        display: inline-block;
    }

    .image-container img {
        max-width: 600px;
        height: auto;
    }

    .numbers_dock {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    .number_square {
        width: 32px;
        height: 32px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: #3999f8;
        color: white;
        margin: 5px;
        cursor: move;
        z-index: 1000;
    }

    .point {
        position: absolute;
        width: 15px;
        height: 15px;
        background: black;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }

    button {
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        border: none;
        border-radius: 0.5rem;
        background-color: orangered;
        color: white;
        cursor: pointer;
        margin: 0.5rem auto 4rem;
    }
    .questions{
        width: 25%;
        margin: 0.5rem auto;
    }

    .field {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        justify-content: space-between;
        margin: 1rem auto;
        vertical-align: center;
    }
</style>
