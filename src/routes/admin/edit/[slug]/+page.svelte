<script lang="ts">
    import type {PageData} from "./$types";
    import type {Template} from "$lib/server/db/types";
    /** @type {import('./$types').ActionData} */
    import {persist} from 'svelte-use-persist';
    import {goto} from "$app/navigation";

    export let data: PageData;
    let quiz = data.quiz;
    let templates: Template[] = data.templates;
    export let form;
</script>

<div class="container mt-4 has-text-centered">
    <h1 class="has-text-weight-bold title has-text-centered m-4">Редактировать квиз</h1>
    <form class="create-form" method="POST" action="?/save" use:persist={{
        key: `my-form-${quiz.id}`
    }}>
        <input
                id="title"
                type="text"
                class="m-4 is-centered"
                value={quiz.title}
                name='title'
                placeholder="Введите название квиза"
        />
        {#if form?.errorMessage}
            <p class="has-text-danger">{form.errorMessage}</p>
        {/if}

        {#each quiz.rounds as _, index}
            <div class="flex-box">
                <div class="flex-box-2">
                    <h2 class="m-2 has-text-weight-bold">Раунд {index + 1}</h2>
                    <h2 class="m-2">Шаблон: {templates[index].title}</h2>
                </div>

                <button
                        type="button" on:click="{() => goto(`/admin/edit/${quiz.id}/round/${index + 1}/questions`)}">
                    Изменить
                </button>
            </div>
        {/each}
        <div class="save">
            <button
                    class="bulma-has-text-centered"
                    type="submit"
                    formaction="?/save">
                Сохранить
            </button>
        </div>

    </form>
</div>


<style>
    .container {
        max-width: 800px;
        align-items: center;
        margin: auto;
        width: 50%;
        display: grid;
    }

    .flex-box {
        display: flex;
        justify-content: space-between;
    }

    .flex-box-2 {
        display: flex;
        justify-content: left;
        align-items: center;
    }

    input {
        padding: 0.5rem;
        font-size: 1.1rem;
    }

    h2 {
        font-size: 16pt;
    }

    .create-form {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    button {
        padding: 0.5rem 1.5rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 0.5rem;
        background-color: orangered;
        color: white;
        cursor: pointer;
    }

    .save {
        display: flex;
        justify-content: center;
        padding: 3rem;
    }
</style>