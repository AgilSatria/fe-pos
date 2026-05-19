<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import { RouterLink } from 'vue-router';
import { useProductStore } from '@/stores/product.store';
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import Column from 'primevue/column'
import { IconField, Select, InputText, useConfirm, ConfirmDialog } from 'primevue';
import InputIcon from 'primevue/inputicon'
import { useDebounceFn } from '@vueuse/core';
import { deleteProduct } from '@/api/products.api'
import { getCategories } from '@/api/product-categories.api'
import { useToast } from 'primevue/usetoast'



const productStore = useProductStore()
const { fetch, setLimit, setPage } = productStore
const { items, loading, limit, currentPage, totalPages, search, product_category_id } = storeToRefs(productStore)

const categories = ref([])

const onCategoryChange = (value) => {
    product_category_id.value = value
}

const onSearchInput = useDebounceFn(() => {
    setPage(1)
    fetch()
}, 400)


const confirm = useConfirm()
const toast = useToast()


const confirmDelete = (id, name) => {
    confirm.require({
        message: 'Are you sure you want to delete this product?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await deleteProduct(id)
                toast.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: `Product "${name}" deleted successfully`,
                    life: 3000
                })
                fetch() // Refresh the list after deletion
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to delete product "${name}"`,
                    life: 3000
                })
                console.error('Error deleting product:', error)
            }
        },
        reject: () => {
            console.log('Deletion cancelled')
        }
    })
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value)
}

onMounted(async () => {
    fetch()

    try {
        const response = await getCategories({ limit: 100 })
        categories.value = [
            { id: null, name: 'All Categories' },
            ...response.data.data.items
        ]
    } catch (error) {
        console.error('Failed to fetch categories:', error)
    }
})




</script>

<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Products
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here show all products
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products-create' }" :class="slotProps.class">
                    Add Product
                </RouterLink>
            </Button>
        </div>



        <div class="bg-white rounded-2xl border border-surface-200 p-2 t-6">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                <IconField iconPosition="left" class="w-full md:w-80">
                    <InputIcon class="pi pi-search text-surface-300" />
                    <InputText v-model="search" placeholder="Search..." @input="onSearchInput" />
                </IconField>

                <Select :model-value="product_category_id" :options="categories" optionLabel="name" optionValue="id"
                    placeholder="All Categories" class="w-full md:w-56"
                    filter filterPlaceholder="Search category..."
                    @update:model-value="onCategoryChange" />
            </div>


            <DataTable :value="items" :loading="loading" datakey="id" class="clean-table" :rowHover="true">

                <Column field="name" header="Name" class="min-w-[16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <img :src="data.image_url" :alt="data.name"
                                class="w-10 h-10 rounded-lg object-cover border border-surface-200" />
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="category" header="Category" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span>{{ data.category?.name ?? '-' }}</span>
                    </template>
                </Column>

                <Column field="price" header="Price" class="min-w-[10rem]">
                    <template #body="{ data }">
                        <span>{{ formatCurrency(data.price) }}</span>
                    </template>
                </Column>

                <Column field="stock" header="Stock" class="min-w-[8rem]">
                    <template #body="{ data }">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
                            :class="{
                                'bg-red-500': data.stock === 0,
                                'bg-yellow-500': data.stock > 0 && data.stock <= 10,
                                'bg-green-500': data.stock > 10
                            }">{{ data.stock }}</span>
                    </template>
                </Column>

                <Column header="Actions" style="width: 4rem">
                    <template #body="{ data }">
                        <div class="flex gap-2">
                            <router-link :to="{ name: 'products-edit', params: { id: data.id } }">
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
