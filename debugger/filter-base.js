const a = [-3, -5, -1, 0, -2, 1, 3, 1]
const b = Array()
let largest = a[0]
let i = 0
while (i < length(a)) {
  if (a[i] > largest) {
    b.push(a[i])
  }
  i += 1
}
i = 0
while (i < length(b)) {
  console.log(b[i])
  i += 1
}
