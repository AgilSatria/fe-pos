<script setup lang="ts">
import { getTransaction } from '@/api/transactions.api';
import type { Transaction } from '@/types/transaction';
import router from '@/router';

import { Button, useToast } from 'primevue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const transaction = ref<Transaction | null>(null)

const transactionId = computed<number>(() => Number(route.params.id))

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value)
}

const formatDate = (value: string) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}


onMounted(async () => {
    loading.value = true

    try {
        const response = await getTransaction(transactionId.value)
        transaction.value = response.data.data
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch transaction details',
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
                    Transaction Detail
                </h1>
                <p class="text-surface-500 text-sm">
                    Viewing transaction <span class="font-mono font-semibold text-primary-600">{{ transaction?.code
                    }}</span>
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'transactions' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left"></i>
                    Back to Transactions
                </RouterLink>
            </Button>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <i class="pi pi-spin pi-spinner text-4xl text-surface-400"></i>
        </div>

        <div v-else-if="transaction" class="flex flex-col gap-6">

            <!-- Transaction Info -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
                <h2 class="text-lg font-semibold text-surface-900 mb-6">Transaction Information</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <span class="block text-xs font-medium text-surface-500 mb-1">Code</span>
                        <span class="font-mono font-semibold text-primary-600">{{ transaction.code }}</span>
                    </div>
                    <div>
                        <span class="block text-xs font-medium text-surface-500 mb-1">Customer</span>
                        <span class="font-medium">{{ transaction.customer?.name ?? '-' }}</span>
                    </div>
                    <div>
                        <span class="block text-xs font-medium text-surface-500 mb-1">Phone</span>
                        <span>{{ transaction.customer?.phone ?? '-' }}</span>
                    </div>
                    <div>
                        <span class="block text-xs font-medium text-surface-500 mb-1">Date</span>
                        <span>{{ formatDate(transaction.created_at) }}</span>
                    </div>
                </div>
            </div>

            <!-- Transaction Items -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
                <h2 class="text-lg font-semibold text-surface-900 mb-6">Items</h2>

                <DataTable :value="transaction.items" datakey="id" class="clean-table" :rowHover="true">
                    <Column field="product_name" header="Product" class="min-w-[16rem]">
                        <template #body="{ data }">
                            <span class="font-medium">{{ data.product.name }}</span>
                        </template>
                    </Column>

                    <Column field="price" header="Price" class="min-w-[10rem]">
                        <template #body="{ data }">
                            <span>{{ formatCurrency(data.price) }}</span>
                        </template>
                    </Column>

                    <Column field="quantity" header="Qty" class="min-w-[6rem]">
                        <template #body="{ data }">
                            <span>{{ data.quantity }}</span>
                        </template>
                    </Column>

                    <Column field="subtotal" header="Subtotal" class="min-w-[10rem]">
                        <template #body="{ data }">
                            <span class="font-medium">{{ formatCurrency(data.subtotal) }}</span>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Summary -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6 md:p-8">
                <h2 class="text-lg font-semibold text-surface-900 mb-6">Summary</h2>

                <div class="max-w-sm ml-auto flex flex-col gap-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-surface-500">Subtotal</span>
                        <span>{{ formatCurrency(transaction.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-surface-500">Tax</span>
                        <span>{{ formatCurrency(transaction.tax) }}</span>
                    </div>
                    <div class="border-t border-surface-200 pt-3 flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span class="text-primary-600">{{ formatCurrency(transaction.total) }}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
