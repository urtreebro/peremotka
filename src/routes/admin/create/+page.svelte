<script lang="ts">
    let title = '';
    let number_of_rounds = 7;
    type roundType = { name: string, type: string }
    let selectedRounds: roundType[] = [];
    let roundTypes: roundType[] = [
        {name: "Исполнитель - Произведение", type: "artist-track"},
        {name: "Исполнитель", type: "artist"},
    ];

    function toggleRound(type: roundType) {
        if (selectedRounds.includes(type)) {
            selectedRounds = selectedRounds.filter(t => t !== type);
        } else if (selectedRounds.length < 7) {
            selectedRounds = [...selectedRounds, type];
        }
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
                    value={number_of_rounds}
                    name='number_of_rounds'
                    min="1"
                    max="100"
            >
        </div>
        <div class="rounds-section">
            <h1 class="title has-text-centered mb-5">Выберите раунды</h1>
            <div class="round-types">
                {#each roundTypes as type}
                    <button
                            type="button"
                            class="round-button"
                            class:selected={selectedRounds.includes(type)}
                            on:click={() => toggleRound(type)}
                    >
                        {type.name}
                    </button>
                {/each}
            </div>
        </div>
        <div>
            {#each roundTypes as type}

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

    .round-types {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .rounds-section {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 4px;
    }

    .round-button {
        padding: 1rem;
        border: 2px solid orangered;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
    }

    .round-button.selected {
        background: orangered;
        color: white;
    }
</style>