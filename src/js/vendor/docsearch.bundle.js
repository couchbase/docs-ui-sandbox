;(function () {
  'use strict'

  var CTRL_KEY_CODE = 17
  var S_KEY_CODE = 83
  var SOLIDUS_KEY_CODE = 191

  activateSearch(require('docsearch.js/dist/cdn/docsearch.js'), document.getElementById('search-script').dataset)

  function activateSearch (docsearch, config) {
    appendStylesheet(config.stylesheet)
    var algoliaOptions = {
      hitsPerPage: parseInt(config.maxResults) || 25,
      advancedSyntax: true,
      advancedSyntaxFeatures: ['exactPhrase'],
    }
    var searchField = document.querySelector('form.search')
    var controller = docsearch({
      appId: config.appId,
      apiKey: config.apiKey,
      indexName: config.indexName,
      inputSelector: 'form.search #search-query',
      autocompleteOptions: { autoselect: false, debug: true, hint: false, keyboardShortcuts: [], minLength: 2 },
      algoliaOptions: algoliaOptions,
      transformData: protectHitOrder,
    })
    var input = controller.input
    var typeahead = input.data('aaAutocomplete')
    var dropdown = typeahead.dropdown
    var menu = dropdown.$menu
    typeahead.setVal() // clear value on page reload
    input.on('autocomplete:closed', clearSearch.bind(typeahead))
    input.on('autocomplete:selected', onSuggestionSelected)
    input.on('autocomplete:updated', onResultsUpdated.bind(typeahead))
    dropdown._ensureVisible = ensureVisible
    menu.off('mousedown.aa')
    menu.off('mouseenter.aa')
    menu.off('mouseleave.aa')
    var suggestionSelector = '.' + dropdown.cssClasses.prefix + dropdown.cssClasses.suggestion
    menu.on('mousedown.aa', suggestionSelector, onSuggestionMouseDown.bind(dropdown))
    monitorCtrlKey.call(typeahead)
    searchField.addEventListener('click', confineEvent)
    document.documentElement.addEventListener('click', clearSearch.bind(typeahead))
    document.addEventListener('keydown', handleShortcuts.bind(typeahead))
    if (input.attr('autofocus') != null) input.focus()
  }

  function appendStylesheet (href) {
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: href }))
  }

  function onResultsUpdated () {
    if (!isClosed(this)) getScrollableResultsContainer(this.dropdown).scrollTop(0)
  }

  function confineEvent (e) {
    e.stopPropagation()
  }

  function ensureVisible (el) {
    var container = getScrollableResultsContainer(this)[0]
    if (container.scrollHeight === container.offsetHeight) return
    var delta
    var item = el[0]
    if ((delta = 15 + item.offsetTop + item.offsetHeight - (container.offsetHeight + container.scrollTop)) > 0) {
      container.scrollTop += delta
    }
    if ((delta = item.offsetTop - container.scrollTop) < 0) {
      container.scrollTop += delta
    }
  }

  function getScrollableResultsContainer (dropdown) {
    var suggestionsSelector = '.' + dropdown.cssClasses.prefix + dropdown.cssClasses.suggestions
    return dropdown.datasets[0].$el.find(suggestionsSelector)
  }

  function handleShortcuts (e) {
    var target = e.target || {}
    if (e.altKey || e.shiftKey || target.isContentEditable || 'disabled' in target) return
    if (e.ctrlKey ? e.keyCode === SOLIDUS_KEY_CODE : e.keyCode === S_KEY_CODE) {
      this.$input.focus()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function isClosed (typeahead) {
    var query = typeahead.getVal()
    return !query || query !== typeahead.dropdown.datasets[0].query
  }

  function monitorCtrlKey () {
    this.$input.on('keydown', onCtrlKeyDown.bind(this))
    this.dropdown.$container.on('keyup', onCtrlKeyUp.bind(this))
  }

  function onCtrlKeyDown (e) {
    if (e.keyCode !== CTRL_KEY_CODE) return
    var dropdown = this.dropdown
    var container = getScrollableResultsContainer(dropdown)
    var prevScrollTop = container.scrollTop()
    dropdown.getCurrentCursor().find('a').focus()
    container.scrollTop(prevScrollTop) // calling focus can cause the container to scroll, so restore it
  }

  function onCtrlKeyUp (e) {
    if (e.keyCode !== CTRL_KEY_CODE) return
    this.$input.focus()
  }

  function onSuggestionMouseDown (e) {
    var dropdown = this
    var suggestion = dropdown._getSuggestions().filter('#' + e.currentTarget.id)
    if (suggestion[0] === dropdown._getCursor()[0]) return
    dropdown._removeCursor()
    dropdown._setCursor(suggestion, false)
  }

  function onSuggestionSelected (e) {
    e.isDefaultPrevented = function () {
      return true
    }
  }

  function clearSearch () {
    this.setVal()
  }

  // preserves the original order of results by qualifying unique occurrences of the same lvl0 and lvl1 values
  function protectHitOrder (hits) {
    var prevLvl0
    var lvl0Qualifiers = {}
    var lvl1Qualifiers = {}
    return hits.map(function (hit) {
      var lvl0 = hit.hierarchy.lvl0
      var lvl1 = hit.hierarchy.lvl1
      if (!lvl0) {
        if ((lvl0 = hit.component_title)) {
          lvl0 = hit.hierarchy.lvl0 = lvl0 + (hit.display_version ? ' ' + hit.display_version : '')
        } else {
          lvl0 = hit.hierarchy.lvl0 = hit.component + (hit.version ? ' ' + hit.version : '')
        }
      }
      if (!lvl1) lvl1 = hit.hierarchy.lvl1 = lvl0
      var lvl0Qualifier = lvl0Qualifiers[lvl0]
      if (lvl0 !== prevLvl0) {
        lvl0Qualifiers[lvl0] = lvl0Qualifier == null ? (lvl0Qualifier = '') : (lvl0Qualifier += ' ')
        lvl1Qualifiers = {}
      }
      if (lvl0Qualifier) hit.hierarchy.lvl0 = lvl0 + lvl0Qualifier
      if (lvl1 in lvl1Qualifiers) {
        hit.hierarchy.lvl1 = lvl1 + (lvl1Qualifiers[lvl1] += ' ')
      } else {
        lvl1Qualifiers[lvl1] = ''
      }
      prevLvl0 = lvl0
      return hit
    })
  }
})()
