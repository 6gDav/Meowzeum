describe('Profile page without a session', () => {
    it('sends the visitor to the auth page', () => {
        cy.visit('/pages/profile')

        cy.location('pathname').should('eq', '/pages/auth')
        cy.get('section[role="login"]').should('be.visible')
    })

    it('does not show the account form', () => {
        cy.visit('/pages/profile')

        cy.get('[data-testid="manage-user-page"]').should('not.exist')
        cy.contains('h1', 'Manage account').should('not.exist')
    })

    it('does not show the profile button in the header', () => {
        cy.visit('/pages/profile')

        cy.get('[data-testid="header-profile-button"]').should('not.exist')
    })
})
