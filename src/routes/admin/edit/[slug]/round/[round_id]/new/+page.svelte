<script lang="ts">
    let number_of_questions = 7;
    let number_of_fields = 1;
    let title: string = '';
    let placeholders: string[] = [];
    placeholders.length = number_of_fields;
    const maxQuestions = 20;
    const minQuestions = 1;
    const maxFields = 4;
    const minFields = 1;

    function handleChangeQuestions() {
        if (number_of_questions === null) {
            return;
        }
        if (number_of_questions > maxQuestions) {
            number_of_questions = maxQuestions;
        }
        if (number_of_questions < minQuestions) {
            number_of_questions = minQuestions;
        }
    }

    function handleChangeFields() {
        if (number_of_fields === null) {
            return;
        }
        if (number_of_fields > maxFields) {
            number_of_fields = maxFields;
        }
        if (number_of_fields < minFields) {
            number_of_fields = minFields;
        }
        placeholders.length = number_of_fields;
    }
    function handleChange(){
        console.log(placeholders);
    }

</script>


<div>
    <form method="POST">
        <h1>Название шаблона</h1>
        <input type="text" id="title" name="title" value={title}/>
        <h1>Количество вопросов:</h1>
        <input
                id="number-of-questions"
                type="number"
                class="m-4 is-centered"
                bind:value={number_of_questions}
                on:input={() => handleChangeQuestions()}
                name='number_of_questions'
                min="{minQuestions}"
                max="{maxQuestions}"
        >
        <h1>Количество полей</h1>
        <input
                id="number-of-fields"
                type="number"
                class="m-4 is-centered"
                bind:value={number_of_fields}
                on:input={() => handleChangeFields()}
                name='number_of_fields'
                min="{minFields}"
                max="{maxFields}"
        >
        <div>
            {#each placeholders as placeholder, idx}
                <input type="text" id="placeholder" name="placeholder" bind:value={placeholders[idx]} on:input={() => handleChange()} />
            {/each}
        </div>
        <input type="hidden" id="placeholders" name="placeholders" value="{JSON.stringify(placeholders)}"/>
        <button
                type="submit"
                formaction="?/save">
            Сохранить шаблон
        </button>
    </form>
</div>