import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/main.css'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      books: {
        fetchItems: {
          success: 'Successfully fetched books',
          error: 'An error occurred while fetching books'
        },
        getItem: {
          success: 'Successfully fetched book',
          error: 'An error occurred while fetching book'
        },
        createItem: {
          success: 'Successfully created book',
          error: 'An error occurred while creating book'
        },
        updateItem: {
          success: 'Successfully updated book',
          error: 'An error occurred while updating book'
        },
        deleteItem: {
          success: 'Successfully deleted book',
          error: 'An error occurred while deleting book'
        }
      },
      authors: {
        fetchItems: {
          success: 'Successfully fetched authors',
          error: 'An error occurred while fetching authors'
        },
        getItem: {
          success: 'Successfully fetched author',
          error: 'An error occurred while fetching author'
        },
        createItem: {
          success: 'Successfully created author',
          error: 'An error occurred while creating author'
        },
        updateItem: {
          success: 'Successfully updated author',
          error: 'An error occurred while updating author'
        },
        deleteItem: {
          success: 'Successfully deleted author',
          error: 'An error occurred while deleting author'
        }
      }
    }
  }
})

const { t, te, tc } = i18n.global

export { t, te, tc }

createApp(App).use(store).use(i18n).use(ElementPlus).mount('#app')
