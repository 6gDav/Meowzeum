describe('Header', () => {
    const menuButton = 'header button[aria-expanded]'
    const mobileMenu = 'header .space-y-1'

    const openMobileMenu = (attempts = 10) => {
        cy.get(menuButton).click()
        cy.get(menuButton).then(($button) => {
            if ($button.attr('aria-expanded') === 'true' || attempts <= 1) {
                return
            }
            cy.wait(300)
            openMobileMenu(attempts - 1)
        })
    }

    context('on desktop, logged out', () => {
        beforeEach(() => {
            cy.viewport(1280, 800)
            cy.visit('/pages/gallery')
        })

        it('shows the logo and the brand name', () => {
            cy.get('header img[alt="Meowzeum logo"]').should('be.visible')
            cy.contains('header a', 'Meowzeum').should('have.attr', 'href', '/')
        })

        it('shows the navigation links', () => {
            cy.get('header nav').within(() => {
                cy.contains('a', 'Home').should('be.visible')
                cy.contains('a', 'Features').should('be.visible')
                cy.contains('a', 'Pricing').should('be.visible')
                cy.contains('a', 'About').should('be.visible')
            })
        })

        it('Home goes to the main page', () => {
            cy.contains('header nav a', 'Home').click()

            cy.location('pathname').should('eq', '/')
        })

        it('the logo goes to the main page', () => {
            cy.contains('header a', 'Meowzeum').click()

            cy.location('pathname').should('eq', '/')
        })

        it('shows the Log in and Get Started links but not the profile button', () => {
            cy.contains('header a', 'Log in').should('be.visible')
            cy.contains('header a', 'Get Started').should('be.visible')
            cy.get('[data-testid="header-profile-button"]').should('not.exist')
        })

        it('Log in opens the login tab', () => {
            cy.contains('header a', 'Log in').click()

            cy.location('pathname').should('eq', '/pages/auth')
            cy.location('hash').should('eq', '#login')
            cy.get('[role="tab"][aria-selected="true"]').should('have.text', 'Login')
        })

        it('Get Started opens the registration tab', () => {
            cy.contains('header a', 'Get Started').click()

            cy.location('pathname').should('eq', '/pages/auth')
            cy.location('hash').should('eq', '#registration')
            cy.get('[role="tab"][aria-selected="true"]').should('have.text', 'Registration')
        })

        it('stays on the top while scrolling', () => {
            cy.get('header').should('have.css', 'position', 'sticky')
        })

        it('does not show the mobile menu button', () => {
            cy.get(menuButton).should('not.be.visible')
        })
    })

    context('on mobile, logged out', () => {
        beforeEach(() => {
            cy.viewport('iphone-6')
            cy.visit('/pages/gallery')
        })

        it('hides the desktop navigation and shows the menu button', () => {
            cy.get('header nav').should('not.be.visible')
            cy.get(menuButton).should('be.visible').and('have.attr', 'aria-expanded', 'false')
            cy.contains('header .sr-only', 'Open main menu').should('exist')
        })

        it('opens the menu with the links', () => {
            openMobileMenu()

            cy.get(menuButton).should('have.attr', 'aria-expanded', 'true')
            cy.get(mobileMenu).within(() => {
                cy.contains('a', 'Home').should('be.visible')
                cy.contains('a', 'Features').should('be.visible')
                cy.contains('a', 'Pricing').should('be.visible')
                cy.contains('a', 'About').should('be.visible')
                cy.contains('a', 'Log in').should('be.visible')
                cy.contains('a', 'Get Started').should('be.visible')
            })
        })

        it('closes the menu with the second click', () => {
            openMobileMenu()
            cy.get(menuButton).click()

            cy.get(menuButton).should('have.attr', 'aria-expanded', 'false')
            cy.get(mobileMenu).should('not.exist')
        })

        it('Home in the menu goes to the main page and closes the menu', () => {
            openMobileMenu()
            cy.get(mobileMenu).contains('a', 'Home').click()

            cy.location('pathname').should('eq', '/')
            cy.get(menuButton).should('have.attr', 'aria-expanded', 'false')
        })

        it('Log in in the menu opens the login tab', () => {
            openMobileMenu()
            cy.get(mobileMenu).contains('a', 'Log in').click()

            cy.location('pathname').should('eq', '/pages/auth')
            cy.location('hash').should('eq', '#login')
        })
    })
})
