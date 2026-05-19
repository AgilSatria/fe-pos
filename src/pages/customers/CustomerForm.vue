<script setup lang="ts">
import { createCustomer, getCustomer, updateCustomer } from '@/api/customers.api';
import router from '@/router';

import { Button, InputText, Message, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string[]>>({})

const customerId = computed<number | null>(() => {
    return route.params.id
        ? Number(route.params.id)
        : null
})

const isEdit = computed(() => !!customerId.value)


const form = ref({
    id: 0,
    name: '',
    phone: '',
})


const submit = async () => {

    loading.value = true
    errors.value = {}

    try {

        const payload = {
            name: form.value.name,
            phone: form.value.phone,
        }

        if (isEdit.value) {
            await updateCustomer(form.value.id, payload)
        } else {
            const response = await createCustomer(payload)
            form.value.id = response.data.data.id
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value ? 'Customer updated successfully' : `Customer "${form.value.name}" created successfully`,
            life: 3000
        })
        router.push({ name: 'customers' })

    } catch (error: any) {

        if (error.response?.status === 422) {
            errors.value = error.response?.data?.errors ?? {}
            return
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'Something went wrong',
            life: 3000
        })

    } finally {

        loading.value = false

    }
}


onMounted(async () => {
    if (!isEdit.value) return

    loading.value = true

    try {
        const response = await getCustomer(customerId.value!)
        const data = response.data.data

        form.value.id = data.id
        form.value.name = data.name
        form.value.phone = data.phone

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch customer details',
            life: 3000
        })

    } finally {
        loading.value = false
    }

})

</script>




<template>

    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    <span v-if="isEdit">Edit Customer</span>
                    <span v-else>Create Customer</span>

                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update the details of the customer</span>
                    <span v-else>Fill the form to create a new customer</span>
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'customers' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left"></i>
                    Back to Customers
                </RouterLink>
            </Button>
        </div>

        <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden ">

            <form class="p-6 md:p-8" @submit.prevent="submit">
                <div class="p-6 md:p-8 max-w-2xl flex flex-col gap-6">

                    <!-- Name -->
                    <div>
                        <label class="block text-sm font-medium text-surface-700 mb-2" for="name">Name<span
                                class="text-red-500">*</span>
                        </label>

                        <InputText id="name" v-model="form.name" type="text"
                            class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="Customer name..." :invalid="!!errors.name" />

                        <Message v-if="errors.name" :text="errors.name[0]" severity="error" class="mt-2"
                            variant="simple"> {{ errors.name[0] }}
                        </Message>
                    </div>

                    <!-- Phone -->
                    <div>
                        <label class="block text-sm font-medium text-surface-700 mb-2" for="phone">Phone<span
                                class="text-red-500">*</span>
                        </label>

                        <InputText id="phone" v-model="form.phone" type="text"
                            class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="08xxxxxxxxxx" :invalid="!!errors.phone" />

                        <Message v-if="errors.phone" :text="errors.phone[0]" severity="error" class="mt-2"
                            variant="simple"> {{ errors.phone[0] }}
                        </Message>
                    </div>


                    <div class="flex justify-end gap-4">
                        <Button type="button" label="Cancel" severity="secondary" outlined @click="router.back()" />
                        <Button type="submit" label="Save Customer" icon="pi pi-check" />
                    </div>

                </div>
            </form>
        </div>
    </div>
</template>
