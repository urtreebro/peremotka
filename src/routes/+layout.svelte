<script lang="ts">
    import logo from "$lib/logo.png";
    import {page} from '$app/state';
    import type {LayoutServerData} from './$types';
    import {onNavigate} from '$app/navigation';
    import { onMount } from "svelte";

    onMount(async (): Promise<void> => {}

    )

    onNavigate((navigation) => {
        if (!(document as any).startViewTransition) return;

        return new Promise((resolve) => {
            (document as any).startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    export let data: LayoutServerData;
</script>

{#if page.url.pathname === '/' || page.url.pathname === '/login'}
    <nav class="navbar">
        <div class="navbar-brand pr-4">
            <img src={logo} alt="" width="300" class="mt-2"/>
        </div>
    </nav>
{:else}
    <header>
        <nav class="navbar">
            <div class="navbar-brand pr-4">
                <img src={logo} alt="" width="300" class="mt-2"/>
            </div>
            <div class="navbar-end">
                {#if data?.username}
                    <div
                            aria-current={page.url.pathname.startsWith('/user') ? 'page' : undefined}
                            class="navbar-item has-dropdown is-hoverable"
                    >
                        <span class="navbar-link"> {data.username} </span>

                        <div class="navbar-dropdown">
                            <a
                                    href="/logout"
                                    class="navbar-item"
                                    data-sveltekit-preload-data="off"
                                    data-sveltekit-reload>Выйти</a
                            >
                        </div>
                    </div>
                {/if}
            </div>
        </nav>
    </header>
{/if}
<main>
    <slot/>
</main>

<style>
    .navbar-item {
        display: flex;
        align-items: center;
    }
</style>
