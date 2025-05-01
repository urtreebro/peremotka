<script>
    /** @type {import('./$types').ActionData} */

    export let form;

</script>

<div class="container" style="max-width: 50ch;">
    <form method="POST" action="?/register">
        <input class="input my-2" type="text" placeholder="Название команды" name="username"/>
        {#if form?.errorMessage}
            <p class="has-text-danger">{form.errorMessage}</p>
        {/if}
        <div>
            <button class="button mt-4 mr-3 is-fullwidth" type="submit" formaction="?/register">Войти</button>
        </div>
    </form>
</div>

<style>
    .container {
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50%;
        height: 50%
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
    }


</style>
