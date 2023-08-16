import { capitalizeFirstLetter } from './utils'
import pluralize from 'pluralize'

export default class ResourceName {
  original = ''
  plural = ''
  singular = ''

  constructor(name: string) {
    this.original = name
    this.plural = capitalizeFirstLetter(pluralize.plural(name))
    this.singular = capitalizeFirstLetter(pluralize.singular(name))
  }
}
