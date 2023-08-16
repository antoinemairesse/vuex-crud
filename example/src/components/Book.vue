<template>
  <div
    class="flex gap-2 justify-center items-center my-2 p-4 bg-gray-200 border-2 border-gray-300 rounded"
  >
    <h1>{{ book.title }},</h1>
    <h3>{{ book.genre }},</h3>
    <h5>{{ book.publication_year }}</h5>
    <button class="delete-button" @click="deleteBook(book.id)">Delete</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Book',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('books', ['deleteBook'])
  }
}
</script>

<style scoped>
.delete-button {
  @apply text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-2.5 py-1.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900;
}
</style>
