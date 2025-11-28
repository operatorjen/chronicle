import test from 'node:test'
import assert from 'node:assert/strict'
import { Chronicle } from './index.mjs'

function banner(msg) {
  const line = '='.repeat(msg.length)
  console.log(`\n${msg}\n${line}`)
}

test('CHRONICLE: append and cap events', () => {
  banner('CHRONICLE BASIC TEST')
  const c = new Chronicle({ maxEvents: 3 })
  c.append({ t: 0, agentId: 'a', foo: 1 })
  c.append({ t: 1, agentId: 'b', foo: 2 })
  c.append({ t: 2, agentId: 'a', foo: 3 })
  let all = c.getAll()
  console.log('chronicle: after initial appends', {
    count: all.length,
    agents: all.map(e => e.agentId),
    ids: all.map(e => e.id)
  })
  assert.equal(all.length, 3)
  assert.deepEqual(all.map(e => e.agentId), ['a', 'b', 'a'])

  c.append({ t: 3, agentId: 'c', foo: 4 })
  all = c.getAll()
  console.log('chronicle: after appending past cap', {
    count: all.length,
    agents: all.map(e => e.agentId),
    ids: all.map(e => e.id)
  })
  assert.equal(all.length, 3)
  assert.deepEqual(all.map(e => e.agentId), ['b', 'a', 'c'])

  const byA = c.getByAgent('a')
  console.log('chronicle: filtered by agent "a"', {
    count: byA.length,
    agents: byA.map(e => e.agentId),
    ids: byA.map(e => e.id)
  })
  assert.ok(byA.length >= 1)
  assert.ok(byA.every(e => e.agentId === 'a'))

  const range = c.getRange(all[0].id, all[1].id)
  console.log('chronicle: range over first two ids', {
    fromId: all[0].id,
    toId: all[1].id,
    count: range.length,
    ids: range.map(e => e.id)
  })
  assert.ok(range.length >= 1)
})

test('CHRONICLE: reset clears state', () => {
  banner('CHRONICLE RESET TEST')
  const c = new Chronicle({ maxEvents: 5 })
  c.append({ t: 0, agentId: 'a' })
  let all = c.getAll()
  console.log('chronicle reset: before reset', {
    count: all.length,
    ids: all.map(e => e.id),
    agents: all.map(e => e.agentId)
  })
  assert.ok(all.length > 0)

  c.reset()
  all = c.getAll()
  console.log('chronicle reset: after reset', {
    count: all.length,
    ids: all.map(e => e.id)
  })
  assert.equal(all.length, 0)

  c.append({ t: 1, agentId: 'b' })
  all = c.getAll()
  console.log('chronicle reset: after append post-reset', {
    count: all.length,
    ids: all.map(e => e.id),
    agents: all.map(e => e.agentId)
  })
  assert.equal(all.length, 1)
  assert.equal(all[0].id, 0, 'id counter should restart after reset')
})