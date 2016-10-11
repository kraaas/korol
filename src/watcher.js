import Dep from './dep'
import { isNumber } from './util'

const oprationReg = /([\+|-|\*|\/|%]\s*)(\b\w+\b)/g

export default class Watcher {
  constructor(vm, exp, cb, context) {
    this.vm = vm
    this.exp = exp
    this.cb = cb
    this.context = context
    this.value = null
    this.getter = null
    this.init()
  }
  init() {
    Dep.target = this
    this.getter = createGetter(this.exp)
    this.setValue()
    Dep.target = null
  }
  update() {
    this.setValue()
    this.cb.call(this.context, this.value)
  }
  setValue() {
    this.value = this.getter(this.vm._data)
  }
}

function createGetter(exp) {
  let getter
  exp = exp.replace(oprationReg, (str, oprate, oprater) => {
    let result
    if (oprater && isNumber(oprater)) {
      result = str
    } else {
      result = `${oprate}scope.${oprater}`
    }
    return result
  })
  try {
    getter = new Function('scope', `return scope.${exp}`)
  } catch (err) {
    console.error(err)
  }
  return getter || noop
}

function noop() {}
