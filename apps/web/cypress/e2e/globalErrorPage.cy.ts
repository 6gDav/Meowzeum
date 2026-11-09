describe('GlobalErrorPage E2E test', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  it('shows the error page on error and navigates back with the Back to the main page link', () => {
    cy.visit('/?triggerError=true', { failOnStatusCode: false });

    cy.contains('h1', 'Ops... Error occured').should('be.visible');
    cy.contains('p', 'A test error occurred on the server!').should('be.visible');

    cy.contains('a', 'Back to the main page.').click();

    cy.location('search').should('eq', '');
    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains('h1', 'Ops... Error occured').should('not.exist');
  });

  it('clicking Retry reloads the page and clears the error', () => {
    cy.visit('/?triggerError=true', { failOnStatusCode: false });

    cy.contains('h1', 'Ops... Error occured').should('be.visible');
    cy.contains('p', 'A test error occurred on the server!').should('be.visible');

    cy.window().then((win) => {
      win.history.replaceState({}, '', '/');
    });

    cy.contains('button', 'Retry').click({ force: true });

    cy.contains('h1', 'Ops... Error occured').should('not.exist');
  });
});