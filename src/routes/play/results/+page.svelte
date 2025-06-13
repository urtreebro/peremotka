<script lang="ts">
    import type {PageData} from "./$types";
    import gif from '$lib/results.gif';

    export let data: PageData;

    const current_quiz = data.current_quiz;
    const results = data.results1;
</script>

<div class="container">
    {#if current_quiz.show_results && results.length > 0}
        <table>
            <thead>
            <tr>
                <td>Команда</td>
                {#each results[0].result.scores as _, idx}
                    <td>
                        Тур {idx + 1}
                    </td>
                {/each}
                <td>Итого</td>
            </tr>
            </thead>
            <tbody>
            {#each results as result}
                <tr>
                    <th>
                        {result.name}
                    </th>
                    {#each result.result.scores as score}
                        <td>{score}</td>
                    {/each}
                    <td>
                        {result.result.final_score}
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    {:else}
        <h1 class="has-text-weight-bold title my-3">Считаем итоговые результаты</h1>
        <img alt="" src="{gif}" />
    {/if}

</div>

<style>
    table {
        width: 100%;
        margin: 3rem auto;
        align-items: center;
        font-weight: bold;
    }

    th,
    td {
        border: 2px #30444c solid;
        padding: 10px;
        text-align: center;
        vertical-align: middle;
    }

    tr {
        color: #30444c;
    }

    thead tr {
        background-color: orangered;
        color: white;
    }
    img{
        margin: auto;
    }
</style>