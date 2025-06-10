<script lang="ts">
    import type {PageData} from "./$types";

    export let data: PageData;

    const current_quiz = data.current_quiz;
    const players = data.players;
</script>

<div class="container">
    {#if players.length > 0}
        <table>
            <tbody>
            <tr>
                <th>Команда</th>
                <td>Результат</td>
            </tr>
            {#each players as player}
                <tr>
                    <th>{player.name}</th>
                    <td>{player.score}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    {:else}
        <h1 class="has-text-weight-bold title">Считаем итоговые результаты</h1>
    {/if}

</div>