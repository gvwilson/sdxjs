const blue = (left, right) => {
  console.log('BLUE')
  left(right)
}

blue(
  (callback) => {
    console.log('GREEN')
    callback()
  },
  () => console.log('RED')
)
