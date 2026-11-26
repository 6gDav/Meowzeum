import { describe, it, expect, vi, afterEach } from 'vitest'
import Expetion from '../exeptionMaker'

const setSearch = (search: string) => vi.stubGlobal('window', { location: { search } })

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe('Exception maker', () => {
    it('Throws the test error if the triggerError is true', () => {
        setSearch('?triggerError=true')

        expect(() => Expetion()).toThrow('A test error occurred on the server!')
    })

    it('Throws even if there are other query parameters', () => {
        setSearch('?page=2&triggerError=true')

        expect(() => Expetion()).toThrow()
    })

    it('Does not throw without a query parameter', () => {
        setSearch('')

        expect(() => Expetion()).not.toThrow()
    })

    it('Does not throw if the triggerError is not true', () => {
        setSearch('?triggerError=false')
        expect(() => Expetion()).not.toThrow()

        setSearch('?triggerError=TRUE')
        expect(() => Expetion()).not.toThrow()

        setSearch('?triggerError=')
        expect(() => Expetion()).not.toThrow()
    })

    it('Does not throw on the server (there is no window)', () => {
        vi.stubGlobal('window', undefined)

        expect(() => Expetion()).not.toThrow()
    })

    it('Does not throw in production', () => {
        vi.stubEnv('DEV', false)
        setSearch('?triggerError=true')

        expect(() => Expetion()).not.toThrow()
    })
})
