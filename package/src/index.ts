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
  CrudModuleConfig,
  PartialAPIDefinition,
  Action
} from './types/types'
import { CrudAction } from './types/types'
import { isArray } from './utils'

/**
 * CRUD Module Factory, used if you want to use the same config for multiple crud modules.
 */
class CrudModuleFactory {
  instance: CrudModule

  constructor(instance: CrudModule) {
    this.instance = instance
  }

  /**
   * Creates a new CrudModule based on the factory config.
   * @param {string} resource the resource name
   * @returns {CrudModule} the newly created CrudModule
   */
  create(resource: string): CrudModule {
    const obj = Object.assign(
      Object.create(Object.getPrototypeOf(this.instance)),
      this.instance
    )
    obj.resourceName = new ResourceName(resource)
    return obj
  }
}

/**
 * Represents a CRUD module.
 */
class CrudModule {
  private readonly resourceName: ResourceName
  private readonly generateAxiosRequestConfig: APIDefinitionFunction
  private customAPIDefinition: CustomAPIDefinitionFunction | null
  private idAttribute: string
  private additionalActions: Actions
  private additionalState: State
  private additionalMutations: Mutations
  private commitState: boolean
  private updateStateAfterAction: boolean
  private refreshAfterAction: boolean
  private handleActionSuccess: ActionHandler
  private handleActionError: ActionHandler
  private axios: AxiosStatic | axios.AxiosStatic
  private actionSelection: (keyof typeof CrudAction)[]

  /**
   * Create a new CrudModule instance.
   * @param {string} resource - The name of the resource for the CRUD actions.
   * @param {CrudAction[]} actionSelection - Selection of CRUD actions to add to the module
   */
  constructor(resource: string, actionSelection?: (keyof typeof CrudAction)[]) {
    /**
     * The resource name.
     * @type {ResourceName}
     */
    this.resourceName = new ResourceName(resource)

    /**
     * A crud action array to choose only the actions that you want.
     * @type {CrudAction[]}
     */
    this.actionSelection = actionSelection || [...Object.values(CrudAction)]

    /**
     * Generates an API definition object for various CRUD actions on a specified resource.
     *
     * @param {string} resource - The name of the resource.
     * @param {string} action - The CRUD action to perform (fetchItems, getItem, createItem, deleteItem, updateItem).
     * @param {any} actionData - Data passed to the vuex action (e.g., item data for create/update, item ID for getItem, etc.).
     * @returns {APIDefinition} An object describing the API endpoint for the specified action on the resource.
     * @throws {Error} If the action is not one of the supported CRUD actions.
     * @example
     * const apiDefinition = generateAxiosRequestConfig('users', CrudAction.getItem, '5f92b59856e148001f2a31e4');
     * // Returns: { method: 'GET', url: '/users/5f92b59856e148001f2a31e4' }
     */
    this.generateAxiosRequestConfig = (resource, action, actionData) => {
      let partialDef: PartialAPIDefinition

      if (action === CrudAction.fetchItems)
        partialDef = { method: 'GET', url: `/${resource}` }
      else if (action === CrudAction.getItem)
        partialDef = { method: 'GET', url: `/${resource}/${actionData}` }
      else if (action === CrudAction.createItem)
        partialDef = { method: 'POST', url: `/${resource}`, data: actionData }
      else if (action === CrudAction.deleteItem)
        partialDef = { method: 'DELETE', url: `/${resource}/${actionData}` }
      else if (action === CrudAction.updateItem)
        partialDef = {
          method: 'PUT',
          url: `/${resource}/${actionData[this.idAttribute]}`,
          data: actionData
        }
      else throw new Error(`${action} is not a valid CRUD action`)

      const definition: APIDefinition = {
        ...partialDef,
        dataMapper: (e: any) => e,
        stateMapper: (e: any) => e
      }

      if (!this.customAPIDefinition) return definition
      return this.customAPIDefinition(definition, resource, action, actionData)
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
     * Additional mutations for the module.
     * @type {Object}
     */
    this.additionalMutations = {}

    /**
     * Whether to commit state changes.
     * @type {boolean}
     */
    this.commitState = true

    /**
     * whether to update the state after an action (create/update/delete) is performed.
     * @type {boolean}
     */
    this.updateStateAfterAction = false

    /**
     * whether to refresh data after an action (create/update/delete) is performed.
     * @type {boolean}
     */
    this.refreshAfterAction = true

    /**
     * Function to handle action success.
     * @type {Function}
     */
    this.handleActionSuccess = () => {}

    /**
     * Function to handle action errors.
     * @type {Function}
     */
    this.handleActionError = (actionType, err) => {
      throw err
    }
  }

  private get states() {
    return {
      items: this.resourceName.plural.toLowerCase(),
      currentItem: `current${this.resourceName.singular}`
    }
  }

  private get mutations() {
    return {
      setItems: `SET_${this.resourceName.plural.toUpperCase()}`,
      setCurrentItem: `SET_CURRENT_${this.resourceName.singular.toUpperCase()}`,
      addItem: `ADD_${this.resourceName.singular.toUpperCase()}`,
      updateItem: `UPDATE_${this.resourceName.singular.toUpperCase()}`,
      deleteItem: `DELETE_${this.resourceName.singular.toUpperCase()}`
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
          state: `fetching${this.resourceName.plural}`
        } as LoadingMutation,
        this.mutations.setItems,
        `fetch${this.resourceName.plural}`,
        CrudAction.fetchItems
      ),
      actionFactory.create(
        {
          name: `SET_GETTING_${this.resourceName.singular.toUpperCase()}`,
          state: `getting${this.resourceName.singular}`
        } as LoadingMutation,
        this.mutations.setCurrentItem,
        `get${this.resourceName.singular}`,
        CrudAction.getItem
      ),
      actionFactory.create(
        {
          name: `SET_CREATING_${this.resourceName.singular.toUpperCase()}`,
          state: `creating${this.resourceName.singular}`
        } as LoadingMutation,
        this.mutations.addItem,
        `create${this.resourceName.singular}`,
        CrudAction.createItem
      ),
      actionFactory.create(
        {
          name: `SET_UPDATING_${this.resourceName.singular.toUpperCase()}`,
          state: `updating${this.resourceName.singular}`
        } as LoadingMutation,
        this.mutations.updateItem,
        `update${this.resourceName.singular}`,
        CrudAction.updateItem
      ),
      actionFactory.create(
        {
          name: `SET_DELETING_${this.resourceName.singular.toUpperCase()}`,
          state: `deleting${this.resourceName.singular}`
        } as LoadingMutation,
        this.mutations.deleteItem,
        `delete${this.resourceName.singular}`,
        CrudAction.deleteItem
      )
    ]
  }

  /**
   * Set additional custom actions for the CRUD module.
   * @param {Actions} actions - Custom action methods to be added to the module.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setAdditionalActions(actions: Actions): CrudModule {
    this.additionalActions = actions
    return this
  }

  /**
   * Set additional custom state properties for the CRUD module.
   * @param {State} state - Custom state properties to be added to the module.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setAdditionalState(state: State): CrudModule {
    this.additionalState = state
    return this
  }

  /**
   * Set additional custom mutations for the CRUD module.
   * @param {Mutations} mutations - Custom mutations to be added to the module.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setAdditionalMutations(mutations: Mutations): CrudModule {
    this.additionalMutations = mutations
    return this
  }

  /**
   * Build the Vuex actions for the CRUD module.
   * @returns {Actions} An object containing Vuex actions for the module.
   */
  private buildActions(): Actions {
    return {
      ...this.actions
        .filter(e => this.actionSelection.includes(e.type))
        .reduce((accumulator, currentValue) => {
          return Object.assign(accumulator, { ...currentValue.actions })
        }, {}),
      ...this.additionalActions
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
      ...this.additionalState
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

      [this.mutations.setItems]: (state, payload) => {
        payload = payload?.data ?? payload
        state[this.states.items] = payload
      },

      [this.mutations.setCurrentItem]: (state, payload) => {
        payload = payload?.data ?? payload
        state[this.states.currentItem] = payload
      },

      [this.mutations.addItem]: (state, payload) => {
        payload = payload?.data ?? payload
        const items = state[this.states.items] ?? []

        if (!isArray<object>(items))
          throw new Error(
            `state.${this.states.items} is not an array of objects`
          )

        items.push(payload)
      },

      [this.mutations.updateItem]: (state, payload) => {
        payload = payload?.data ?? payload
        const items = state[this.states.items]

        if (!isArray<object>(items))
          throw new Error(
            `state.${this.states.items} is not an array of objects`
          )

        const index = items.findIndex(
          e => e[this.idAttribute] === payload[this.idAttribute]
        )
        if (index !== -1) items[index] = payload
      },

      [this.mutations.deleteItem]: (state, payload) => {
        payload = payload?.actionData ?? payload
        const items = state[this.states.items]

        if (!isArray<object>(items))
          throw new Error(
            `state.${this.states.items} state is not an array of objects`
          )

        state[this.states.items] = items.filter(
          e => e[this.idAttribute] !== payload
        )
      },
      ...this.additionalMutations
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
      getters: {}
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
   * Set whether to update the state after an action (create/update/delete) is performed.
   * @param {boolean} value - Whether to update the state after an action.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setUpdateStateAfterAction(value: boolean): CrudModule {
    this.updateStateAfterAction = Boolean(value)
    return this
  }

  /**
   * Set whether to refresh data after an action (create/update/delete) is performed.
   * @param {boolean} value - Whether to refresh data after an action.
   * @returns {CrudModule} The updated CrudModule instance.
   */
  setRefreshAfterAction(value: boolean): CrudModule {
    this.refreshAfterAction = Boolean(value)
    return this
  }

  /**
   * Set whether to commit the result of fetch actions.
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
  createCustomAction(
    action: Action,
    loadingStateName: string,
    loadingMutationName: string
  ): CrudModule {
    this.additionalState = {
      ...this.additionalState,
      [loadingStateName]: false
    }
    this.additionalMutations = {
      ...this.additionalMutations,
      [loadingMutationName]: function (state, data) {
        state[loadingStateName] = Boolean(data)
      }
    }

    this.additionalActions = {
      ...this.additionalActions,
      [action.name]: async (context, data) => {
        context.commit(loadingMutationName, true)
        try {
          await action(context, data)
        } catch (err) {
          this.handleActionError(action.name, err, this.resourceName.original)
        } finally {
          context.commit(loadingMutationName, false)
        }
      }
    }

    return this
  }

  private get config(): CrudModuleConfig {
    return {
      generateAxiosRequestConfig: this.generateAxiosRequestConfig,
      resourceName: this.resourceName,
      axios: this.axios,
      commitState: this.commitState,
      updateStateAfterAction: this.updateStateAfterAction,
      handleActionSuccess: this.handleActionSuccess,
      handleActionError: this.handleActionError,
      refreshAfterAction: this.refreshAfterAction
    }
  }

  getFactory() {
    return new CrudModuleFactory(this)
  }
}

export { CrudModule, CrudAction }
