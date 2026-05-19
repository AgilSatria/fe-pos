<script setup lang="ts">
import { createProduct, getProduct, updateProduct, uploadProductImage } from '@/api/products.api';
import { getCategories } from '@/api/product-categories.api';
import router from '@/router';
import type { ProductCategory } from '@/types/product-category';

import { Button, FileUpload, InputText, Message, Select, InputNumber, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string[]>>({})
const categories = ref<ProductCategory[]>([])

const productId = computed<number | null>(() => {
    return route.params.id
        ? Number(route.params.id)
        : null
})

const isEdit = computed(() => !!productId.value)


const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)



const onFileSelect = (event: { files: File[] }) => {
    const file = event.files[0]
    if (!file) return

    selectedFile.value = file

    imagePreview.value = URL.createObjectURL(file)
}


const form = ref({
    id: 0,
    product_category_id: null as number | null,
    name: '',
    price: 0,
    stock: 0,
})


const submit = async () => {

    loading.value = true
    errors.value = {}

    try {

        const payload = {
            product_category_id: form.value.product_category_id!,
            name: form.value.name,
            price: form.value.price,
            stock: form.value.stock,
        }

        if (isEdit.value) {
            await updateProduct(form.value.id, payload)
        } else {
            const response = await createProduct(payload)
            form.value.id = response.data.data.id
        }

        if (selectedFile.value) {
            const fd = new FormData()
            fd.append('image', selectedFile.value)

            await uploadProductImage(form.value.id, fd)
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value ? 'Product updated successfully' : 'Product created successfully',
            life: 3000
        })
        router.push({ name: 'products' })

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


const fetchCategories = async () => {
    try {
        const response = await getCategories({ limit: 100 })
        categories.value = response.data.data.items
    } catch (error) {
        console.error('Failed to fetch categories:', error)
    }
}


onMounted(async () => {
    await fetchCategories()

    if (!isEdit.value) return

    loading.value = true

    try {
        const response = await getProduct(productId.value!)
        const data = response.data.data

        form.value.id = data.id
        form.value.product_category_id = data.product_category_id
        form.value.name = data.name
        form.value.price = data.price
        form.value.stock = data.stock
        imagePreview.value = data.image_url ?? ""

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch product details',
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
                    <span v-if="isEdit">Edit Product</span>
                    <span v-else>Create Product</span>

                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update the details of the product</span>
                    <span v-else>Fill the form to create a new product</span>
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'products' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left"></i>
                    Back to Products
                </RouterLink>
            </Button>
        </div>

        <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden ">

            <form class="p-6 md:p-8" @submit.prevent="submit">
                <div class=" p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    <div class="md:col-span-4 flex flex-col gap-4">
                        <label class="text-sm font-semibold text-surface-700">Product image</label>

                        <div
                            class="w-full aspect-square rounded-xl bg-surface-50 border-2 border-dashed border-surface-300 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-500 transition-colors">
                            <img v-if="imagePreview" :src="imagePreview" class="w-full h-ful object-cover">

                            <div v-else class="flex flex-col items-center gap-2 text-surface-400">
                                <i class="pi pi-image text-4xl opacity-50"></i>
                                <span class="text-sm font-medium">No image selected</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <FileUpload mode="basic" @select="onFileSelect" :auto="false" accept="image/*"
                                :maxFileSize="200000" chooseLabel="Choose Image"
                                class="p-button-sm p-button-outlined w-full" />
                            <small class="text-xs text-surface-500">Max file size: 2MB, Format: JPG, PNG</small>
                        </div>
                    </div>

                    <div class="md:col-span-8 flex flex-col gap-6">
                        <!-- Category -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="product_category_id">Category<span
                                    class="text-red-500">*</span>
                            </label>

                            <Select id="product_category_id" v-model="form.product_category_id"
                                :options="categories" optionLabel="name" optionValue="id"
                                placeholder="Select a category" class="w-full"
                                filter filterPlaceholder="Search category..."
                                :invalid="!!errors.product_category_id" />

                            <Message v-if="errors.product_category_id" :text="errors.product_category_id[0]" severity="error" class="mt-2"
                                variant="simple"> {{ errors.product_category_id[0] }}
                            </Message>
                        </div>

                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="name">Name<span
                                    class="text-red-500">*</span>
                            </label>

                            <InputText id="name" v-model="form.name" type="text"
                                class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                placeholder="Product name..." :invalid="!!errors.name" />

                            <Message v-if="errors.name" :text="errors.name[0]" severity="error" class="mt-2"
                                variant="simple"> {{ errors.name[0] }}
                            </Message>
                        </div>

                        <!-- Price -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="price">Price<span
                                    class="text-red-500">*</span>
                            </label>

                            <InputNumber id="price" v-model="form.price" mode="currency" currency="IDR" locale="id-ID"
                                class="w-full"
                                :invalid="!!errors.price" />

                            <Message v-if="errors.price" :text="errors.price[0]" severity="error" class="mt-2"
                                variant="simple"> {{ errors.price[0] }}
                            </Message>
                        </div>

                        <!-- Stock -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="stock">Stock<span
                                    class="text-red-500">*</span>
                            </label>

                            <InputNumber id="stock" v-model="form.stock" :min="0"
                                class="w-full"
                                :invalid="!!errors.stock" />

                            <Message v-if="errors.stock" :text="errors.stock[0]" severity="error" class="mt-2"
                                variant="simple"> {{ errors.stock[0] }}
                            </Message>
                        </div>


                        <div class="flex justify-end gap-4">
                            <Button type="button" label="Cancel" severity="secondary" outlined @click="router.back()" />
                            <Button type="submit" label="Save Product" icon="pi pi-check" />
                        </div>

                    </div>

                </div>
            </form>
        </div>
    </div>
</template>
