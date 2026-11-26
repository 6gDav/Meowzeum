describe('Welcome page', () => {
    beforeEach(() => {
        cy.visit('/pages/welcomePage')
    })

    it('shows the membership badge and the greeting', () => {
        cy.contains('p', 'Membership confirmed').should('be.visible')
        cy.get('main h1').should('contain.text', "Glad you're here,")
    })

    it('shows the welcome cat image', () => {
        cy.get('img[alt="Welcome cat"]')
            .should('be.visible')
            .and(($img) => {
                expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
            })
    })

    it('Take me home goes to the main page', () => {
        cy.contains('main a', 'Take me home.').click()

        cy.location('pathname').should('eq', '/')
    })

    it('the Browse the gallery card opens the gallery page', () => {
        cy.contains('main a', 'Browse the gallery').click()

        cy.location('pathname').should('eq', '/pages/gallery')
    })

    it('the Use the API card opens in a new tab safely', () => {
        cy.contains('main a', 'Use the API')
            .should('have.attr', 'target', '_blank')
            .and('have.attr', 'rel')
            .and('include', 'noreferrer')
    })
})
