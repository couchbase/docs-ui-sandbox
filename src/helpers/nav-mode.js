'use strict'

module.exports = ({ data: { root: { contentCatalog = { getSiteStartPage () {} }, navMode } } }) => {
  if (navMode) return navMode
  const siteStartPage = contentCatalog.getSiteStartPage()
  if (siteStartPage && siteStartPage.asciidoc.attributes['export-site-navigation-data'] != null) return 'client'
  return 'template'
}
