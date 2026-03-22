import RegexBase from './regex-base.js'

class RegexStart extends RegexBase {
  _match (text, start) {
    return undefined // FIXME
  }
}

export default () => new RegexStart()
