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

const AuthorsModule = new CrudModule('authors')
  .setAxios(api)
  .setRefreshAfterAction(false)
  .setUpdateStateAfterAction(true)
  .setCustomAPIDefinition(customAPIDef)
  .onActionError(onActionError)
  .onActionSuccess(onActionSuccess)

const CrudFactory = AuthorsModule.getFactory()

async function fetchFilteredBooks({ commit }, actionData) {
  // to show loading state
  await new Promise(resolve => {
    setTimeout(resolve, 5000)
  })
  const { data } = await api({
    method: 'POST',
    url: '/books/filter',
    data: actionData
  })
  commit('SET_BOOKS', data)
  onActionSuccess('fetchFilteredBooks', null, 'books')
}

export default createStore({
  modules: {
    books: CrudFactory.create('books')
      .createCustomAction(
        fetchFilteredBooks,
        'fetchingFilteredBooks',
        'SET_FETCHING_FILTERED_BOOKS'
      )
      .getModule(),
    authors: AuthorsModule.getModule(),
    borrowers: CrudFactory.create('borrowers').getModule()
    // OR :
    // books: new CrudModule('books').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // authors: new CrudModule('authors').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // borrowers: new CrudModule('borrowers').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule()
  }
})
