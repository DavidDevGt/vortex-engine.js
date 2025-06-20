# VortexEngine Tests

This directory will contain unit tests and integration tests for VortexEngine.

## Structure

```
test/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests
├── fixtures/       # Test fixtures and mock data
└── helpers/        # Test utilities and helpers
```

## Running Tests

```bash
npm test
```

## Writing Tests

Tests should be written using a testing framework like Jest, Mocha, or similar.

Example test structure:

```javascript
describe('VortexEngine', () => {
  test('should create engine instance', () => {
    const app = VortexEngine.createEngine({ count: 0 });
    expect(app.state.count).toBe(0);
  });
});
```

## Test Coverage

Aim for comprehensive test coverage including:
- Core reactivity system
- Directive functionality
- Expression parsing
- Event handling
- State management
- Edge cases and error conditions
