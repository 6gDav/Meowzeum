import { describe, it, expect, vi } from 'vitest'
import { app } from '../../index'

import catDatabase from "../cats.json";

vi.mock('../images/catImageFinder', () => {
  return {
    default: vi.fn().mockResolvedValue([
      'https://i.imgur.com/fake_cat1.jpg',
      'https://i.imgur.com/fake_cat2.png'
    ])
  }
})

vi.mock('../images/catImageFinder2', () => {
  return {
    default: vi.fn().mockResolvedValue([
      'https://i.imgur.com/fake_cat1.jpg',
      'https://i.imgur.com/fake_cat2.png'
    ])
  }
})

///
describe('GET /', () => {
  it('Successfully returns the HTML landing page', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')

    const body = await res.text()
    expect(body).toContain('<h1>Hello in Meowzeum API</h1>')
    expect(body).toContain('<html lang="hu">')
  })

  it('Contains links to all the example routes', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain('href="/get-a-cat-image"')
    expect(body).toContain('href="/get-a-cat-info/Ragdoll"')
    expect(body).toContain('href="/get-a-cat-info-datail/get-all-names/"')
    expect(body).toContain('href="/get-a-cat-info-datail/Ragdoll/lifespan"')
  })
})

///get-a-cat-image
describe('GET /get-a-cat-image', () => {
  it('Sucessfully returnd cat images', async () => {
    const res = await app.request('/get-a-cat-image')

    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual([
      'https://i.imgur.com/fake_cat1.jpg',
      'https://i.imgur.com/fake_cat2.png'
    ])
  })
})

///get-a-cat-info/:name
describe('GET /get-a-cat-info/:name', () => {
  it('Successfully returns the cat info', async () => {
    const res = await app.request('/get-a-cat-info/Ragdoll')
    expect(res.status).toBe(200)

    const body = (await res.json()) as { name: string };
    expect(body.name).toBe('Ragdoll');
  })

  it('Returns the same data as the database', async () => {
    const expected = catDatabase.find((cat) => cat.name === 'Ragdoll')

    const res = await app.request('/get-a-cat-info/Ragdoll')
    const body = await res.json()

    expect(body).toEqual(expected)
  })

  it('Returns 404 if the cat does not exist', async () => {
    const res = await app.request('/get-a-cat-info/NotARealCat')
    expect(res.status).toBe(404)

    const body = await res.json()
    expect(body).toEqual({
      success: false,
      message: "Cat with ID 'NotARealCat' not found."
    })
  })
})

///get-a-cat-info-datail/get-all-names/
describe('GET /get-a-cat-info-datail/get-all-names/', () => {
  it('Successfully returns an array of names', async () => {
    const res = await app.request('/get-a-cat-info-datail/get-all-names/')
    expect(res.status).toBe(200)

    const body = (await res.json()) as Array<{
      id: string;
      name: string;
      lifespan: string;
      avg_weight: number;
      colors: string;
      character: string;
      image: string;
    }>;
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    body.forEach((name: unknown) => expect(typeof name).toBe('string'))
  })

  it('Returns the same names as the database', async () => {
    const expected = catDatabase
      .filter((cat) => cat.name)
      .map((cat) => cat.name)

    const res = await app.request('/get-a-cat-info-datail/get-all-names/')
    const body = await res.json()

    expect(body).toEqual(expected)
  })

  it('Contains a known cat', async () => {
    const res = await app.request('/get-a-cat-info-datail/get-all-names/')
    const body = await res.json()

    expect(body).toContain('Ragdoll')
  })
})

///get-a-cat-info-datail/get-all-properties/
describe('GET /get-a-cat-info-datail/get-all-properties/', () => {
  it('Successfully returned all cat properties', async () => {
    const res = await app.request('/get-a-cat-info-datail/get-all-properties/')

    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual([
      "id",
      "name",
      "lifespan",
      "avg_weight",
      "colors",
      "character",
      "image"
    ])
  })
})

///get-a-cat-info-datail/:name/:datail
describe('GET /get-a-cat-info-datail/:name/:datail', () => {
  it('successfully returns the requested cat detail', async () => {
    const res = await app.request('/get-a-cat-info-datail/Siamese/id')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toBeDefined()
  })

  it('returns 404 if the cat is not found', async () => {
    const res = await app.request('/get-a-cat-info-datail/MockCat/id')

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      message: "Cat 'MockCat' or detail 'id' not found."
    })
  })

  it('returns 404 if the detail field does not exist', async () => {
    const res = await app.request('/get-a-cat-info-datail/Cirmi/invalidField')

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      message: "Cat 'Cirmi' or detail 'invalidField' not found."
    })
  })
})