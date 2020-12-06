export default (editor, key, matches, data) => {
  new Date()
    .toISOString()
    .split('T')[0]
    .split('')
    .forEach(c => editor.onCharacter(c))
}
