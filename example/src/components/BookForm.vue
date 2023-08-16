<template>
  <div>
    <h2 class="text-2xl font-poppins">Create Book</h2>
    <div class="card">
      <h3>New Book:</h3>
      <el-form :model="newBook">
        <el-form-item label="Title">
          <el-input v-model="newBook.title"></el-input>
        </el-form-item>
        <el-form-item label="Year">
          <el-input v-model="newBook.publication_year"></el-input>
        </el-form-item>
        <el-form-item label="Genre">
          <el-input v-model="newBook.genre"></el-input>
        </el-form-item>
        <button
          v-loading="creatingBook"
          :disabled="creatingBook"
          class="primary-btn"
          @click="createBook(newBook)"
        >
          Create Book
        </button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BookForm',
  data() {
    return {
      newBook: {
        id: Math.round(Math.random() * 10000),
        title: '',
        publication_year: '',
        genre: ''
      }
    }
  },
  computed: {
    ...mapState('books', ['creatingBook'])
  },
  methods: {
    ...mapActions('books', ['createBook'])
  }
}
</script>

<style scoped></style>
