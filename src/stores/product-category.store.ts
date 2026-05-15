import { getCategories } from "@/api/product-categories.api"
import type { ProductCategory } from "@/types/product-category"
import { defineStore } from "pinia"


export const useProductCategoryStore = defineStore('productCategory', {
    state: () => ({
        items: [] as ProductCategory[],
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: 0,
            to: 0,
        },
        page: 1,
        limit: 10,
        search: '',
        loading: false,
    }),


getters: {
    currentPage: (state) => state.pagination.current_page || 1,
    totalPages: (state) => state.pagination.last_page || 1,
},


    actions: {
        async fetch() {
            this.loading = true

            try {
                const response = await getCategories({
                    page: this.page,
                    limit: this.limit,
                    search: this.search,
                })
                console.log(response.data)

                this.items = response.data.data.items
                this.pagination = response.data.data.pagination
            } catch (error) {
                console.error('Failed to fetch product categories:', error)
            } finally {
                this.loading = false
            }
        },




        setPage(newPage: number) {
            this.page = newPage
            this.fetch()
        },

        

        setLimit(newLimit: number) {
            this.limit = newLimit
            this.page = 1
            this.fetch()
        }

    },
})
