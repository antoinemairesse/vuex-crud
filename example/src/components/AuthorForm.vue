<template>
  <div>
    <h2 class="text-2xl font-poppins">Create Author</h2>
    <div class="card">
      <h3>New Author:</h3>
      <el-form :model="newAuthor">
        <el-form-item label="Name">
          <el-input v-model="newAuthor.name"></el-input>
        </el-form-item>
        <el-form-item label="Birth Year">
          <el-input v-model="newAuthor.birth_year"></el-input>
        </el-form-item>
        <button
          v-loading="creatingAuthor"
          :disabled="creatingAuthor"
          @click="createAuthor(newAuthor)"
          class="primary-btn"
        >
          Create Author
        </button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AuthorForm',
  data() {
    return {
      newAuthor: {
        id: Math.round(Math.random() * 10000),
        name: '',
        birth_year: ''
      }
    }
  },
  computed: {
    ...mapState('authors', ['creatingAuthor'])
  },
  methods: {
    ...mapActions('authors', ['createAuthor'])
  }
}
</script>

<style scoped></style>
