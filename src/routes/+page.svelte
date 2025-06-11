<script lang="ts">
    /** @type {import('./$types').ActionData} */
    import type {PageData} from './$types';

    export let data: PageData;
    export let form;
    let current_quiz = data.current_quiz;
</script>

<div class="container" style="max-width: 50ch;">
    {#if current_quiz}
        <h1 class="has-text-weight-bold title m-6 is-center">Текущая игра: {current_quiz.title}</h1>
        <form method="POST" action="?/register">
            <input class="input my-2" type="text" placeholder="Название команды" name="username"/>
            {#if form?.errorMessage}
                <p class="has-text-danger">{form.errorMessage}</p>
            {/if}
            <div>
                <button class="button mt-4 mr-3 is-fullwidth" type="submit" formaction="?/register">Войти</button>
            </div>
            <input type="hidden" name="current_quiz" value={current_quiz.id}/>
        </form>
    {:else }
        <h1 class="has-text-weight-bold title">Ждем следующую игру</h1>
    {/if}

</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 70vh;
        text-align: center;
    }

    button {
        position: relative;
        padding: 0.5rem 1rem;
        font-size: 1.1rem;
        background: orangered;
        color: white;
        cursor: pointer;
    }

    input {
        padding: 0.5rem;
        font-size: 1.1rem;
        vertical-align: center;
    }
</style>
