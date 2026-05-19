<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import { RouterLink } from 'vue-router';
import { useTransactionStore } from '@/stores/transaction.store';
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import Column from 'primevue/column'
import { IconField, Select, InputText } from 'primevue';
import InputIcon from 'primevue/inputicon'
import { useDebounceFn } from '@vueuse/core';



const transactionStore = useTransactionStore()
const { fetch, setLimit, setPage } = transactionStore
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(transactionStore)

const onSearchInput = useDebounceFn(() => {
    setPage(1)
    fetch()
}, 400)


const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value)
}

const formatDate = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
                    Transactions
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here show all transactions
                </p>
            </div>
        </div>



        <div class="bg-white rounded-2xl border border-surface-200 p-2 t-6">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-300" />
                    <InputText v-model="search" placeholder="Search by code..." @input="onSearchInput" />
                </IconField>
            </div>


            <DataTable :value="items" :loading="loading" datakey="id" class="clean-table" :rowHover="true">

                <Column field="code" header="Code" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span class="font-mono font-semibold text-primary-600">{{ data.code }}</span>
                    </template>
                </Column>

                <Column field="customer" header="Customer" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span>{{ data.customer?.name ?? '-' }}</span>
                    </template>
                </Column>

                <Column field="subtotal" header="Subtotal" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span>{{ formatCurrency(data.subtotal) }}</span>
                    </template>
                </Column>

                <Column field="tax" header="Tax" class="min-w-[8rem]">
                    <template #body="{ data }">
                        <span>{{ formatCurrency(data.tax) }}</span>
                    </template>
                </Column>

                <Column field="total" header="Total" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span class="font-semibold">{{ formatCurrency(data.total) }}</span>
                    </template>
                </Column>

                <Column field="created_at" header="Date" class="min-w-[12rem]">
                    <template #body="{ data }">
                        <span>{{ formatDate(data.created_at) }}</span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 4rem">
                    <template #body="{ data }">
                        <router-link :to="{ name: 'transactions-detail', params: { id: data.id } }">
                            <Button icon="pi pi-eye" severity="secondary" rounded />
                        </router-link>
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

</template>
