<script lang="ts">
    import type {PageData} from "./$types";
    import type {Template} from "$lib/server/db/types";

    export let data: PageData;
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
    <form class="create-form" method="POST">
        <input
                id="title"
                type="text"
                class="m-4 is-centered"
                value={title}
                name='title'
                placeholder="Введите название квиза"
        />
        <div class="columns bulma-is-display-flex">
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
            {#each roundTypes as type, index}
                <h1>Раунд {index + 1}</h1>
                <select id="list{index}" bind:value={selectedRounds[index]}>
                    <option value=null>Новый шаблон</option>
                    {#each roundTemplates as template}
                        <option value="{template.id}">{template.id}</option>
                    {/each}
                </select>
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
        gap: 2rem;
    }

    /*.round-types {*/
    /*    display: grid;*/
    /*    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));*/
    /*    gap: 1rem;*/
    /*    margin-top: 1rem;*/
    /*}*/

    /*.rounds-section {*/
    /*    border: 1px solid #ddd;*/
    /*    padding: 1rem;*/
    /*    border-radius: 4px;*/
    /*}*/

    /*.round-button {*/
    /*    padding: 1rem;*/
    /*    border: 2px solid orangered;*/
    /*    border-radius: 4px;*/
    /*    background: white;*/
    /*    cursor: pointer;*/
    /*    transition: all 0.2s;*/
    /*}*/

    /*.round-button.selected {*/
    /*    background: orangered;*/
    /*    color: white;*/
    /*}*/
</style>