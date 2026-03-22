const red = () => {
  console.log('RED')
}

const green = (func) => {
  console.log('GREEN')
  func()
}

const blue = (left, right) => {
  console.log('BLUE')
  left(right)
}

blue(green, red)
