import produce from 'immer'

const DEFAULT_STATE = { events: [], entities: [] }

export function createStore({ handlers, state: initialState }) {
  const listeners = new Set()
  let incomingEvents = []
  let state = { ...DEFAULT_STATE, ...initialState }

  Object.values(handlers).forEach((handlers) =>
    Object.keys(handlers).forEach(
      (event) => (handlers[event] = produce(handlers[event]))
    )
  )

  return { subscribe, update, remove, notify, getState }

  function subscribe(listener) {
    listeners.add(listener)

    return function unsubscribe() {
      listeners.delete(listener)
    }
  }

  function update(elapsed) {
    state = {
      ...state,
      events: [...state.events, { id: 'game:update' }],
    }

    while (state.events.length) {
      const [event, ...rest] = state.events
      const handleEvent = createHandleEvent(event, { elapsed, notify })

      state = {
        ...state,
        events: rest,
        entities: state.entities.map(handleEvent),
      }
    }

    state = {
      ...state,
      events: [...state.events, ...incomingEvents],
    }
    incomingEvents = []

    listeners.forEach((onUpdate) => onUpdate())
  }

  function remove(id) {
    state = {
      ...state,
      entities: state.entities.filter((entity) => entity.id === id),
    }
  }

  function notify(event) {
    incomingEvents.push(event)
  }

  function getState() {
    return state
  }

  function createHandleEvent(event, options) {
    return (entity) => {
      const handle = handlers[entity.type][event.id]
      return (handle && handle(entity, event, options)) || entity
    }
  }
}
