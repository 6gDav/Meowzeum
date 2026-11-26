describe('Home page', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('renders the welcome heading and the short description', () => {
        cy.get('main h1').should('contain.text', 'Welcome to the').and('contain.text', 'Meowzeum')
        cy.contains('p', 'A little corner of the internet for cats').should('be.visible')
        cy.contains('p', 'Take a moment, meet a few lovely cats, and find your new favorite.').should('be.visible')
    })

    it('shows the cat illustration', () => {
        cy.get('main svg[aria-hidden="true"]').first().should('be.visible')
    })

    it('has the main action links', () => {
        cy.contains('main a', 'Visit the Gallery').should('have.attr', 'href', '/pages/gallery')
        cy.contains('main a', 'Join the Meowzeum').should('have.attr', 'href', '/pages/auth')
    })

    it('Visit the Gallery opens the gallery page', () => {
        cy.contains('main a', 'Visit the Gallery').click()

        cy.location('pathname').should('eq', '/pages/gallery')
        cy.contains('Your featured cat goes here').should('be.visible')
    })

    it('Join the Meowzeum opens the auth page', () => {
        cy.contains('main a', 'Join the Meowzeum').click()

        cy.location('pathname').should('eq', '/pages/auth')
        cy.get('section[role="login"]').should('be.visible')
    })

    it('the Browse the gallery card opens the gallery page', () => {
        cy.contains('main a', 'Browse the gallery').should('contain.text', 'A growing collection of cats').click()

        cy.location('pathname').should('eq', '/pages/gallery')
    })

    it('the Use the API card opens in a new tab safely', () => {
        cy.contains('main a', 'Use the API')
            .should('contain.text', 'Fetch Meowzeum cats in your own projects.')
            .and('have.attr', 'target', '_blank')
            .and('have.attr', 'rel')
            .and('include', 'noreferrer')
    })

    it('shows the header and the footer', () => {
        cy.get('header').should('be.visible')
        cy.get('footer').should('exist')
    })

    it('does not show the error page without the triggerError parameter', () => {
        cy.contains('h1', 'Ops... Error occured').should('not.exist')
    })
})
