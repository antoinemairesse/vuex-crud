<template>
  <div class="container">
    <h1 class="page-title">Books and Authors</h1>

    <div class="buttons">
      <el-button @click="fetchBooks" v-loading="fetchingBooks" :disabled="fetchingBooks" type="primary">Fetch Books</el-button>
      <el-button @click="fetchAuthors" v-loading="fetchingAuthors" :disabled="fetchingAuthors" type="primary">Fetch Authors</el-button>
    </div>

    <div class="section">
      <h2>Create Book</h2>
      <el-card class="card">
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
          <el-button @click="createBook(newBook)" type="primary">Create Book</el-button>
        </el-form>
      </el-card>
    </div>

    <div class="section">
      <h2>Create Author</h2>
      <el-card class="card">
        <h3>New Author:</h3>
        <el-form :model="newAuthor">
          <el-form-item label="Name">
            <el-input v-model="newAuthor.name"></el-input>
          </el-form-item>
          <el-form-item label="Birth Year">
            <el-input v-model="newAuthor.birth_year"></el-input>
          </el-form-item>
          <el-button @click="createAuthor(newAuthor)" type="primary">Create Author</el-button>
        </el-form>
      </el-card>
    </div>

    <div class="section">
      <h2>Books</h2>
      <el-card class="card">
        <div v-loading="fetchingBooks">
          <div v-if="books" class="list">
            <div class="list-item" v-for="book in books" :key="book.id">
              <p class="book-info">{{ book.title }} - {{ book.publication_year }} - {{ book.genre }}</p>
              <el-button @click="deleteBook(book.id)" class="delete-button">Delete</el-button>
            </div>
          </div>
          <span v-else>No data</span>
        </div>
      </el-card>
    </div>

    <div class="section">
      <h2>Authors</h2>
      <el-card class="card">
        <div v-loading="fetchingAuthors">
          <div v-if="authors" class="list">
            <el-row>
              <el-col v-for="author in authors" :key="author.id" :span="8">
                <el-card>
                  <p class="author-info">{{ author.name }} - {{ author.birth_year }}</p>
                  <el-button @click="deleteAuthor(author.id)" class="delete-button">Delete</el-button>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <span v-else>No data</span>
        </div>
      </el-card>
    </div>
  </div>
</template>


<script>
import { mapActions, mapState } from "vuex";

export default {
  name: 'App',
  data() {
    return {
      newBook: {
        title: '',
        publication_year: '',
        genre: ''
      },
      newAuthor: {
        name: '',
        birth_year: ''
      }
    };
  },
  computed: {
    ...mapState('books', ['books', 'fetchingBooks']),
    ...mapState('authors', ['authors', 'fetchingAuthors'])
  },
  methods: {
    ...mapActions('books', ['fetchBooks', 'createBook', 'deleteBook']),
    ...mapActions('authors', ['fetchAuthors', 'createAuthor', 'deleteAuthor'])
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 20px;
}

.card {
  padding: 20px;
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.list-item {
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}

.book-info,
.author-info {
  margin: 10px 0;
  padding: 10px;
}

.delete-button {
  color: red;
}
</style>
