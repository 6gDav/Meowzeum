describe('Cat which watches the cursor', () => {
    const cat = 'main svg[aria-hidden="true"]'
    const leftPupil = `${cat} > g`
    const MAX_PUPIL_DISTANCE = 18
    const MAX_HEAD_TILT = 8

    const offsetOf = (transform: string | undefined) => {
        const match = /translate\(\s*(-?[\d.e-]+)\s*,\s*(-?[\d.e-]+)\s*\)/.exec(transform ?? '')
        return { x: Number(match?.[1] ?? NaN), y: Number(match?.[2] ?? NaN) }
    }

    const moveMouse = (clientX: number, clientY: number) => {
        cy.window().then((win) => {
            win.dispatchEvent(new win.MouseEvent('mousemove', { clientX, clientY }))
        })
    }

    // the listener is added only after the page is hydrated, so we move until the pupil reacts
    const moveUntilPupilMoves = (clientX: number, clientY: number, attempts = 10) => {
        moveMouse(clientX, clientY)
        cy.get(leftPupil).eq(0).invoke('attr', 'transform').then((transform) => {
            const { x, y } = offsetOf(transform)
            if (x !== 0 || y !== 0 || attempts <= 1) {
                return
            }
            cy.wait(300)
            moveUntilPupilMoves(clientX, clientY, attempts - 1)
        })
    }

    beforeEach(() => {
        cy.viewport(1280, 800)
        cy.visit('/')
        cy.get(cat).should('be.visible')
    })

    it('starts with the pupils in the middle', () => {
        cy.get(leftPupil).eq(0).should('have.attr', 'transform', 'translate(0, 0)')
        cy.get(leftPupil).eq(1).should('have.attr', 'transform', 'translate(0, 0)')
    })

    it('has two eyes with two pupils', () => {
        cy.get(`${cat} ellipse[rx="14"][ry="24"]`).should('have.length', 2)
    })

    it('moves both pupils to the right if the cursor is on the right', () => {
        moveUntilPupilMoves(1250, 400)

        cy.get(leftPupil).eq(0).invoke('attr', 'transform').then((t) => expect(offsetOf(t).x).to.be.greaterThan(0))
        cy.get(leftPupil).eq(1).invoke('attr', 'transform').then((t) => expect(offsetOf(t).x).to.be.greaterThan(0))
    })

    it('moves both pupils to the left if the cursor is on the left', () => {
        moveUntilPupilMoves(5, 400)

        cy.get(leftPupil).eq(0).invoke('attr', 'transform').then((t) => expect(offsetOf(t).x).to.be.lessThan(0))
        cy.get(leftPupil).eq(1).invoke('attr', 'transform').then((t) => expect(offsetOf(t).x).to.be.lessThan(0))
    })

    it('moves the pupils down if the cursor is under the cat', () => {
        cy.get(cat).then(($svg) => {
            const rect = $svg[0].getBoundingClientRect()
            moveUntilPupilMoves(rect.left + rect.width / 2, rect.bottom + 300)
        })

        cy.get(leftPupil).eq(0).invoke('attr', 'transform').then((t) => expect(offsetOf(t).y).to.be.greaterThan(0))
    })

    it('does not move the pupils out of the eyes', () => {
        moveUntilPupilMoves(1270, 790)

        for (const index of [0, 1]) {
            cy.get(leftPupil).eq(index).invoke('attr', 'transform').then((t) => {
                const { x, y } = offsetOf(t)
                expect(Math.hypot(x, y)).to.be.at.most(MAX_PUPIL_DISTANCE + 0.001)
            })
        }
    })

    it('moves the nose a little with the cursor but not too much', () => {
        moveUntilPupilMoves(1270, 790)

        cy.get(leftPupil).eq(2).invoke('attr', 'transform').then((t) => {
            const { x, y } = offsetOf(t)
            expect(Math.abs(x)).to.be.at.most(MAX_HEAD_TILT)
            expect(Math.abs(y)).to.be.at.most(MAX_HEAD_TILT)
        })
    })

    it('follows the cursor again after it was moved to another side', () => {
        moveUntilPupilMoves(1250, 400)
        moveMouse(5, 400)

        cy.get(leftPupil).eq(0).invoke('attr', 'transform').should((t) => {
            expect(offsetOf(t as string | undefined).x).to.be.lessThan(0)
        })
    })
})
