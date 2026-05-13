<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'primevue'
import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import Message from 'primevue/message'


const authStore = useAuthStore()
const error = ref<string | null>(null)
const form = ref({
    email: '',
    password: ''
})


async function submit() {
    error.value = null

    if (!form.value.email || !form.value.password) {
        error.value = 'Please fill in all fields.'
        return
    }

    try {
        await authStore.login(form.value.email, form.value.password)
        // Redirect to dashboard or home page after successful login
        router.push({ path: '/' })

    } catch (e) {
        error.value = 'Login failed. Please check your credentials and try again.'
    }

}






</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-surface-50 px-4 py-10">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-surface-100">
            <!-- header -->
            <div class="text-center mb-8">
                <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-bolt text-2xl text-white"></i>
                </div>
                <h1 class="text-2xl font-bold text-surface-900 mb-2">Welcome Back</h1>
                <p class="text-surface-500">Please sign in to your account</p>
            </div>

            <form @submit.prevent="submit" class="flex flex-col gap-5">

                <Message v-if="error" severity="error" :closable="false" class="mb-4">
                    {{ error }}
                </Message>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-surface-700 mb-2" for="email">Email <span
                            class="text-red-500">*</span></label>
                    <input id="email" v-model="form.email" type="email"
                        class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        placeholder="you@example.com" />
                </div>


                <!-- Password -->
                <div>
                    <label class="block text-sm font-medium text-surface-700 mb-2" for="password">Password <span
                            class="text-red-500">*</span></label>
                    <input id="password" v-model="form.password" type="password"
                        class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        placeholder="••••••••" />
                </div>


                <!-- button submit -->
                <button type="submit"
                    class="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                    Sign In
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped></style>
