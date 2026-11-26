import './mockEnv'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendEmail } from '../auth/helper/sendEmail'
import { emilSendTime } from '../auth/helper/getCurretnTime'

const mockFetch = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', mockFetch)

afterEach(() => {
  mockFetch.mockReset()
  vi.useRealTimers()
})

const email = { to: 'jane@doe.com', name: 'Jane Doe', title: 'Hello', message: 'Hi there' }

///sendEmail
describe('sendEmail', () => {
  it('Posts to the EmailJS endpoint', async () => {
    mockFetch.mockResolvedValue(new Response('OK'))

    await sendEmail(email)

    const [url, options] = mockFetch.mock.calls[0]!
    expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send')
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('Sends the keys from the environment and the email data', async () => {
    mockFetch.mockResolvedValue(new Response('OK'))

    await sendEmail(email)

    expect(JSON.parse(mockFetch.mock.calls[0]![1].body)).toEqual({
      service_id: 'service-id',
      template_id: 'template-id',
      user_id: 'public-key',
      accessToken: 'private-key',
      template_params: { to_email: 'jane@doe.com', from_name: 'Jane Doe', title: 'Hello', message: 'Hi there' }
    })
  })

  it('Uses the given template id instead of the default', async () => {
    mockFetch.mockResolvedValue(new Response('OK'))

    await sendEmail({ ...email, templateId: 'custom-template' })

    expect(JSON.parse(mockFetch.mock.calls[0]![1].body).template_id).toBe('custom-template')
  })

  it('Throws with the status and the text if EmailJS fails', async () => {
    mockFetch.mockResolvedValue(new Response('Bad template', { status: 400 }))

    await expect(sendEmail(email)).rejects.toThrow('EmailJS error 400: Bad template')
  })

  it('Throws if the network fails', async () => {
    mockFetch.mockRejectedValue(new Error('network down'))

    await expect(sendEmail(email)).rejects.toThrow('network down')
  })
})

///emilSendTime
describe('emilSendTime', () => {
  it('Formats the time in Budapest time zone', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T10:30:00Z'))

    expect(emilSendTime()).toBe('15 Jan 2026, 11:30')
  })

  it('Handles the summer time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T10:30:00Z'))

    expect(emilSendTime()).toBe('15 Jul 2026, 12:30')
  })

  it('Gives the current time on every call, not the time of the server start', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T10:30:00Z'))
    const first = emilSendTime()

    vi.setSystemTime(new Date('2026-01-15T12:45:00Z'))

    expect(emilSendTime()).not.toBe(first)
    expect(emilSendTime()).toBe('15 Jan 2026, 13:45')
  })
})
