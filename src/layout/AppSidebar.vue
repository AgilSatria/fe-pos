<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth.store'
import router from '@/router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const authStore = useAuthStore()

const { user } = storeToRefs(authStore)

const logoutDialog = ref(false)

const handleLogout = async () => {
    try {
        await authStore.logout()
    } catch (error) {
        console.error(error)
    }

    logoutDialog.value = false
    router.push('/login')
}


const route = useRoute()

const menuItems = ref([
    {
        label: "General",
        items: [
            { label: "Dashboard", icon: "pi pi-home pi-th-large", to: "/" },
        ]
    },
    {
        label: "Management",
        items: [
            { label: "Product Categories", icon: "pi pi-tag", to: "/product-categories" },
            { label: "Categories", icon: "pi pi-tags pi-th-large", to: "/categories" },
            { label: "Orders", icon: "pi pi-shopping-cart pi-th-large", to: "/orders" },
            { label: "Customers", icon: "pi pi-users pi-th-large", to: "/customers" },
        ]
    }
])
</script>

<template>
    <div class="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200">
        <!-- logo -->
        <div class="h-20 flex items-center px-8 border-b border-surface-100">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <i class="pi pi-bolt text-lg"></i>
            </div>
            <span class="ml-3 text-xl font-bold text-surface-900">Contoh POS</span>
        </div>


        <!-- Menu -->

        <div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            <div v-for="(section, i) in menuItems" :key="i">

                <div class="text-xs font-semibold text-surface-500 uppercase">
                    {{ section.label }}
                </div>

                <div class="flex flex-col gap-1">
                    <RouterLink v-for="(item, j) in section.items" :to="item.to" :key="j"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200"
                        :class="[route.path === item.to ? 'bg-primary-100 text-primary-700' : 'text-surface-700 hover:bg-surface-100']">

                        <i :class="item.icon"></i>
                        <span class="font-medium text-sm">{{ item.label }}</span>
                    </RouterLink>
                </div>
            </div>
        </div>

        <!-- user profile -->
        <div class="p-4 border-t border-surface-200">
            <button @click="logoutDialog = true"
                class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 cursor-pointer transition-colors">
                <div class="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center overflow-hidden">
                    <i class="pi pi-user text-lg text-surface-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-900 truncate">{{ user?.name }}</p>
                    <p class="text-xs text-surface-500 truncate">{{ user?.email }}</p>
                </div>
                <div class="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-surface-400
                    group-hover:flex">
                    <i class="pi pi-sign-out text-sm"></i>

                </div>
            </button>
        </div>
    </div>



    <Dialog v-model:visible="logoutDialog" header="Confirm Logout" :modal="true" :closable="false"
        :style="{ width: '350px' }">
        <span class="text-sm text-surface-500">
            Are you sure you want to logout?
        </span>

        <div class="mt-4 flex justify-end gap-3">
            <Button label="Cancel" class="p-button-text" @click="logoutDialog = false" />
            <Button label="Logout" class="p-button-danger" @click="handleLogout" />
        </div>
    </Dialog>





</template>

<style scoped></style>
