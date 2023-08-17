import { createStore } from 'vuex'
import { CrudModule, CrudAction } from '@antoinemairesse/vuex-crud'
import api from '@/api'
import { ElMessage } from 'element-plus'
import { t } from '@/main'

// eslint-disable-next-line no-unused-vars
const customAPIDef = (def, resource, action, actionData) => {
  if (action === CrudAction.fetchItems)
    Object.assign(def, {
      stateMapper: data => data[resource],
      dataMapper: data => data[resource]
    })
  return def
}

const onActionSuccess = (action, data, resource) => {
  ElMessage.success({
    message: t(`${resource}.${action}.success`),
    duration: 500
  })
}

const onActionError = (action, data, resource) => {
  ElMessage.error({ message: t(`${resource}.${action}.error`), duration: 500 })
}

const CrudFactory = new CrudModule('')
  .setAxios(api)
  .setCustomAPIDefinition(customAPIDef)
  .onActionError(onActionError)
  .onActionSuccess(onActionSuccess)
  .getFactory()

export default createStore({
  modules: {
    books: CrudFactory.create('books')
      .setAdditionalState({ fetchingFilteredBooks: false })
      .setAdditionalMutations({
        SET_FETCHING_FILTERED_BOOKS: (state, data) => {
          state.fetchingFilteredBooks = data
        }
      })
      .setAdditionalActions({
        fetchFilteredBooks: async ({ commit }) => {
          commit('SET_FETCHING_FILTERED_BOOKS', true)

          // to show loading state
          await new Promise(resolve => {
            setTimeout(resolve, 5000)
          })

          try {
            const { data } = await api({ method: 'POST', url: '/books/filter' })
            commit('SET_BOOKS', data.books)
            onActionSuccess('fetchFilteredBooks', null, 'books')
          } catch (e) {
            onActionError('fetchFilteredBooks', null, 'books')
          } finally {
            commit('SET_FETCHING_FILTERED_BOOKS', false)
          }
        }
      })
      .getModule(),
    authors: CrudFactory.create('authors').getModule(),
    borrowers: CrudFactory.create('borrowers').getModule()
    // OR :
    // books: new CrudModule('books').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // authors: new CrudModule('authors').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // borrowers: new CrudModule('borrowers').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule()
  }
})
