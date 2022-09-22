import RegexBase from './regex-base.js'

class RegexEnd extends RegexBase {
  _match (text, start) {
    return undefined // FIXME
  }
}

export default () => new RegexEnd()
