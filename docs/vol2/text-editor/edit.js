const main = async () => {
  const editorSource = process.argv[2]
  const args = process.argv.slice(3)
  const EditorClass = (await import(editorSource)).default
  const editor = new EditorClass(args[0])
  editor.init()
}

main()
