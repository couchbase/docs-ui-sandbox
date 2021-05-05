'use strict'

module.exports = (navGroups, { data: { root: { page, site } } }) => {
  const pageComponentName = page.component.name
  return navGroups.find(({ components }) => ~components.indexOf(pageComponentName))
}
