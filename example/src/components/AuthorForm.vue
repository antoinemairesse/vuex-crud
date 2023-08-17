<template>
  <div>
    <div class="card">
      <h2 class="text-2xl font-poppins">Create Author</h2>
      <form class="my-4" @keyup.enter="createAuthor(newAuthor)">
        <div>
          <label for="author-name">Name</label>
          <input id="author-name" type="text" v-model="newAuthor.name" />
        </div>
        <div>
          <label for="author-birth">Birth year</label>
          <input
            id="author-birth"
            type="number"
            v-model="newAuthor.birth_year"
          />
        </div>
      </form>
      <button
        v-loading="creatingAuthor"
        :disabled="creatingAuthor"
        @click="createAuthor(newAuthor)"
        class="primary-btn"
      >
        Create Author
      </button>
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
