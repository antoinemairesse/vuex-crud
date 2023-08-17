<template>
  <div>
    <form @keyup.enter="submit" class="my-4">
      <div>
        <label for="book-title">Title</label>
        <input id="book-title" type="text" v-model="newBook.title" />
      </div>
      <div>
        <label for="book-year">Publication year</label>
        <input
          id="book-year"
          type="number"
          v-model="newBook.publication_year"
        />
      </div>
      <div>
        <label for="book-genre">Genre</label>
        <input id="book-genre" type="text" v-model="newBook.genre" />
      </div>
    </form>
    <button
      v-loading="loading"
      :disabled="loading"
      class="primary-btn"
      @click="submit"
    >
      {{ submitBtnText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'BookForm',
  props: {
    book: {
      type: [Object, null]
    },
    loading: {
      type: [Boolean, null],
      required: true
    },
    submitBtnText: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newBook: this.book ? structuredClone(this.book) : this.resetBook()
    }
  },
  methods: {
    resetBook() {
      return {
        id: Math.round(Math.random() * 10000),
        title: '',
        publication_year: '',
        genre: ''
      }
    },
    submit() {
      this.$emit('submit', this.newBook)
      this.newBook = this.resetBook()
    }
  }
}
</script>

<style scoped></style>
