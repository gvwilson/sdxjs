import path from 'path'
import url from 'url'

const dirname = (callerURL) => {
  return path.dirname(url.fileURLToPath(callerURL))
}

export default dirname
