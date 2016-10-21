import Parser from '../parser'
import { each, def, createFragment } from '../util'

const forExpReg = /(.*)\s+in\s+(.*)/

export default class ForParser extends Parser {
  constructor(vm, exp, node, scope) {
    super(vm)
    this.exp = exp
    this.node = node
    this.$parent = node.parentNode
    this.$next = node.nextSibling
    this.scope = scope
    this._scope = this.scope || this.vm._data
    this.init()
  }

  init() {
    this.parse()
  }

  parse() {
    const matchs = this.exp.match(forExpReg)
    this.alias = matchs[1]
    this.iterator = matchs[2]
    this.bind(this.iterator)
  }

  render(dataList, isReRender) {
    const listFragment = this.createList(dataList)
    if (isReRender) {
      this.clearList()
      this.$parent.insertBefore(listFragment, this.$next)
    } else {
      this.$parent.replaceChild(listFragment, this.node)
    }
  }

  clearList() {
    const childNodes = this.$parent.childNodes
    each(childNodes, node => {
      if (node.kFor_alias == this.alias) {
        this.$parent.removeChild(node)
      }
    })
  }

  createList(dataList) {
    let $scope, el, listFragment = createFragment()
    each(dataList, (data, i, list) => {
      $scope = Object.create(this._scope)
      el = this.node.cloneNode(true)
      def($scope, this.alias, data)
      def(el, 'kFor_alias', this.alias)
      el.removeAttribute('k-for')
      this.vm._compiler.compile(el, true, $scope)
      listFragment.appendChild(el)
    })
    return listFragment
  }

  update(newValue, oldValue) {
    this.render(newValue, !!oldValue)
  }
}
