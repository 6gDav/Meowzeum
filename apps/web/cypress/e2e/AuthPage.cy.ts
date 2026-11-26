describe('Auth page tabs', () => {
    const loginTab = '[role="tab"]:contains("Login")'
    const registrationTab = '[role="tab"]:contains("Registration")'

    // the tabs work only after the page is hydrated, so we click until the tab is selected
    const selectTab = (tab: string, attempts = 10) => {
        cy.get(tab).click()
        cy.get(tab).then(($tab) => {
            if ($tab.attr('aria-selected') === 'true' || attempts <= 1) {
                return
            }
            cy.wait(300)
            selectTab(tab, attempts - 1)
        })
    }

    it('opens on the login tab by default', () => {
        cy.visit('/pages/auth')

        cy.get('h1').should('have.text', 'Welcome back (Mraaa)')
        cy.contains('p', 'Enter your credentials to access Meowzeum').should('be.visible')
        cy.get(loginTab).should('have.attr', 'aria-selected', 'true')
        cy.get(registrationTab).should('have.attr', 'aria-selected', 'false')
        cy.get('section[role="login"]').should('be.visible')
        cy.get('section[role="registration"]').should('not.exist')
    })

    it('has a tablist with two tabs', () => {
        cy.visit('/pages/auth')

        cy.get('[role="tablist"] [role="tab"]').should('have.length', 2)
    })

    it('opens on the registration tab with the #registration hash', () => {
        cy.visit('/pages/auth#registration')

        cy.get('h1').should('have.text', 'Create your account (Meow)')
        cy.contains('p', 'Join Meowzeum to get started today').should('be.visible')
        cy.get(registrationTab).should('have.attr', 'aria-selected', 'true')
        cy.get('section[role="registration"]').should('be.visible')
        cy.get('section[role="login"]').should('not.exist')
    })

    it('opens on the login tab with the #login hash', () => {
        cy.visit('/pages/auth#login')

        cy.get(loginTab).should('have.attr', 'aria-selected', 'true')
    })

    it('opens on the login tab with an unknown hash', () => {
        cy.visit('/pages/auth#something-else')

        cy.get(loginTab).should('have.attr', 'aria-selected', 'true')
        cy.get('section[role="login"]').should('be.visible')
    })

    it('switches to registration and back', () => {
        cy.visit('/pages/auth')
        cy.get('section[role="login"]').should('be.visible')

        selectTab(registrationTab)
        cy.get('h1').should('have.text', 'Create your account (Meow)')
        cy.location('hash').should('eq', '#registration')
        cy.get('section[role="registration"]').should('be.visible')

        selectTab(loginTab)
        cy.get('h1').should('have.text', 'Welcome back (Mraaa)')
        cy.location('hash').should('eq', '#login')
        cy.get('section[role="login"]').should('be.visible')
    })

    it('stays on the auth page when the tab is changed', () => {
        cy.visit('/pages/auth')
        cy.get('section[role="login"]').should('be.visible')

        selectTab(registrationTab)

        cy.location('pathname').should('eq', '/pages/auth')
    })

    it('goes back to the previous tab with the browser back button', () => {
        cy.visit('/pages/auth')
        cy.get('section[role="login"]').should('be.visible')

        selectTab(registrationTab)
        cy.location('hash').should('eq', '#registration')
        cy.go('back')

        cy.get(loginTab).should('have.attr', 'aria-selected', 'true')
    })
})
