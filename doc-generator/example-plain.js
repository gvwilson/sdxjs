/**
 * # Demonstrate documentation generator.
 */

const util = require('./util-plain')

/**
 * ## `main`: Main driver.
 */
const main = () => {
  // Parse arguments.
  // Process input stream.
}

/**
 * ## `parseArgs`: Parse command-line arguments.
 * - `args` (`string[]`): arguments to parse.
 * - `defaults` (`Object`): default values.
 *
 * Returns: program configuration object.
 */
const parseArgs = (args, defaults) => {
  // body would go here
}

/**
 * ## `processData`: Process data from input stream, sending results to output stream.
 * - `input` (`stream`): where to read.
 * - `output` (`stream`): where to write.
 * - `op` (`class`): what to do.
 *    Use @DefaultProcessor unless told to do otherwise.
 */
const processData = (input, output, op = util.DefaultProcessor) => {
  // body would go here
}
