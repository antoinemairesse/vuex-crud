<template>
  <div class="p-4">
    <EditBookDialog
      v-if="updateDialogVisible"
      @close="updateDialogVisible = false"
    />

    {{ $t('books.fetchItems.success') }}

    <div class="flex gap-2 items-center mb-4">
      <h1 class="text-3xl font-poppins">Books and Authors</h1>
      <button
        class="primary-btn"
        v-loading="fetchingBooks"
        :disabled="fetchingBooks"
        @click="fetchBooks"
      >
        Fetch Books
      </button>
      <button
        class="primary-btn"
        v-loading="fetchingFilteredBooks"
        :disabled="fetchingFilteredBooks"
        @click="fetchFilteredBooks({ filter: 'toto' })"
      >
        Fetch Filtered Books
      </button>
      <button
        class="primary-btn"
        v-loading="fetchingAuthors"
        :disabled="fetchingAuthors"
        @click="fetchAuthors"
      >
        Fetch Authors
      </button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="flex gap-2 flex-col">
        <div class="card">
          <h2 class="text-2xl font-poppins">Create Book</h2>
          <BookForm
            :loading="creatingBook"
            submit-btn-text="Create Book"
            @submit="createBook"
          />
        </div>

        <div class="card">
          <h1 class="text-xl mb-4 font-poppins">Books :</h1>
          <div v-loading="fetchingBooks">
            <div v-if="books" class="flex gap-2 flex-wrap">
              <Book
                v-for="book in books"
                :key="book.id"
                :book="book"
                @update="updateBook(book)"
              />
            </div>
            <div v-else>No Data</div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 flex-col">
        <AuthorForm />
        <div class="card">
          <h1 class="text-xl mb-4 font-poppins">Authors :</h1>
          <div v-loading="fetchingAuthors">
            <div v-if="authors" class="flex gap-2 flex-wrap">
              <Author
                v-for="author in authors"
                :key="author.id"
                :author="author"
              />
            </div>
            <div v-else>No Data</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import Book from '@/components/Book.vue'
import Author from '@/components/Author.vue'
import BookForm from '@/components/BookForm.vue'
import AuthorForm from '@/components/AuthorForm.vue'
import EditBookDialog from '@/components/EditBookDialog.vue'

export default {
  name: 'App',
  components: { EditBookDialog, AuthorForm, BookForm, Author, Book },
  data() {
    return {
      updateDialogVisible: false
    }
  },
  computed: {
    ...mapState('books', [
      'books',
      'fetchingBooks',
      'creatingBook',
      'fetchingFilteredBooks'
    ]),
    ...mapState('authors', ['authors', 'fetchingAuthors'])
  },
  methods: {
    ...mapMutations('books', ['SET_CURRENT_BOOK']),
    ...mapActions('books', ['fetchBooks', 'createBook', 'fetchFilteredBooks']),
    ...mapActions('authors', ['fetchAuthors']),
    updateBook(book) {
      this.SET_CURRENT_BOOK(book)
      this.updateDialogVisible = true
    }
  }
}
</script>

<style scoped></style>
