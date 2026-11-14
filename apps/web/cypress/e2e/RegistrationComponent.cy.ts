/// <reference types="cypress" />

const AUTH_PATH = '/pages/auth'

const FORM = 'section[role="registration"], [data-testid="registration-form"]'

const validUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    password: 'Str0ngP@ssw0rd!',
}

const fillForm = (overrides: Partial<typeof validUser & { passwordConfirm: string }> = {}) => {
    const data = { ...validUser, passwordConfirm: validUser.password, ...overrides }
    cy.get('#r-first').type(data.firstName)
    cy.get('#r-last').type(data.lastName)
    cy.get('#r-email').type(data.email)
    cy.get('#r-pass').type(data.password, { log: false })
    cy.get('#r-confirm').type(data.passwordConfirm, { log: false })
}

const switchToRegistration = (attempts = 10) => {
    const tabRegex = /register|registration|sign up|create account/i
    cy.get('body').then(($body) => {
        if ($body.find(FORM).length > 0 || attempts <= 1) {
            return
        }
        if ($body.find('[role="tab"]').length > 0) {
            cy.get('[role="tab"]').contains(tabRegex).click()
        } else {
            cy.contains('button, a', tabRegex).click()
        }
        cy.wait(300)
        switchToRegistration(attempts - 1)
    })
}

describe('Registration form', () => {
    beforeEach(() => {
        cy.visit(AUTH_PATH)

        switchToRegistration()

        cy.get(FORM).as('form').should('be.visible')
    })

    it('uses password inputs and the proper autocomplete attributes', () => {
        cy.get('#r-pass').should('have.attr', 'type', 'password').and('have.attr', 'autocomplete', 'new-password')
        cy.get('#r-confirm').should('have.attr', 'type', 'password').and('have.attr', 'autocomplete', 'new-password')
    })

    it('toggles password visibility independently for each field', () => {
        cy.get('#r-pass').type('secret123', { log: false })
        cy.get('#r-confirm').type('secret123', { log: false })

        cy.get('#r-pass-toggle').should('have.text', 'Show').click()
        cy.get('#r-pass').should('have.attr', 'type', 'text')
        cy.get('#r-pass-toggle').should('have.text', 'Hide')
        cy.get('#r-confirm').should('have.attr', 'type', 'password')

        cy.get('#r-confirm-toggle').click()
        cy.get('#r-confirm').should('have.attr', 'type', 'text')

        cy.get('#r-pass-toggle').click()
        cy.get('#r-pass').should('have.attr', 'type', 'password')
    })

    it('does not submit when required fields are empty', () => {
        cy.intercept('POST', '/_serverFn/**').as('register')
        cy.get('button[type="submit"]').click()

        cy.get('#r-first:invalid').should('exist')
        cy.get('@register.all').should('have.length', 0)
    })

    it('does not submit with an invalid email format', () => {
        cy.intercept('POST', '/_serverFn/**').as('register')
        fillForm({ email: 'not-an-email' })
        cy.get('button[type="submit"]').click()

        cy.get('#r-email:invalid').should('exist')
        cy.get('@register.all').should('have.length', 0)
    })

    it('submits the form data to the registration server function', () => {
        cy.intercept('POST', '/_serverFn/**', {
            statusCode: 200,
            body: { success: true },
        }).as('register')

        fillForm()
        cy.get('button[type="submit"]').click()

        cy.wait('@register').its('request.body').then((body) => {
            const payload = JSON.stringify(body)
            expect(payload).to.include(validUser.firstName)
            expect(payload).to.include(validUser.lastName)
            expect(payload).to.include(validUser.email)
        })
    })

    it('handles a server error without crashing', () => {
        cy.intercept('POST', '/_serverFn/**', {
            statusCode: 500,
            body: { message: 'Email already in use' },
        }).as('registerFail')

        fillForm()
        cy.get('button[type="submit"]').click()

        cy.wait('@registerFail')
        cy.get(FORM).should('be.visible')
    })

    it('switches to the login tab via the "Sign in" link', () => {
        cy.contains('a, button', /sign in/i).click()
        cy.get(FORM).should('not.exist')
    })
})
