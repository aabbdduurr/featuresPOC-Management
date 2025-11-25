import '@testing-library/jest-dom';

global.fetch = jest.fn();

Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

afterEach(() => {
  jest.clearAllMocks();
  (fetch as jest.Mock).mockClear();
});
