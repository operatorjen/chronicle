const DEFAULT_CONFIG = {
  maxEvents: 1000
}

export class Chronicle {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.events = []
    this.nextId = 0
  }

  append(event) {
    if (!event || typeof event !== 'object') return
    const wrapped = {
      id: this.nextId++,
      time: event.t ?? null,
      agentId: event.agentId ?? null,
      payload: event
    }
    this.events.push(wrapped)
    if (this.events.length > this.config.maxEvents) this.events.shift()
  }

  getAll() { return this.events.slice() }

  getByAgent(agentId) { return this.events.filter(e => e.agentId === agentId) }

  getRange(startId, endId) {
    return this.events.filter(e => { return e.id >= startId && (endId == null || e.id <= endId) })
  }

  reset() {
    this.events = []
    this.nextId = 0
  }
}

export default Chronicle