<script setup lang="ts">
import { createCategory, getCategory, updateCategory, uploadCategoryImage } from '@/api/product-categories.api';
import router from '@/router';
import { image } from '@primeuix/themes/aura/chip';

import { Button, FileUpload, InputText, Message, Textarea, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string[]>>({})

const categoryId = computed<number | null>(() => {
    return route.params.id
        ? Number(route.params.id)
        : null
})

const isEdit = computed(() => !!categoryId.value)


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
    name: '',
    description: '',
})


const submit = async () => {

    loading.value = true
    errors.value = {}

    try {

        if (isEdit.value) {
            await updateCategory(form.value.id, form.value)
        } else {
            const response = await createCategory(form.value)
            form.value.id = response.data.data.id
        }

        if (selectedFile.value) {
            const fd = new FormData()
            fd.append('image', selectedFile.value)

            await uploadCategoryImage(form.value.id, fd)
        }

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit.value ? 'Category updated successfully' : 'Category created successfully',
            life: 3000
        })
        router.push({ name: 'product-categories' })

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
        const response = await getCategory(categoryId.value!)
        const data = response.data.data

        form.value.id = data.id
        form.value.name = data.name
        form.value.description = data.description ?? ""
        imagePreview.value = data.image_url ?? ""

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch category details',
            life: 3000
        })

    } finally {
        loading.value = false
    }

    // Fetch category details and populate form for editing
    // This part is left as an exercise, as it requires implementing the getCategory API call and handling the response

})

</script>





<template>

    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    <span v-if="isEdit">Edit Category</span>
                    <span v-else>Create Category</span>

                </h1>
                <p class="text-surface-500 text-sm">
                    <span v-if="isEdit">Update the details of the category</span>
                    <span v-else>Fill the form to create a new category</span>
                </p>
            </div>

            <Button asChild v-slot="slotProps">
                <RouterLink :to="{ name: 'product-categories' }" :class="slotProps.class">
                    <i class="pi pi-arrow-left"></i>
                    Back to Categories
                </RouterLink>
            </Button>
        </div>

        <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden ">

            <form class="p-6 md:p-8" @submit.prevent="submit">
                <div class=" p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    <div class="md:col-span-4 flex flex-col gap-4">
                        <label class="text-sm font-semibold text-surface-700">Category image</label>

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
                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="name">Name<span
                                    class="text-red-500">*</span>
                            </label>

                            <InputText id="name" v-model="form.name" type="text"
                                class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                placeholder="Electronic..." :invalid="!!errors.name" />

                            <Message v-if="errors.name" :text="errors.name[0]" severity="error" class="mt-2"
                                variant="simple"> {{ errors.name[0] }}
                            </Message>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-medium text-surface-700 mb-2" for="description">Description

                            </label>

                            <Textarea id="description" v-model="form.description" rows="6"
                                class="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                placeholder="Category Description" />
                        </div>


                        <div class="flex justify-end gap-4">
                            <Button type="button" label="Cancel" severity="secondary" outlined @click="router.back()" />
                            <Button type="submit" label="Save Category" icon="pi pi-check" />
                        </div>

                    </div>

                </div>
            </form>
        </div>
    </div>
</template>