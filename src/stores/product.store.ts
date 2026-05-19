import { getProducts } from "@/api/products.api"
import type { Product } from "@/types/product"
import { defineStore } from "pinia"


export const useProductStore = defineStore('product', {
    state: () => ({
        allItems: [] as Product[],
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
        product_category_id: null as number | null,
        loading: false,
    }),


getters: {
    items: (state) => {
        if (!state.product_category_id) return state.allItems
        return state.allItems.filter(item => item.product_category_id === state.product_category_id)
    },
    currentPage: (state) => state.pagination.current_page || 1,
    totalPages: (state) => state.pagination.last_page || 1,
},


    actions: {
        async fetch() {
            this.loading = true

            try {
                const response = await getProducts({
                    page: this.page,
                    limit: this.limit,
                    search: this.search,
                })
                console.log(response.data)

                this.allItems = response.data.data.items
                this.pagination = response.data.data.pagination
            } catch (error) {
                console.error('Failed to fetch products:', error)
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

