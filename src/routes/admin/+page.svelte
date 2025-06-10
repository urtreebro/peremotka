<script lang="ts">
    import type {PageData} from './$types';
    import {goto} from '$app/navigation';

    export let data: PageData;

    let quizzes = data.quizzes;
    function createNewQuiz() {
        goto('/admin/create');
    }

</script>

<div class="container">
    <h1 class="has-text-weight-bold title">Библиотека</h1>
    <button on:click={createNewQuiz}>Создать новый квиз</button>
    <div class="quiz-library">
        {#if !quizzes || quizzes.length === 0}
            <p>Нет созданных квизов</p>
        {:else}
            {#each quizzes as quiz}
                <div>
                    <form method="POST">
                        <div class="flex-box">
                            <h3 class="title has-text-weight-bold m-3">{quiz.title}</h3>
                            <input type="hidden" value={quiz.id} name="slug"/>
                            <div class="flex-box-2">
                                {#if !quiz.is_current}
                                    <button class="flex-box-2 m-3 make_current_btn" formaction="?/make_current">Сделать текущим</button>
                                {:else}
                                    <button class="flex-box-2 m-3 unmake_current_btn" formaction="?/unmake_current">Текущая игра</button>
                                {/if}
                                <button class="flex-box-2 mt-3 mb-3"  formaction="?/edit">Редактировать</button>
                                <button class="flex-box-2 m-3" formaction="?/delete">Удалить</button>
                            </div>
                        </div>
                    </form>
                </div>
            {/each}
        {/if}
    </div>


</div>

<style>
    .container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .flex-box {
        display: flex;
        justify-content: space-between;
        outline: 2px solid #ddd;
    }

    .flex-box-2 {
        display: flex;
        justify-content: flex-end;
    }

    .quiz-library {
        margin: 2rem 0;
        padding: 1rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 0.5rem;
        background-color: orangered;
        color: white;
        cursor: pointer;
    }

    .make_current_btn {
        color: white;
        background-color: darkgray;
    }

    .unmake_current_btn {
        color: white;
        background-color: limegreen;
    }
</style>