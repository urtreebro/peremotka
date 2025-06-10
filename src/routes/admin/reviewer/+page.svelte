<script lang="ts">
    import type {PageData} from "./$types"
    import {goto} from "$app/navigation";

    export let data: PageData;

    let current_quiz = data.current_quiz;
    let round_blanks = data.rounds_blanks;
</script>

<div class="container">
    {#if current_quiz}
        <h3 class="has-text-weight-bold title m-5">Текущий квиз: {current_quiz.title}</h3>
        {#each round_blanks as round, idx}
            <div class="round">
                <h2 class="has-text-weight-bold mt-4">Раунд {idx + 1}</h2>
                <table>
                    <tbody>
                    {#if round.length > 0}
                        {#each round as blank, idx2}
                            <tr>
                                <th>
                                    <h1>Команда: {blank.player_name}</h1>
                                </th>
                                <td>
                                    {#if blank.state === 'Не проверен'}
                                        <h1 class="has-text-danger">Статус: {blank.state}</h1>
                                    {/if}
                                    {#if blank.state === 'Проверен'}
                                        <h1 class="has-text-success">Статус: {blank.state}</h1>
                                    {/if}
                                    {#if blank.state === 'Не сдан'}
                                        <h1 class="custom">Статус: {blank.state}</h1>
                                    {/if}
                                </td>
                                <td>
                                    {#if blank.state !== 'Не сдан'}
                                        <button
                                                on:click={() => goto(`/admin/reviewer/${blank.id}/check`)}>
                                            {blank.state === 'Не проверен' ? "Проверить" : 'Перепроверить'}
                                        </button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                        {:else}
                        <h1>Нет бланков</h1>
                    {/if}
                    </tbody>

                </table>
            </div>
        {/each}

    {:else}
        <h1 class="title has-text-weight-bold">Нет активного квиза</h1>
    {/if}
</div>

<style>
    .container {
        max-width: 800px;
        align-items: center;
        margin: auto;
        width: 50%;
        display: grid;
    }

    table {
        width: 100%;
        margin: 0 auto;
        align-items: center;
    }

    tr {
        border: 1px solid rgb(160 160 160);
    }

    th,
    td {

        padding: 10px;
        text-align: center;
        width: 40%;
        vertical-align: middle;
    }

    td:last-of-type {
        text-align: center;
        width: 20%;
    }

    .round {
        display: flex;

        flex-direction: column;
    }

    h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
    }

    h1 {
        padding: 0.7rem 0;
    }

    button {
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        border: none;
        border-radius: 0.5rem;
        background-color: orangered;
        color: white;
        cursor: pointer;
        margin: 0.5rem 1rem;
    }

    .custom {
        color: gray;
        text-align: left;
    }
</style>