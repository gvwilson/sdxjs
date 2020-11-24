/**
 * # Demonstrate documentation generator.
 */

import util from './util-plain'

/**
 * ## `main`: Main driver.
 */
const main = () => { // eslint-disable-line
  // Parse arguments.
  // Process input stream.
}

/**
 * ## `parseArgs`: Parse command line.
 * - `args` (`string[]`): arguments to parse.
 * - `defaults` (`Object`): default values.
 *
 * Returns: program configuration object.
 */
const parseArgs = (args, defaults) => { // eslint-disable-line
  // body would go here
}

/**
 * ## `process`: Transform data.
 * - `input` (`stream`): where to read.
 * - `output` (`stream`): where to write.
 * - `op` (`class`): what to do.
 *    Use @BaseProcessor unless told otherwise.
 */
const process = (input, output, op = util.BaseProcessor) => { // eslint-disable-line
  // body would go here
}
