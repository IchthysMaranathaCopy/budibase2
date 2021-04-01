import { get } from 'svelte/store'
import api from 'builderStore/api'

jest.mock('builderStore/api');

import { SOME_DATASOURCE, SAVE_DATASOURCE} from './fixtures/datasources'

import { createDatasourcesStore } from "../datasources"
import { queries } from '../queries'

describe("Datasources Store", () => {
  let store = createDatasourcesStore()

  beforeEach(async () => {
    api.get.mockReturnValue({ json: () => [SOME_DATASOURCE]})
    await store.init()
  })

  it("Initialises correctly", async () => {
    api.get.mockReturnValue({ json: () => [SOME_DATASOURCE]})
  
    await store.init()
    expect(get(store)).toEqual({ list: [SOME_DATASOURCE], selected: null})
  })

  it("fetches all the datasources and updates the store", async () => {
    api.get.mockReturnValue({ json: () => [SOME_DATASOURCE]})

    await store.fetch()
    expect(get(store)).toEqual({ list: [SOME_DATASOURCE], selected: null})  
  })

  it("selects a datasource", async () => {
    store.select(SOME_DATASOURCE._id)
  
    expect(get(store).select).toEqual(SOME_DATASOURCE._id)  
  })

  it("resets the queries store when new datasource is selected", async () => {
    
    await store.select(SOME_DATASOURCE._id)
    const queriesValue = get(queries)
    expect(queriesValue.selected).toEqual(null)  
  })

  it("saves the datasource, updates the store and returns status message", async () => {
    api.post.mockReturnValue({ json: () => SAVE_DATASOURCE})    

    await store.save({
      name: 'CoolDB',
      source: 'REST',
      config: SOME_DATASOURCE[0].config

    })

    expect(get(store).list).toEqual(expect.arrayContaining([SAVE_DATASOURCE]))
  })
  it("deletes a datasource, updates the store and returns status message", async () => {
    api.get.mockReturnValue({ json: () => SOME_DATASOURCE})

    await store.fetch()

    api.delete.mockReturnValue({status: 200, message: 'Datasource deleted.'})    

    await store.delete(SOME_DATASOURCE[0])
    expect(get(store)).toEqual({ list: [], selected: null})  
  })
})