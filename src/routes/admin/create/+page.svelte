<script lang="ts">
     /** @type {import('./$types').ActionData} */
    import type {PageData} from "./$types";
    import {persist} from "svelte-use-persist";
    import type {Template} from "$lib/server/db/types";

    export let data: PageData;
    export let form;
    let title = '';
    let number_of_rounds = 7;
    let roundTypes: string[] = [];
    let roundTemplates: Template[] = data.templates;
    roundTypes.length = number_of_rounds;
    let selectedRounds: string[] = [];
    const maxRounds = 20;
    const minRounds = 1;

    function handleChange() {
        if (number_of_rounds === null) {
            return;
        }
        if (number_of_rounds > maxRounds) {
            number_of_rounds = maxRounds;
        }
        if (number_of_rounds < minRounds) {
            number_of_rounds = minRounds;
        }
        roundTypes.length = number_of_rounds;
        selectedRounds.length = number_of_rounds;
    }
</script>

<div class="container mt-4 has-text-centered">
    <h1 class="has-text-weight-bold title has-text-centered m-4">Новый квиз</h1>
    <form class="create-form" method="POST" use:persist={{key: `create`}}>
        <input
                id="title"
                type="text"
                class="mt-5 is-centered"
                value={title}
                name='title'
                placeholder="Введите название квиза"
        />
        {#if form?.errorMessage}
            <p class="has-text-danger">{form.errorMessage}</p>
        {/if}
        <div class="columns bulma-is-display-flex my-4">
            <h1 class="m-5">Количество раундов:</h1>
            <input
                    id="number-of-rounds"
                    type="number"
                    class="m-4 is-centered"
                    bind:value={number_of_rounds}
                    on:input={() => handleChange()}
                    name='number_of_rounds'
                    min="{minRounds}"
                    max="{maxRounds}"
            >
        </div>
        <div>
            {#each roundTypes as _, index}
                <div class="flex-box">
                    <h2>Раунд {index + 1}</h2>
                    <select id="list{index}" bind:value={selectedRounds[index]}>
                        <option value=null>Новый шаблон</option>
                        {#each roundTemplates as template}
                            <option value="{template.id}">{template.title}</option>
                        {/each}
                    </select>
                </div>
            {/each}
        </div>
        <input type="hidden" id="rounds" name="rounds" value="{JSON.stringify(selectedRounds)}"/>
        <button
                type="submit"
                formaction="?/create">
            Перейти к раундам
        </button>
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

    input {
        padding: 0.5rem;
        font-size: 1.1rem;
    }

    .create-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

   .flex-box {
       display: flex;
       flex-direction: row;
   }
   select{
       margin: 1rem 2rem;
   }
   h2{
       margin: 1rem ;
   }

    button {
        width: 300px;
        padding: 1rem 2rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 0.5rem;
        background-color: orangered;
        color: white;
        cursor: pointer;
        margin: 1rem auto 4rem;
    }
</style>