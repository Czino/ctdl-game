import sinon from 'sinon'

// prepare tests if needed
const getElementById = global.document.getElementById
const FAKECanvasElement = {
  getContext: jest.fn(() => ({
    fillStyle: null,
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(),
    translate: () => {}
  })),
  style: {}
}

sinon.stub(global.document, 'getElementById')
  .callsFake(getElementById)
  .returns(FAKECanvasElement)