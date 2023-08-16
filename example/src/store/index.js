import {createStore} from 'vuex'
import {CrudModule, crudActions} from '@antoinemairesse/vuex-crud';
import api from "@/api";
import {ElMessage} from 'element-plus'


// eslint-disable-next-line no-unused-vars
const customAPIDef = (def, resource, action, actionData) => {
  if (action === crudActions.fetchItems)
    Object.assign(def, {stateMapper: (data) => data[resource], dataMapper: (data) => data[resource]})
  return def;
}

const onActionSuccess = (action, data, resource) => {
  ElMessage.success(`${resource} ${action}`)
}

const CrudFactory = new CrudModule('')
  .setAxios(api)
  .setCustomAPIDefinition(customAPIDef)
  .onActionSuccess(onActionSuccess)
  .getFactory();


export default createStore({
  modules: {
    books: CrudFactory.create('books'),
    authors: CrudFactory.create('authors'),
    borrowers: CrudFactory.create('borrowers'),
    // OR :
    // books: new CrudModule('books').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // authors: new CrudModule('authors').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule(),
    // borrowers: new CrudModule('borrowers').setAxios(api).setCustomAPIDefinition(customAPIDef).onActionSuccess(onActionSuccess).getModule()
  }
})
