const Visitor = require('./visitor')
const Env = require('./env')

class Expander extends Visitor {
  constructor (root, vars) {
    super(root)
    this.env = new Env(vars)
    this.result = ''
  }

  open (node) {
    let doRest = true

    if (node.type === 'text') {
      this.output(node.data)
    }

    else if (node.type !== 'tag') {
      throw new Error(`Unknown node type ${node.type}`)
    }

    else if ('q-num' in node.attribs) {
      this.showTag(node, true)
      this.output(node.attribs['q-num'])
    }

    else if ('q-var' in node.attribs) {
      this.showTag(node, true)
      this.output(this.env.find(node.attribs['q-var']))
    }

    else if ('q-if' in node.attribs) {
      doRest = this.env.find(node.attribs['q-if'])
      if (doRest) {
        this.showTag(node, true)
      }
    }

    else if ('q-loop' in node.attribs) {
      let [indexName, targetName] = node.attribs['q-loop'].split(':')
      delete node.attribs['q-loop']
      const target = this.env.find(targetName)
      for (let index of target) {
        this.env.push({[indexName]: index})
        this.walk(node)
        this.env.pop()
      }
      doRest = false
    }

    else {
      this.showTag(node, true)
    }

    return doRest
  }

  close (node) {
    if (node.type !== 'tag') {
      // do nothing
    }

    else if ('q-num' in node.attribs) {
      this.showTag(node, false)
    }

    else if ('q-var' in node.attribs) {
      this.showTag(node, false)
    }

    else if ('q-if' in node.attribs) {
      if (this.env.find(node.attribs['q-if'])) {
        this.showTag(node, false)
      }
    }

    else if ('q-loop' in node.attribs) {
      // do nothing
    }

    else {
      this.showTag(node, false)
    }
  }

  showTag (node, opening) {
    if (opening) {
      this.output(`<${node.name}`)
      for (let a in node.attribs) {
        if (!a.startsWith('q-')) {
          this.output(` ${a}="${node.attribs[a]}"`)
        }
      }
      this.output(`>`)
    }
    else {
      this.output(`</${node.name}>`)
    }
  }

  output (text) {
    this.result += (text === undefined) ? 'UNDEF' : text
  }
}

module.exports = Expander
