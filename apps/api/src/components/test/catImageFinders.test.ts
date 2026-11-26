import './mockEnv'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import getCatPictures from '../images/catImageFinder'
import getCatPictures2 from '../images/catImageFinder2'

const mockFetch = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', mockFetch)

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  mockFetch.mockReset()
  vi.spyOn(console, 'log').mockImplementation(() => { })
  vi.spyOn(console, 'error').mockImplementation(() => { })
})

///Imgur finder
describe('catImageFinder (Imgur)', () => {
  it('Calls the Imgur search with the public client id', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: [] }))

    await getCatPictures()

    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toContain('https://api.imgur.com/3/gallery/search')
    expect(url).toContain('q=cats')
    expect(options.headers.Authorization).toMatch(/^Client-ID /)
  })

  it('Returns the links of the single images', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ data: [{ link: 'https://i.imgur.com/a.jpg' }, { link: 'https://i.imgur.com/b.png' }] })
    )

    expect(await getCatPictures()).toEqual(['https://i.imgur.com/a.jpg', 'https://i.imgur.com/b.png'])
  })

  it('Returns the images of the albums', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        data: [
          { is_album: true, images: [{ link: 'https://i.imgur.com/c.jpeg' }, { link: 'https://i.imgur.com/d.gif' }] },
          { link: 'https://i.imgur.com/e.JPG' }
        ]
      })
    )

    expect(await getCatPictures()).toEqual([
      'https://i.imgur.com/c.jpeg',
      'https://i.imgur.com/d.gif',
      'https://i.imgur.com/e.JPG'
    ])
  })

  it('Skips the links which are not images', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        data: [
          { link: 'https://imgur.com/gallery/abc' },
          { link: 'https://i.imgur.com/video.mp4' },
          { link: 'https://i.imgur.com/ok.png' },
          { is_album: true, images: [{ link: 'https://i.imgur.com/clip.gifv' }, {}] },
          {}
        ]
      })
    )

    expect(await getCatPictures()).toEqual(['https://i.imgur.com/ok.png'])
  })

  it('Returns an empty list if there is no data', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}))

    expect(await getCatPictures()).toEqual([])
  })

  it('Returns an empty list if the data is not an array', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: 'nope' }))

    expect(await getCatPictures()).toEqual([])
  })

  it('Returns an empty list if the API answers with an error', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: { error: 'rate limit' } }, 429))

    expect(await getCatPictures()).toEqual([])
  })

  it('Returns an empty list if the network fails', async () => {
    mockFetch.mockRejectedValue(new Error('network down'))

    expect(await getCatPictures()).toEqual([])
  })
})

///TheCatAPI finder
describe('catImageFinder2 (TheCatAPI)', () => {
  it('Calls TheCatAPI with the api key', async () => {
    vi.stubEnv('CAT_API_KEY', 'cat-key')
    mockFetch.mockResolvedValue(jsonResponse([]))

    await getCatPictures2()

    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toBe('https://api.thecatapi.com/v1/images/search?limit=66')
    expect(options.headers['x-api-key']).toBe('cat-key')
  })

  it('Still calls the API with an empty key if there is no api key', async () => {
    vi.stubEnv('CAT_API_KEY', '')
    mockFetch.mockResolvedValue(jsonResponse([]))

    await getCatPictures2()

    expect(mockFetch.mock.calls[0]![1].headers['x-api-key']).toBe('')
  })

  it('Returns the urls of the images', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse([{ url: 'https://cdn2.thecatapi.com/images/a.jpg' }, { url: 'https://cdn2.thecatapi.com/images/b.png' }])
    )

    expect(await getCatPictures2()).toEqual([
      'https://cdn2.thecatapi.com/images/a.jpg',
      'https://cdn2.thecatapi.com/images/b.png'
    ])
  })

  it('Skips the items without a url', async () => {
    mockFetch.mockResolvedValue(jsonResponse([{ id: 'x' }, { url: 'https://cdn2.thecatapi.com/images/a.jpg' }]))

    expect(await getCatPictures2()).toEqual(['https://cdn2.thecatapi.com/images/a.jpg'])
  })

  it('Returns an empty list if the answer is not an array', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'nope' }))

    expect(await getCatPictures2()).toEqual([])
  })

  it('Returns an empty list if the API answers with an error', async () => {
    mockFetch.mockResolvedValue(jsonResponse([], 401))

    expect(await getCatPictures2()).toEqual([])
  })

  it('Returns an empty list if the network fails', async () => {
    mockFetch.mockRejectedValue(new Error('network down'))

    expect(await getCatPictures2()).toEqual([])
  })
})
