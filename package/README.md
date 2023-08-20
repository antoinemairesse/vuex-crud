# Vuex-CRUD

**vuex-crud** is a library for Vuex that simplifies the process of creating CRUD modules  for resources in your Vue.js applications. It provides a structured way to define API interactions, state management, and action handling for common CRUD operations.

## Installation

```bash
npm install @antoinemairesse/vuex-crud
```

## Basic Usage

1) Create your first CRUD module :

```javascript
// src/store/index.js
import { CrudModule } from '@antoinemairesse/vuex-crud'
import { createStore } from 'vuex'

export default createStore({
    modules: {
        books: new CrudModule('books').getModule()
    }
})
```

2) Use it in your components:

```vue
<template>
  <main>
    <div v-if="fetchingBooks">Loading books...</div>
    <div v-else v-for="book in books" :key="book.id">
      <h1>{{ book.title }},</h1>
      <h3>{{ book.genre }},</h3>
      <h5>{{ book.publication_year }}</h5>
    </div>
  </main>
</template>

<script>
  import { mapActions, mapState } from 'vuex';

  export default {
    name: 'books',
    computed: {
      ...mapState('books', ['books', 'fetchingBooks'])
    },
    methods: {
      ...mapActions('books', ['fetchBooks'])
    },
    created() {
      this.fetchBooks();
    }
  };
</script>
```

### There are 5 crud actions, all associated with a vuex action, mutations & states :

- #### `fetchItems` (example with `books` as the resource name):

  - Default Axios config: `{ method: 'GET', url: /<resourceName> }`
  - Vuex action name: `fetchBooks`
  - Loading State: `fetchingBooks`
  - Mutation for the loading state: `SET_FETCHING_BOOKS`
  - State Mutation After Fetch: `SET_BOOKS`
  - State affected by mutation: `books`

- #### `getItem` (example with `books` as the resource name):

    - Default Axios config: `{ method: 'GET', url: /<resourceName>/<actionData> }` (`actionData` is the data passed to the vuex action)
    - Vuex action name: `fetchBooks`
    - Loading State: `fetchingBooks`
    - Mutation for the loading state (commited only if `commitState = true`): `SET_FETCHING_BOOKS`
    - State Mutation After Fetch: `SET_CURRENT_BOOK`
    - State affected by mutation: `currentBook`

- #### `createItem` (example with `books` as the resource name):

    - Default Axios config: `{ method: 'GET', url: /<resourceName>, data: actionData }` (`actionData` is the data passed to the vuex action)    
    - Vuex action name: `createBook`
    - Loading State: `creatingBook`
    - Mutation for the loading state: `SET_CREATING_BOOKS`
    - State Mutation After Fetch (commited only if `commitState = true` & `updateStateAfterAction = true`): `ADD_BOOK`
    - State affected by mutation: `books`

- #### `updateItem` (example with `books` as the resource name):

    - Default Axios config: `{ method: 'GET', url: /<resourceName>/<actionData[idAttribute]>, data: actionData }` (`actionData` is the data passed to the vuex action, `idAttribute` is by default `id`, you can change it using the `setIdAttribute` method)
    - Vuex action name: `updateBook`
    - Loading State: `updatingBook`
    - Mutation for the loading state: `SET_UPDATING_BOOKS`
    - State Mutation After Fetch (commited only if `commitState = true` & `updateStateAfterAction = true`): `UPDATE_BOOK`
    - State affected by mutation: `books`

- #### `deleteItem` (example with `books` as the resource name):

    - Default Axios config: `{ method: 'DELETE', url: /<resourceName>/<actionData> }` (`actionData` is the data passed to the vuex action) 
    - Vuex action name: `deleteBook`
    - Loading State: `deletingBook`
    - Mutation for the loading state: `SET_DELETING_BOOKS`
    - State Mutation After Fetch (commited only if `commitState = true` & `updateStateAfterAction = true`): `DELETE_BOOK`
    - State affected by mutation: `books`

## Examples
Check out the [example](https://github.com/AntoineMairesse/vuex-crud/tree/main/example) directory for usage examples.

## Advanced Usage

### The following options are available when creating a new CrudModule :

For types references, check out: [types](https://github.com/AntoineMairesse/vuex-crud/blob/main/package/src/types/types.ts)

```typescript

enum CrudAction {
    fetchItems = "fetchItems",
    getItem = "getItem",
    createItem = "createItem",
    updateItem = "updateItem",
    deleteItem = "deleteItem"
}

declare class CrudModule {
    /**
     * Create a new CrudModule instance.
     * @param {string} resource - The name of the resource for the CRUD actions.
     * @param {CrudAction[]} actionSelection - Selection of CRUD actions to add to the module
     */
    constructor(resource: string, actionSelection?: (keyof typeof CrudAction)[]);
    /**
     * Set additional custom actions for the CRUD module.
     * @param {Actions} actions - Custom action methods to be added to the module.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setAdditionalActions(actions: Actions): CrudModule;
    /**
     * Set additional custom state properties for the CRUD module.
     * @param {State} state - Custom state properties to be added to the module.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setAdditionalState(state: State): CrudModule;
    /**
     * Set additional custom mutations for the CRUD module.
     * @param {Mutations} mutations - Custom mutations to be added to the module.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setAdditionalMutations(mutations: Mutations): CrudModule;
    /**
     * Get the Vuex module configuration for the CRUD module.
     * @returns {Module} An object representing the Vuex module configuration.
     */
    getModule(): Module;
    /**
     * Set the Axios instance for making API requests.
     * @param {AxiosStatic} axios - The Axios instance to be used for API requests.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setAxios(axios: AxiosStatic): CrudModule;
    /**
     * Set the attribute to be used as the ID for items.
     * @param {string} value - The name of the ID attribute.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setIdAttribute(value: string): CrudModule;
    /**
     * Set whether to update the state after an action (create/update/delete) is performed.
     * @param {boolean} value - Whether to update the state after an action.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setUpdateStateAfterAction(value: boolean): CrudModule;
    /**
     * Set whether to refresh data after an action (create/update/delete) is performed.
     * @param {boolean} value - Whether to refresh data after an action.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setRefreshAfterAction(value: boolean): CrudModule;
    /**
     * Set whether to commit the result of fetch actions.
     * @param {boolean} value - Whether to commit state changes during actions.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setCommitState(value: boolean): CrudModule;
    /**
     * Sets the custom API definition function for CRUD actions on a specified resource.
     *
     * @param {CustomAPIDefinitionFunction} func - The custom API definition function that will be used to define the API.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    setCustomAPIDefinition(func: CustomAPIDefinitionFunction): CrudModule;
    /**
     * Set a callback function to be executed on successful action completion.
     * @param {ActionHandler} func - The function to be executed on action success.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    onActionSuccess(func: ActionHandler): CrudModule;
    /**
     * Set a callback function to be executed on action failure.
     * @param {ActionHandler} func - The function to be executed on action error.
     * @returns {CrudModule} The updated CrudModule instance.
     */
    onActionError(func: ActionHandler): CrudModule;
    /**
     * Helper function to create a custom action that also creates the associated loading state & mutation.
     * @param {Action} action - The vuex action.
     * @param {string} loadingStateName - The name of the loading state
     * @param {string} loadingMutationName - The name of the mutation function that sets the loading state
     * @returns {CrudModule} The updated CrudModule instance.
     * @example
     *
     * async function fetchFilteredBooks({ commit }, actionData) {
     *   const { data } = await api({
     *     method: 'POST',
     *     url: '/books/filter',
     *     data: actionData
     *   })
     *   commit('SET_BOOKS', data)
     * }
     *
     * CrudModule.createCustomAction(fetchFilteredBooks,'fetchingFilteredBooks', 'SET_FETCHING_FILTERED_BOOKS');
     */
    createCustomAction(action: Action, loadingStateName: string, loadingMutationName: string): CrudModule;
    getFactory(): CrudModuleFactory;
}
```


## License

The MIT License (MIT) - See file 'LICENSE' in this project