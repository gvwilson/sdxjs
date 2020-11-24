import UpdateOnTimestamps from './update-timestamps.js'

class VariableExpander extends UpdateOnTimestamps {
  buildGraph () {
    super.buildGraph()
    this.expandVariables()
  }

  expandVariables () {
    this.graph.nodes().forEach(target => {
      try {
        const dependencies = this.graph.predecessors(target)
        const recipes = this.graph.node(target).recipes
        this.graph.node(target).recipes = recipes.map(act => {
          act = act
            .replace('@TARGET', target)
            .replace('@DEPENDENCIES', dependencies.join(' '))
          dependencies.forEach((dep, i) => {
            act = act.replace(`@DEP[${i}]`, dependencies[i])
          })
          return act
        })
      } catch (error) {
        console.error(`Cannot find ${target} in graph`)
        process.exit(1)
      }
    })
  }
}

export default VariableExpander
