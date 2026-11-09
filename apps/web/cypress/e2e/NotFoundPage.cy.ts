describe('404 (NotFound) catcher page', () => {
  it('NotFound page apare and navigate back to the main page', () => {
    cy.visit('http://localhost:3000/mock-test', { failOnStatusCode: false });

    cy.contains('h1', '404 - Page Not Found').should('be.visible');
    cy.contains('p', "The route doesn't exist.").should('be.visible');

    cy.contains('a', 'Back to the main page.').click();
    cy.url().should('eq', 'http://localhost:3000/');
  });
});
