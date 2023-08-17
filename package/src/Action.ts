import { CrudAction, Mutations } from './types/types'
import type { ActionConfig, ActionContext } from './types/types'

export default class Action {
  private readonly config: ActionConfig

  constructor(config: ActionConfig) {
    this.config = config
  }

  /**
   * Execute the action, making an API call and handling success and error cases.
   * @param {ActionContext} context - The Vuex context object for state and commit function.
   * @param {any} actionData - Data to be used in the action.
   */
  async execute({ commit }: ActionContext, actionData: any) {
    const {
      loadingMutation,
      generateAxiosRequestConfig,
      actionType,
      resourceName,
      axios,
      commitState,
      mutationName,
      handleActionSuccess,
      handleActionError
    } = this.config

    commit(loadingMutation.name, true)

    const { dataMapper, stateMapper, method, url, params, data } =
      generateAxiosRequestConfig(resourceName.original, actionType, actionData)

    try {
      const res = await axios({ method, url, params, data })
      if (commitState)
        commit(mutationName, { data: stateMapper(res.data), actionData })
      handleActionSuccess(
        actionType,
        stateMapper(res.data),
        resourceName.original
      )
      return dataMapper(res.data)
    } catch (err) {
      handleActionError(actionType, err, resourceName.original)
    } finally {
      commit(loadingMutation.name, false)
    }
  }

  isAction(type: any) {
    return [
      CrudAction.deleteItem,
      CrudAction.updateItem,
      CrudAction.createItem
    ].includes(type)
  }

  get state() {
    const { loadingMutation } = this.config

    return {
      [loadingMutation.state]: null
    }
  }

  get actions() {
    const { actionName } = this.config

    return {
      [actionName]: (...args: [ActionContext, any]) => {
        return this.execute(...args)
      }
    }
  }

  get mutations(): Mutations {
    const { loadingMutation } = this.config

    return {
      [loadingMutation.name]: function (state, data) {
        state[loadingMutation.state] = Boolean(data)
      }
    }
  }
}
