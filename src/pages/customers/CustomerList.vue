<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import { RouterLink } from 'vue-router';
import { useCustomerStore } from '@/stores/customer.store';
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Column from 'primevue/column'
import { IconField, Select, InputText, useConfirm, ConfirmDialog } from 'primevue';
import InputIcon from 'primevue/inputicon'
import { useDebounceFn } from '@vueuse/core';
import { deleteCustomer } from '@/api/customers.api'
import { useToast } from 'primevue/usetoast'



const customerStore = useCustomerStore()
const { fetch, setLimit, setPage } = customerStore
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(customerStore)

const onSearchInput = useDebounceFn(() => {
    setPage(1)
    fetch()
}, 400)


const confirm = useConfirm()
const toast = useToast()


const confirmDelete = (id, name) => {
    confirm.require({
        message: 'Are you sure you want to delete this customer?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await deleteCustomer(id)
                toast.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: `Customer "${name}" deleted successfully`,
                    life: 3000
                })
                fetch()
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to delete customer "${name}"`,
                    life: 3000
                })
                console.error('Error deleting customer:', error)
            }
        },
        reject: () => {
            console.log('Deletion cancelled')
        }
    })
}

onMounted(() => {
    fetch()
})




</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Customers
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here show all customers
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'customers-create' }" :class="slotProps.class">
                    Add Customer
                </RouterLink>
            </Button>
        </div>



        <div class="bg-white rounded-2xl border border-surface-200 p-2 t-6">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-300" />
                    <InputText v-model="search" placeholder="Search..." @input="onSearchInput" />
                </IconField>
            </div>


            <DataTable :value="items" :loading="loading" datakey="id" class="clean-table" :rowHover="true">

                <Column field="name" header="Name" class="min-w-[16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span class="text-sm font-semibold text-primary-700">{{ data.name?.charAt(0)?.toUpperCase() }}</span>
                            </div>
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="phone" header="Phone" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span>{{ data.phone }}</span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 4rem">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <router-link :to="{ name: 'customers-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" severity="secondary" rounded />
                            </router-link>

                            <Button icon="pi pi-trash" severity="danger" rounded
                                @click="confirmDelete(data.id, data.name)" />
                        </div>
                    </template>
                </Column>
            </DataTable>




            <div class="flex justify-between items-center py-4 px-4 border-t border-surface-100 gap-4 ">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Showing 1 to 10 of 100 entries</span>
                    <Select :model-value="limit" :options="[5, 10, 25, 50, 100]" @update:model-value="setLimit" />
                </div>

                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500 font-medium">
                        {{ currentPage }} of {{ totalPages }}
                    </span>

                    <Button icon="pi pi-chevron-left" severity="secondary" rounded :disabled="currentPage <= 1"
                        @click="setPage(currentPage - 1)" />
                    <Button icon="pi pi-chevron-right" severity="secondary" rounded
                        :disabled="currentPage >= totalPages" @click="setPage(currentPage + 1)" />
                </div>
            </div>
        </div>
    </div>


    <ConfirmDialog />

</template>
