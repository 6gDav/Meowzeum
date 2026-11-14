describe('Login form', () => {
    const login = 'section[role="login"]'
    const email = '#l-email'
    const pass = '#l-pass'
    const toggle = '#l-pass-toggle'


    const clickToggleUntil = (expectedType: 'text' | 'password', attempts = 10) => {
        cy.get(toggle).click()
        cy.get(pass).then(($input) => {
            if ($input.attr('type') === expectedType || attempts <= 1) {
                return
            }
            cy.wait(300)
            clickToggleUntil(expectedType, attempts - 1)
        })
    }
    const waitForHydration = () => {
        cy.get(login).should('be.visible')
        clickToggleUntil('text')
        cy.get(toggle).click()
        cy.get(pass).should('have.attr', 'type', 'password')
        cy.get(toggle).should('have.text', 'Show')
    }

    const submit = () => {
        cy.get(login).within(() => {
            cy.contains('button', 'Login').click()
        })
    }

    beforeEach(() => {
        cy.visit('/pages/auth')
        waitForHydration()
    })

    it('renders the email and password fields and a login button', () => {
        cy.get(login).within(() => {
            cy.get(email).should('have.attr', 'type', 'email')
            cy.get(pass).should('have.attr', 'type', 'password')
            cy.contains('button', 'Login').should('be.visible')
        })
    })

    it('toggles password visibility', () => {
        cy.get(pass).should('have.attr', 'type', 'password')
        cy.get(toggle).should('have.text', 'Show').click()
        cy.get(pass).should('have.attr', 'type', 'text')
        cy.get(toggle).should('have.text', 'Hide').click()
        cy.get(pass).should('have.attr', 'type', 'password')
    })

    it('keeps the typed password when toggling visibility', () => {
        cy.get(pass).type('secret123').should('have.value', 'secret123')
        cy.get(toggle).click()
        cy.get(pass).should('have.attr', 'type', 'text').and('have.value', 'secret123')
    })

    it('does not submit when fields are empty', () => {
        cy.get(email).then(($el) => {
            expect(($el[0] as HTMLInputElement).validity.valueMissing).to.be.true
        })
        cy.get(pass).then(($el) => {
            expect(($el[0] as HTMLInputElement).validity.valueMissing).to.be.true
        })

        submit()

        cy.get(email).should('match', ':invalid')
        cy.get(pass).should('match', ':invalid')
        cy.location('pathname').should('eq', '/pages/auth')
    })

    it('rejects a malformed email', () => {
        cy.get(email).type('not-an-email').should('have.value', 'not-an-email')
        cy.get(pass).type('secret123').should('have.value', 'secret123')

        submit()

        cy.get(email).should('match', ':invalid')
        cy.get(email).then(($el) => {
            expect(($el[0] as HTMLInputElement).validity.typeMismatch).to.be.true
        })
        cy.location('pathname').should('eq', '/pages/auth')
    })

    it('accepts a well-formed email', () => {
        cy.get(email).type('user@example.com').should('have.value', 'user@example.com')
        cy.get(pass).type('secret123').should('have.value', 'secret123')

        cy.get(email).should('match', ':valid')
        cy.get(pass).should('match', ':valid')
    })

    it('has a link to the registration form', () => {
        cy.contains('a', 'Create an account')
            .should('be.visible')
            .and('have.class', 'cursor-pointer')
    })
})
