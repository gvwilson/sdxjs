import assert from 'assert'

import {
  DomBlock,
  DomCol,
  DomRow
} from './micro-dom.js'

const TEXT_AND_TAG = /^([^<]*)(<[^]+?>)(.*)$/ms
const TAG_AND_ATTR = /<(\w+)([^>]*)>/
const KEY_AND_VALUE = /\s*(\w+)="([^"]*)"\s*/g

const parseHTML = (text) => {
  const chunks = chunkify(text.trim())
  assert(isElement(chunks[0]),
    'Must have enclosing outer node')
  const [node, remainder] = makeNode(chunks)
  assert(remainder.length === 0,
    'Cannot have dangling content')
  return node
}

const chunkify = (text) => {
  const raw = []
  while (text) {
    const matches = text.match(TEXT_AND_TAG)
    if (!matches) {
      break
    }
    raw.push(matches[1])
    raw.push(matches[2])
    text = matches[3]
  }
  if (text) {
    raw.push(text)
  }
  const nonEmpty = raw.filter(chunk => (chunk.length > 0))
  return nonEmpty
}

const isElement = (chunk) => {
  return chunk && (chunk[0] === '<')
}

// [skip]
// [makenode]
const makeNode = (chunks) => {
  assert(chunks.length > 0,
    'Cannot make nodes without chunks')

  if (!isElement(chunks[0])) {
    return [new DomBlock(chunks[0]), chunks.slice(1)]
  }

  const node = makeOpening(chunks[0])
  const closing = `</${node.tag}>`

  let remainder = chunks.slice(1)
  let child = null
  while (remainder && (remainder[0] !== closing)) {
    [child, remainder] = makeNode(remainder)
    node.children.push(child)
  }

  assert(remainder && (remainder[0] === closing),
    `Node with tag ${node.tag} not closed`)
  return [node, remainder.slice(1)]
}
// [/makenode]

// [makeopening]
const makeOpening = (chunk) => {
  const outer = chunk.match(TAG_AND_ATTR)
  const tag = outer[1]
  const attributes = [...outer[2].trim().matchAll(KEY_AND_VALUE)]
    .reduce((obj, [all, key, value]) => {
      obj[key] = value
      return obj
    }, {})
  let Cls = null
  if (tag === 'col') {
    Cls = DomCol
  } else if (tag === 'row') {
    Cls = DomRow
  }
  assert(Cls !== null,
    `Unrecognized tag name ${tag}`)
  return new Cls(attributes)
}
// [/makeopening]
// [/skip]

export default parseHTML
