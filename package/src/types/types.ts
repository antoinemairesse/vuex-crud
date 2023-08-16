import { AxiosStatic, CreateAxiosDefaults, Method } from 'axios'
import ResourceName from '../ResourceName'

export type Commit = (type: string, payload?: any) => void

export type State = {
  [key: string]: any
}

export type ActionContext = {
  commit: Commit
  state: State
  dispatch: any
  getters: any
  rootState: any
  rootGetters: any
}

export type Actions = {
  [key: string]: (context: ActionContext, data: any) => any
}

export type LoadingMutation = {
  name: string
  state: string
}

export type Mutation = (
  state: State,
  data: { data: any; actionData: any },
) => void

export type Mutations = {
  [key: string]: Mutation
}

export type ActionHandler = (
  actionType: string,
  data: any,
  resource: string,
) => void

export type Module = {
  namespaced: boolean
  state: State
  actions: Actions
  mutations: Mutations
  getters: object
}

export type APIDefinition = CreateAxiosDefaults & {
  url: string
  method: Method | string
  dataMapper?: (data: any) => any
  stateMapper?: (data: any) => any
}

export type APIDefinitionFunction = (
  resource: string,
  action: string,
  actionData: any,
) => APIDefinition

export type CustomAPIDefinitionFunction = (
  originalAPIDefinition: APIDefinition,
  resource: string,
  action: string,
  actionData: any,
) => APIDefinition

export type CrudModuleConfig = {
  APIDefinition: APIDefinitionFunction
  resourceName: ResourceName
  axios: AxiosStatic
  commitState: boolean
  handleActionSuccess: ActionHandler
  handleActionError: ActionHandler
}

export type ActionConfig = {
  APIDefinition: APIDefinitionFunction
  resourceName: ResourceName
  axios: AxiosStatic
  commitState: boolean
  handleActionSuccess: ActionHandler
  handleActionError: ActionHandler
  actionName: string
  actionType: string
  loadingMutation: LoadingMutation
  mutationName: string
}

export enum CrudActions {
  fetchItems = 'fetchItems',
  getItem = 'getItem',
  createItem = 'createItem',
  updateItem = 'updateItem',
  deleteItem = 'deleteItem',
}
