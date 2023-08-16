import Action from './Action'
import type { CrudModuleConfig } from './types/types'

export default class ActionFactory {
  private readonly config: CrudModuleConfig
  constructor(config: CrudModuleConfig) {
    this.config = config
  }

  create(loadingMutation, mutationName, actionName, actionType) {
    return new Action({
      ...this.config,
      actionName,
      actionType,
      loadingMutation,
      mutationName
    })
  }
}
