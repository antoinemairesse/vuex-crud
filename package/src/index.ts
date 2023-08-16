import axios, { AxiosStatic } from 'axios'
import ResourceName from './ResourceName'
import ActionFactory from './ActionFactory'
import type {
  Actions,
  ActionHandler,
  LoadingMutation,
  Module,
  Mutations,
  State,
  APIDefinitionFunction,
  CustomAPIDefinitionFunction,
  APIDefinition,
} from './types/types'
import { isArray } from './utils'
import { CrudModuleConfig } from './types/types'

const crudActions = {
  fetchItems: 'fetchItems',
  getItem: 'getItem',
  createItem: 'createItem',
  updateItem: 'updateItem',
  deleteItem: 'deleteItem',
}

class CrudModuleFactory {
  instance: CrudModule

  constructor(instance: CrudModule) {
    this.instance = instance
  }

  create(resource: string): Module {
    const obj = Object.assign(
      Object.create(Object.getPrototypeOf(this.instance)),
      this.instance,
    )
    obj.resourceName = new ResourceName(resource)
    return obj.getModule()
  }
}

/**
 * Represents a CRUD module.
 */
class CrudModule {
  private resourceName: ResourceName
  private APIDefinition: APIDefinitionFunction
  private customAPIDefinition: CustomAPIDefinitionFunction | null
  private idAttribute: string
  private additionalActions: Actions
  private additionalState: State
  private commitState: boolean
  private updateStateAfterAction: boolean
  private refreshAfterAction: boolean
  private handleActionSuccess: ActionHandler
  private handleActionError: ActionHandler
  private axios: AxiosStatic | axios.AxiosStatic

  /**
   * Create a new CrudModule instance.
   * @param {string} resource - The name of the resource for the CRUD operations.
   */
  constructor(resource: string) {
    /**
     * The resource name.
     * @type {ResourceName}
     */
    this.resourceName = new ResourceName(resource)

    /**
     * Generates an API definition object for various CRUD actions on a specified resource.
     *
     * @param {string} resource - The name of the resource.
     * @param {string} action - The CRUD action to perform (fetchItems, getItem, createItem, deleteItem, updateItem).
     * @param {string | Object} actionData - Data passed to the vuex action (e.g., item data for create/update, item ID for getItem, etc.).
     * @returns {Object} An object describing the API endpoint for the specified action on the resource.
     * @throws {Error} If the action is not one of the supported CRUD actions.
     * @example
     * const apiDefinition = APIDefinition('users', crudActions.getItem, '5f92b59856e148001f2a31e4');
     * // Returns: { method: 'GET', url: '/users/5f92b59856e148001f2a31e4' }
     */
    this.APIDefinition = (resource, action, actionData) => {
      let res: APIDefinition

      if (action === crudActions.fetchItems)
        res = { method: 'GET', url: `/${resource}` }
      else if (action === crudActions.getItem)
        res = { method: 'GET', url: `/${resource}/${actionData}` }
      else if (action === crudActions.createItem)
        res = {
          method: 'POST',
          url: `/${resource}`,
          data: actionData,
        }
      else if (action === crudActions.deleteItem)
        res = {
          method: 'DELETE',
          url: `/${resource}/${actionData}`,
        }
      else if (action === crudActions.updateItem)
        res = {
          method: 'PUT',
          url: `/${resource}/${actionData[this.idAttribute]}`,
          data: actionData,
        }
      else throw new Error(`${action} is not a valid CRUD action`)

      if (this.customAPIDefinition)
        return this.customAPIDefinition(res, resource, action, actionData)
      else return res
    }

    this.customAPIDefinition = null

    /**
     * The ID attribute for items.
     * @type {string}
     */
    this.idAttribute = 'id'

    /**
     * The Axios instance.
     * @type {AxiosStatic}
     */
    this.axios = axios

    /**
     * Additional actions for the module.
     * @type {Object}
     */
    this.additionalActions = {}

    /**
     * Additional state properties for the module.
     * @type {Object}
     */
    this.additionalState = {}

    /**
     * Whether to commit state changes.
     * @type {boolean}
     */
    this.commitState = true

    /**
     * Whether to update state after an action.
     * @type {boolean}
     */
    this.updateStateAfterAction = false

    /**
     * Whether to refresh after an action.
     * @type {boolean}
     */
    this.refreshAfterAction = false

    /**
     * Function to handle action success.
     * @type {Function}
     */
    this.handleActionSuccess = () => {}

    /**
     * Function to handle action errors.
     * @type {Function}
     */
    this.handleActionError = () => {}
  }

  private get states() {
    return {
      items: this.resourceName.plural.toLowerCase(),
      currentItem: `current${this.resourceName.singular}`,
    }
  }

  private get mutations() {
    return {
      setItems: `SET_${this.resourceName.plural.toUpperCase()}`,
      setCurrentItem: `SET_CURRENT_${this.resourceName.singular.toUpperCase()}`,
      addItem: `ADD_${this.resourceName.singular.toUpperCase()}`,
      updateItem: `UPDATE_${this.resourceName.singular.toUpperCase()}`,
      deleteItem: `DELETE_${this.resourceName.singular.toUpperCase()}`,
    }
  }

  /**
   * Get the Vuex actions for the CRUD module.
   * @returns {Object} An object containing Vuex actions for the module.
   */
  private get actions() {
    const actionFactory = new ActionFactory(this.config)

    return [
      actionFactory.create(
        {
          name: `SET_FETCHING_${this.resourceName.plural.toUpperCase()}`,
          state: `fetching${this.resourceName.plural}`,
        } as LoadingMutation,
        this.mutations.setItems,
        `fetch${this.resourceName.plural}`,
        crudActions.fetchItems,
      ),
      actionFactory.create(
        {
          name: `SET_GETTING_${this.resourceName.plural.toUpperCase()}`,
          state: `getting${this.resourceName.plural}`,
        } as LoadingMutation,
        this.mutations.setCurrentItem,
        `get${this.resourceName.singular}`,
        crudActions.getItem,
      ),
      actionFactory.create(
        {
          name: `SET_CREATING_${this.resourceName.plural.toUpperCase()}`,
          state: `creating${this.resourceName.plural}`,
        } as LoadingMutation,
        this.mutations.addItem,
        `create${this.resourceName.singular}`,
        crudActions.createItem,
      ),
      actionFactory.create(
        {
          name: `SET_UPDATING_${this.resourceName.plural.toUpperCase()}`,
          state: `updating${this.resourceName.plural}`,
        } as LoadingMutation,
        this.mutations.updateItem,
        `update${this.resourceName.singular}`,
        crudActions.updateItem,
      ),
      actionFactory.create(
        {
          name: `SET_DELETING_${this.resourceName.plural.toUpperCase()}`,
          state: `deleting${this.resourceName.plural}`,
        } as LoadingMutation,
        this.mutations.deleteItem,
        `delete${this.resourceName.singular}`,
        crudActions.deleteItem,
      ),
    ]
  }

  /**
   * Set additional custom actions for the CRUD module.
   * @param {Actions} actions - Custom action methods to be added to the module.
   */
  setAdditionalActions(actions: Actions) {
    this.additionalActions = actions
  }

  /**
   * Set additional custom state properties for the CRUD module.
   * @param {State} state - Custom state properties to be added to the module.
   */
  setAdditionalState(state: State) {
    this.additionalState = state
  }

  /**
   * Build the Vuex actions for the CRUD module.
   * @returns {Actions} An object containing Vuex actions for the module.
   */
  private buildActions(): Actions {
    return {
      ...this.actions.reduce((accumulator, currentValue) => {
        return Object.assign(accumulator, { ...currentValue.actions })
      }, {}),
      ...this.additionalActions,
    }
  }

  /**
   * Build the Vuex state for the CRUD module.
   * @returns {State} An object containing Vuex state properties for the module.
   */
  private buildState(): State {
    return {
      ...this.actions.reduce((accumulator, currentValue) => {
        return Object.assign(accumulator, { ...currentValue.state })
      }, {}),
      ...Object.values(this.states).reduce((accumulator, currentValue) => {
        return Object.assign(accumulator, { [currentValue]: null })
      }, {}),
      ...this.additionalState,
    }
  }

  /**
   * Build the Vuex mutations for the CRUD module.
   * @returns {Object} An object containing Vuex mutations for the module.
   */
  private buildMutations(): Mutations {
    return {
      ...this.actions.reduce((accumulator, currentValue) => {
        return Object.assign(accumulator, { ...currentValue.mutations })
      }, {}),
      [this.mutations.setItems]: (state, { data }) => {
        state[this.states.items] = data
      },
      [this.mutations.setCurrentItem]: (state, { data }) => {
        state[this.states.currentItem] = data
      },
      [this.mutations.addItem]: (state, { data }) => {
        if (!state[this.states.items]) state[this.states.items] = []
        if (isArray<any>(state[this.states.items])) {
          state[this.states.items].push(data)
        } else throw new Error('') // TODO
      },
      [this.mutations.updateItem]: (state, { data }) => {
        if (isArray<any>(state[this.states.items])) {
          const index = state[this.states.items].findIndex(
            e => e[this.idAttribute] === data[this.idAttribute],
          )
          if (index !== -1) state[this.states.items][index] = data
        } else throw new Error('') // TODO
      },
      [this.mutations.deleteItem]: (state, { actionData }) => {
        if (isArray<any>(state[this.states.items])) {
          state[this.states.items] = state[this.states.items].filter(
            e => e[this.idAttribute] !== actionData,
          )
        }
      },
    }
  }

  /**
   * Get the Vuex module configuration for the CRUD module.
   * @returns {Module} An object representing the Vuex module configuration.
   */
  getModule(): Module {
    return {
      namespaced: true,
      state: this.buildState(),
      actions: this.buildActions(),
      mutations: this.buildMutations(),
      getters: {},
    }
  }

  /**
   * Set the Axios instance for making API requests.
   * @param {AxiosStatic} axios - The Axios instance to be used for API requests.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setAxios(axios: AxiosStatic): CrudModule {
    this.axios = axios
    return this
  }

  /**
   * Set the attribute to be used as the ID for items.
   * @param {string} value - The name of the ID attribute.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setIdAttribute(value: string): CrudModule {
    this.idAttribute = value
    return this
  }

  /**
   * Set whether to update the state after an action is performed.
   * @param {boolean} value - Whether to update the state after an action.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setUpdateStateAfterAction(value: boolean): CrudModule {
    this.updateStateAfterAction = Boolean(value)
    return this
  }

  /**
   * Set whether to refresh data after an action is performed.
   * @param {boolean} value - Whether to refresh data after an action.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setRefreshAfterAction(value: boolean): CrudModule {
    this.refreshAfterAction = Boolean(value)
    return this
  }

  /**
   * Set whether to commit state changes during actions.
   * @param {boolean} value - Whether to commit state changes during actions.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setCommitState(value: boolean): CrudModule {
    this.commitState = Boolean(value)
    return this
  }

  /**
   * Sets the custom API definition function for CRUD actions on a specified resource.
   *
   * @param {CustomAPIDefinitionFunction} func - The custom API definition function that will be used to define the API.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setCustomAPIDefinition(func: CustomAPIDefinitionFunction): CrudModule {
    this.customAPIDefinition = func
    return this
  }

  /**
   * Set a callback function to be executed on successful action completion.
   * @param {ActionHandler} func - The function to be executed on action success.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  onActionSuccess(func: ActionHandler): CrudModule {
    this.handleActionSuccess = func
    return this
  }

  /**
   * Set a callback function to be executed on action failure.
   * @param {ActionHandler} func - The function to be executed on action error.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  onActionError(func: ActionHandler): CrudModule {
    this.handleActionError = func
    return this
  }

  get config(): CrudModuleConfig {
    return {
      APIDefinition: this.APIDefinition,
      resourceName: this.resourceName,
      axios: this.axios,
      commitState: this.commitState,
      handleActionSuccess: this.handleActionSuccess,
      handleActionError: this.handleActionError,
    }
  }

  getFactory() {
    return new CrudModuleFactory(this)
  }
}

export { CrudModule, crudActions }
