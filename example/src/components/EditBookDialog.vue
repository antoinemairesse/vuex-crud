<template>
  <div class="absolute z-[9999] w-full h-full bg-white">
    <button class="absolute top-0 right-[50px]" @click="close">Close X</button>
    <div class="card max-w-[50%]">
      <h2 class="text-2xl font-poppins">Update Book</h2>
      <BookForm
        :book="currentBook"
        :loading="updatingBook"
        submit-btn-text="Update Book"
        @submit="submit"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BookForm from '@/components/BookForm.vue'
import { mapActions, mapState } from 'vuex'

export default defineComponent({
  components: { BookForm },
  computed: {
    ...mapState('books', ['updatingBook', 'currentBook'])
  },
  mounted() {
    document.body.style.position = 'fixed'
    document.body.style.top = `-${window.scrollY}px`
  },
  methods: {
    ...mapActions('books', ['updateBook']),
    submit(updatedBook) {
      this.updateBook(updatedBook)
      this.close()
    },
    close() {
      this.$emit('close')
      document.body.style.position = ''
      document.body.style.top = ''
    }
  }
})
</script>

<style scoped></style>
