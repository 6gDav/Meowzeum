describe('Footer', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('shows the cat image', () => {
        cy.get('footer img[alt="cat-image"]').should('exist')
    })

    it('shows the section titles', () => {
        cy.get('footer').within(() => {
            cy.contains('h6', 'Services').should('exist')
            cy.contains('h6', 'Programming Tools').should('exist')
            cy.contains('h6', 'Licence').should('exist')
        })
    })

    it('shows the links of the sections', () => {
        cy.get('footer').within(() => {
            cy.contains('a', 'Frontend Code').should('exist')
            cy.contains('a', 'Backend Code').should('exist')
            cy.contains('a', 'Read Documentation Here').should('exist')
            cy.contains('a', 'Design (Tailwind CSS)').should('exist')
            cy.contains('a', 'Design (CSS)').should('exist')
            cy.contains('a', 'Framework (React)').should('exist')
            cy.contains('a', 'MIT (Licence)').should('exist')
        })
    })

    it('the team link opens the GitHub profile in a new tab safely', () => {
        cy.contains('footer a', 'Meowzeum team')
            .should('have.attr', 'href', 'https://github.com/6gDav')
            .and('have.attr', 'target', '_blank')
            .and('have.attr', 'rel')
            .and('include', 'noreferrer')
    })

    it('is on the bottom of every page', () => {
        cy.visit('/pages/gallery')
        cy.get('footer').should('exist')

        cy.visit('/pages/auth')
        cy.get('footer').should('exist')

        cy.visit('/this-page-does-not-exist', { failOnStatusCode: false })
        cy.get('footer').should('exist')
    })
})
