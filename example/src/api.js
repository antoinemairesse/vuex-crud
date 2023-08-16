import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)
import fakeData from '@/assets/fakeData.json'

/*
 * I want a fetchBooks action that fetch all books & put them in a state called books (optional)
 * I want a getBook action that fetch one book by id & put it in a state called currentBook (optional)
 * I want a createBook action that creates a book
 * I want a updateBook action that updates a book
 * I want a deleteBook action that deletes a book
 * I want to be able to implement a custom store action in the same store to filter my books
 * */

const getRandom = arr => {
  return arr[Math.floor(Math.random() * (arr.length - 1)) + 1]
}

// BOOKS
mock.onGet('/books').reply(200, {
  books: fakeData.books
})

mock.onPost('/books').reply(config => {
  return [
    204,
    Object.assign(
      structuredClone(getRandom(fakeData.books)),
      JSON.parse(config.data)
    )
  ]
})
mock.onPost('/books/filter').reply(200, {
  books: fakeData.books
})
mock.onPut('/books').reply(config => {
  return [
    200,
    Object.assign(
      structuredClone(getRandom(fakeData.books)),
      JSON.parse(config.data)
    )
  ]
})
mock.onGet(/\/books\/\d+/).reply(200, getRandom(fakeData.books))
mock.onDelete(/\/books\/\d+/).reply(204)

//AUTHORS
mock.onGet('/authors').reply(200, {
  authors: fakeData.authors
})
mock.onPost('/authors').reply(config => {
  return [201, config.data]
})
mock.onPost('/authors/filter').reply(200, {
  authors: fakeData.authors
})
mock.onPut('/authors').reply(config => {
  return [200, config.data]
})
mock.onGet(/\/authors\/\d+/).reply(200, getRandom(fakeData.authors))
mock.onDelete(/\/authors\/\d+/).reply(204)

//BORROWERS
mock.onGet('/borrowers').reply(200, {
  borrowers: fakeData.borrowers
})
mock.onPost('/borrowers').reply(config => {
  return [201, config.data]
})
mock.onPost('/borrowers/filter').reply(200, {
  borrowers: fakeData.borrowers
})
mock.onPut('/borrowers').reply(config => {
  return [200, config.data]
})
mock.onGet(/\/borrowers\/\d+/).reply(200, getRandom(fakeData.borrowers))
mock.onDelete(/\/borrowers\/\d+/).reply(204)

export default axios
