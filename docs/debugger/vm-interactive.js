import VirtualMachineCallback from './vm-callback.js'

class VirtualMachineInteractive extends VirtualMachineCallback {
  loop (args, lineNum) {
    this.checkBody('loop', 1, args)
    const body = args.slice(1)
    while (this.exec(args[0])) {
      this.dbg.handle(this.env, lineNum, 'loop')
      this.runAll(body)
    }
  }
}

export default VirtualMachineInteractive
