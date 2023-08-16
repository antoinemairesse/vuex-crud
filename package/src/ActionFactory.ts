import Action from './Action'
import type { CrudModuleConfig, LoadingMutation } from './types/types'
import { CrudAction } from './types/types'

export default class ActionFactory {
  private readonly config: CrudModuleConfig
  constructor(config: CrudModuleConfig) {
    this.config = config
  }

  create(
    loadingMutation: LoadingMutation,
    mutationName: string,
    actionName: string,
    actionType: CrudAction
  ) {
    return new Action({
      ...this.config,
      actionName,
      actionType,
      loadingMutation,
      mutationName
    })
  }
}
