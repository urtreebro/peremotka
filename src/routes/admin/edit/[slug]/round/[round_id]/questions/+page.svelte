<script lang="ts">
    import type {PageData} from './$types';
    import type {Template} from "$lib/server/db/types";
    import {persist} from "svelte-use-persist";
    import {writable} from "svelte/store";

    export let data: PageData;

    let round = data.round;
    let template: Template = data.round_template;
    let placeholders: string[] = template.placeholders.split(';');
    let questions = data.questions;
    let map_template = data.map_template;

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
    <form class="create-form" method="POST" use:persist={{
        key: `my-form-edit-${round.quiz_id}-${round.round_number}`
    }}>
        <h1 class="title mt-5">Раунд {round.round_number}</h1>
        {#each questions as question, idx}
            {#if question.type === ''}
                <div class="questions m-4">
                    <h1 class="has-text-weight-bold mb-5 mt-5">Вопрос {idx + 1}</h1>
                    {#each placeholders as placeholder, idx2}
                        <div class="field">
                            <h1>{placeholder}</h1>
                            <input type="text" id="placeholder" name="placeholder{idx}-{idx2}"
                                   bind:value={questions[idx].question_fields[idx2].correct_answer}/>
                        </div>
                    {/each}
                </div>
            {/if}
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

        <input type="hidden" id="questions" name="questions" value="{JSON.stringify(questions)}"/>
        <input type="hidden" id="numbers" name="numbers" value="{JSON.stringify($numberAssignments.value)}"/>
        <div>
            <button
                    type="submit"
                    formaction="?/submit">
                Сохранить
            </button>
        </div>
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
        margin: 1.5rem 3rem 4rem;
    }

    .questions {
        width: 24%;
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