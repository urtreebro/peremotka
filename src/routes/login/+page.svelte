<script lang="ts">
    /** @type {import('../../../.svelte-kit/types/src/routes').ActionData} */

    let username: string = '';
    let password = '';

    export let form;
</script>


<div class="container" style="max-width: 55ch;">
    <h1 class="is-size-3 has-text-weight-semibold my-4 mx-2">Войти</h1>
    <form method="post" action="?/login">
        <input
                class="input m-2"
                type="text"
                placeholder="Имя пользователя"
                name="username"
                value={username}
        />
        <input
                class="input m-2"
                type="password"
                placeholder="Пароль"
                name="password"
                value={password}
        />
        {#if form?.errorMessage}
            <div class="has-text-danger my-2">{form.errorMessage}</div>
        {/if}
        <button class="button my-4 mx-2 is-fullwidth button_login" type="submit" formaction="?/login"
        >Вход
        </button
        >
    </form>
</div>

<style>
    .button_login {
        position: relative;
        padding: 0.5rem 1rem;
        font-size: 1.1rem;
        background: orangered;
        color: white;
        cursor: pointer;
    }
</style>