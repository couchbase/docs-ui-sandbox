const currentPage = document.querySelectorAll('.is_current_path')
for(cp = 0; cp < currentPage.length; cp++){
  currentPage[cp].classList.remove('hide')
  currentPage[0].classList.add('active')

}

const componentTitle = document.querySelectorAll('.component_list_title')

for (var k = 0; k < componentTitle.length; k++) {
  componentTitle[k].addEventListener('click', function (event) {
    let target = event.target;
    let parent = target.parentNode;
    var currVersion = parent.dataset.latestVersion;
    let matchedElement = document.querySelectorAll('.version_items')
    for(var i = 0; i < matchedElement.length; i++) {
      let matchedElementVersion = matchedElement[i].dataset.version
      if(currVersion === matchedElementVersion) {
        // if(matchedElement[i].classList.contains('active')){
        //   matchedElement[i].classList.remove('active')
        //   matchedElement[i].classList.add('hide')
        // }else {
        //   matchedElement[i].classList.add('active')
          matchedElement[i].classList.remove('hide')
        // }
      } else {
        matchedElement[i].classList.add('hide')
      }
    }
  })
}

const menuTitle = document.querySelectorAll('.menu_title')
for(var j = 0; j < menuTitle.length; j++) {
  menuTitle[j].addEventListener('click', function(event){
    event.preventDefault()
    let target = event.target;
    let childElm = target.nextElementSibling;
    if(childElm){
      childElm.classList.remove('hide')
    }
  })
}

// version selection

const version = document.querySelectorAll('.version_list')
for(v = 0; v < version.length; v++) {
  version[v].addEventListener('change', function(event){
    let target = event.target
    let parent = target.parentNode
    parent.dataset.latestVersion = event.target.value
    parent.addEventListener('click', function (event) {
      let target = event.target;
      let parent = target.parentNode;
      var currVersion = parent.dataset.latestVersion;
      let matchedElement = document.querySelectorAll('.version_items')
      for(var i = 0; i < matchedElement.length; i++) {
        let matchedElementVersion = matchedElement[i].dataset.version
        if(currVersion === matchedElementVersion) {
          matchedElement[i].classList.remove('hide')
        } else {
          matchedElement[i].classList.add('hide')
        }
      }
    })
  })
}