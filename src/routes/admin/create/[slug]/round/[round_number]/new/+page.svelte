<script lang="ts">
    import {writable} from "svelte/store";
    import {shortcut, type ShortcutEventDetail} from '@svelte-put/shortcut';
    import type {MagneticPoint} from "$lib/server/db/types";
    import {persist} from "svelte-use-persist";
    import type {PageData} from "./$types"
     /** @type {import('./$types').ActionData} */

    export let data: PageData;
    export let form;
    const quiz_id = data.quiz_id;

    let number_of_questions = 7;
    let number_of_fields = 1;
    let title: string = '';
    let placeholders: string[] = [];
    placeholders.length = number_of_fields;
    const maxQuestions = 20;
    const minQuestions = 1;
    const maxFields = 4;
    const minFields = 1;

    function handleChangeQuestions() {
        if (number_of_questions === null) {
            return;
        }
        if (number_of_questions > maxQuestions) {
            number_of_questions = maxQuestions;
        }
        if (number_of_questions < minQuestions) {
            number_of_questions = minQuestions;
        }
    }

    function handleChangeFields() {
        if (number_of_fields === null) {
            return;
        }
        if (number_of_fields > maxFields) {
            number_of_fields = maxFields;
        }
        if (number_of_fields < minFields) {
            number_of_fields = minFields;
        }
        placeholders.length = number_of_fields;
    }

    function handleChange() {
        console.log(placeholders);
    }

    let isSpecialsChecked = false;
    let selected = '';
    let mapTitle = '';
    let selectedImage: string | null = null;

    let imageElement: HTMLImageElement;

    const points = writable({value: [] as MagneticPoint[]});


    function handleFileInput(event: Event) {
        const image = (event.target as HTMLInputElement)?.files?.[0];
        if (!image) return;
        selectedImage = URL.createObjectURL(image);
    }

    function handleClick(event: MouseEvent) {
        if (!imageElement) return;
        const rect = imageElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;

        const y = ((event.clientY - rect.top) / rect.height) * 100;
        $points.value.push({x: x, y: y, id: $points.value.length + 1});
        $points = $points;
    }

    function useShortcut(event: CustomEvent<ShortcutEventDetail>) {
        const keyboardEvent = event.detail.originalEvent;
        if ((keyboardEvent.target as HTMLInputElement)?.tagName === 'INPUT') {
            return;
        }
        keyboardEvent.preventDefault();

        console.log('smth');
        if ($points.value.length > 0) {
            $points.value.pop();
            $points = $points;
        }
    }

</script>

<svelte:window use:shortcut={{
    trigger: {
        key: 'z',
        modifier: ['ctrl', 'meta'],
    }

}} onshortcut={useShortcut}/>

<div class="container">
    <form method="POST" enctype="multipart/form-data" use:persist={{key: `new-${quiz_id}`}}>
        <div class="m-4">
            <h1>Название шаблона</h1>
            <input type="text" id="title" name="title" value={title}/>
            {#if form?.errorNoTemplate}
                <p class="has-text-danger">{form.errorNoTemplate}</p>
            {/if}
        </div>
        <div class="m-4">
            <h1>Количество вопросов:</h1>
            <input
                    id="number-of-questions"
                    type="number"
                    class="m-4 is-centered"
                    bind:value={number_of_questions}
                    on:input={() => handleChangeQuestions()}
                    name='number_of_questions'
                    min="{minQuestions}"
                    max="{maxQuestions}"
            >
        </div>
        <div class="m-4">
            <h1>Количество полей</h1>
            <input
                    id="number-of-fields"
                    type="number"
                    class="m-4 is-centered"
                    bind:value={number_of_fields}
                    on:input={() => handleChangeFields()}
                    name='number_of_fields'
                    min="{minFields}"
                    max="{maxFields}"
            >
        </div>

        <div>
            <h1>Что надо ввести в поле?</h1>
            {#each placeholders as _, idx}
                <input class="mr-5" type="text" id="placeholder" name="placeholder" placeholder="Название" bind:value={placeholders[idx]}
                       on:input={() => handleChange()}/>
            {/each}
            {#if form?.errorNoPlaceholder}
                <p class="has-text-danger">{form.errorNoPlaceholder}</p>
            {/if}
        </div>
        <input type="hidden" id="placeholders" name="placeholders" value="{JSON.stringify(placeholders)}"/>
        <input type="hidden" name="selected" id="selected" value="{selected}"/>
        <input type="hidden" name="points" value="{JSON.stringify($points.value)}"/>
        <input type="hidden" name="selectedImage" value="{selectedImage}"/>
        <input type="hidden" name="mapTitle" value="{mapTitle}"/>
        <div class="m-4">
            <input type="checkbox" id="specials" name="specials" bind:checked="{isSpecialsChecked}">
            <label for="specials">Специальные механики</label>
            {#if isSpecialsChecked}

                <fieldset class="m-4 is-centered">
                    <input type="radio" id="geography" name="special" value="geography" bind:group={selected}/>
                    <label for="geography">География</label>
                </fieldset>
                {#if selected === 'geography'}
                    <div class="m-4 is-centered">
                        <div>
                            <input class="m-4" type="text" id="mapTitle" name="mapTitle" bind:value='{mapTitle}' placeholder="Название карты"/>
                            <input
                                    type="file"
                                    accept="image/*"
                                    name="mapImage"
                                    on:change={handleFileInput}

                            />
                            {#if form?.errorMapImage}
                                <p class="has-text-danger">{form.errorMapImage}</p>
                            {/if}
                        </div>


                        {#if selectedImage}
                            <div class="image-container">
                                {#each $points.value as point}
                                    <div class="point" style="left: {point.x}%; top: {point.y}%"
                                    ></div>
                                {/each}
                                <img
                                        bind:this={imageElement}
                                        src={selectedImage}
                                        alt="Selected"
                                        draggable="false"
                                        on:click={handleClick}

                                />

                            </div>
                        {/if}
                    </div>

                {/if}
            {/if}
        </div>



            <button
                    id="submit"
                    type="submit"
                    formaction="?/save">
                Сохранить шаблон
            </button>

    </form>
</div>

<style>

    .container {
        width: 100%;
        margin: auto;
    }
    .image-container {
        position: relative;
        display: inline-block;
    }

    .image-container img {
        max-width: 600px;
        height: auto;
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
        margin: 0.5rem auto;
    }

</style>