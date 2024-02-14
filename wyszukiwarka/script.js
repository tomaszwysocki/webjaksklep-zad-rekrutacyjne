const input = document.querySelector('input')
const results = document.querySelector('.results')
const list = document.querySelector('.results ul')
const beforeElement = document.querySelector('.result::before')
const loader = document.querySelector('.loader-icon')

input.addEventListener('input', () => {
  input.setAttribute('value', input.value)
})

const fetchData = async (query, signal) => {
  const res = await fetch(
    `https://dummyjson.com/products/search?q=${query}&limit=5&delay=1000`,
    { signal }
  )
  const data = await res.json()
  return data.products
}

const debounce = func => {
  let timer
  let controller
  return (...args) => {
    clearTimeout(timer)

    if (controller) {
      controller.abort()
    }

    controller = new AbortController()

    timer = setTimeout(() => {
      func.apply(this, args.concat(controller.signal))
    }, 500)
  }
}

const appendNotFound = () => {
  const listItem = document.createElement('li')
  const result = document.createElement('div')

  result.classList.add('result', 'not-found')
  result.innerText = 'No results'
  listItem.appendChild(result)
  list.appendChild(listItem)
}

const appendListItem = ({ title: name, price }) => {
  const listItem = document.createElement('li')
  const result = document.createElement('div')
  const resultName = document.createElement('div')
  const resultPrice = document.createElement('div')
  const resultPriceValue = document.createElement('span')

  result.classList.add('result')
  resultPrice.classList.add('price')

  resultPriceValue.innerText = price
  resultPrice.innerHTML = '$'
  resultPrice.appendChild(resultPriceValue)
  resultName.innerText = name
  result.appendChild(resultName)
  result.appendChild(resultPrice)
  listItem.appendChild(result)
  list.appendChild(listItem)
}

const handleSearchBar = async (event, signal) => {
  loader.classList.add('hidden')
  let products = []
  const query = event.target.value.trim()

  if (query) {
    try {
      loader.classList.remove('hidden')
      products = await fetchData(query, signal)
      loader.classList.add('hidden')
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }

      console.error('Erro fetching data:', error)
      list.innerHTML = ''
      return
    }
  } else {
      results.classList.add('empty')
      list.innerHTML = ''
      return
  }

  list.innerHTML = ''

  if (!products.length) {
    appendNotFound()
  }

  products.forEach(product => {
    appendListItem(product)
  })

  if (list.childElementCount > 0) {
    results.classList.remove('empty')
    return
  }
}

document.addEventListener('input', debounce(handleSearchBar))
