describe('Gallery page', () => {
    beforeEach(() => {
        cy.visit('/pages/gallery')
    })

    it('renders the featured cat placeholder', () => {
        cy.get('[role="img"][aria-label="Placeholder for a featured cat image"]').should('be.visible')
        cy.contains('Your featured cat goes here').should('be.visible')
        cy.contains('A lovely photo will make this space its home.').should('be.visible')
        cy.contains('Featured').should('be.visible')
        cy.contains('01 / 12').should('be.visible')
    })

    it('has the collection section', () => {
        cy.get('section#collection').should('exist')
    })

    it('shows the invitation text', () => {
        cy.contains('p', 'A cozy collection, made for cat people.').should('be.visible')
    })

    it('Join the Meowzeum opens the registration/login page', () => {
        cy.contains('a', 'Join the Meowzeum').should('have.attr', 'href', '/pages/auth').click()

        cy.location('pathname').should('eq', '/pages/auth')
    })

    it('the About link in the header scrolls to the about part of the page', () => {
        cy.contains('header nav a', 'About').click()

        cy.location('hash').should('eq', '#about')
        cy.get('#about').should('exist')
    })

    it('has the header and the footer', () => {
        cy.get('header').should('be.visible')
        cy.get('footer').should('exist')
    })
})
