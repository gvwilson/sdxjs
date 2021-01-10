export default (editor, key, matches, data) => {
  'Zepto'.split('').forEach(c => editor.onCharacter(c))
}
