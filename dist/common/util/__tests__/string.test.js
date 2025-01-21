"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("src/constants");
const string_1 = require("../string");
// @ts-ignore
const bun_test_1 = require("bun:test");
(0, bun_test_1.describe)('replaceNonStandardPlaceholderComments', () => {
    (0, bun_test_1.it)('should replace C-style comments', () => {
        const input = `
function example() {
  // ... some code ...
  console.log('Hello');
  // ... rest of the function ...
}
`;
        const expected = `
function example() {
  ${constants_1.EXISTING_CODE_MARKER}
  console.log('Hello');
  ${constants_1.EXISTING_CODE_MARKER}
}
`;
        (0, bun_test_1.expect)((0, string_1.replaceNonStandardPlaceholderComments)(input, constants_1.EXISTING_CODE_MARKER)).toBe(expected);
    });
    (0, bun_test_1.it)('should replace multi-line C-style comments', () => {
        const input = `
function example() {
  /* ... some code ... */
  console.log('Hello');
  /* ... rest of the function ... */
}
`;
        const expected = `
function example() {
  ${constants_1.EXISTING_CODE_MARKER}
  console.log('Hello');
  ${constants_1.EXISTING_CODE_MARKER}
}
`;
        (0, bun_test_1.expect)((0, string_1.replaceNonStandardPlaceholderComments)(input, constants_1.EXISTING_CODE_MARKER)).toBe(expected);
    });
    (0, bun_test_1.it)('should replace Python-style comments', () => {
        const input = `
def example():
    # ... some code ...
    print('Hello')
    # ... rest of the function ...
`;
        const expected = `
def example():
    ${constants_1.EXISTING_CODE_MARKER}
    print('Hello')
    ${constants_1.EXISTING_CODE_MARKER}
`;
        (0, bun_test_1.expect)((0, string_1.replaceNonStandardPlaceholderComments)(input, constants_1.EXISTING_CODE_MARKER)).toBe(expected);
    });
    (0, bun_test_1.it)('should replace JSX comments', () => {
        const input = `
function Example() {
  return (
    <div>
      {/* ... existing code ... */}
      <p>Hello, World!</p>
      {/* ...rest of component... */}
    </div>
  );
}
`;
        const expected = `
function Example() {
  return (
    <div>
      ${constants_1.EXISTING_CODE_MARKER}
      <p>Hello, World!</p>
      ${constants_1.EXISTING_CODE_MARKER}
    </div>
  );
}
`;
        (0, bun_test_1.expect)((0, string_1.replaceNonStandardPlaceholderComments)(input, constants_1.EXISTING_CODE_MARKER)).toBe(expected);
    });
});
//# sourceMappingURL=string.test.js.map