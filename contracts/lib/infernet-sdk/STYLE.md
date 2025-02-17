# Solidity Style Guide

Generally follows the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html) with a few exceptions.

By default, running `make format` will run the formatter forcing conformation to _most_ of the style guide.

## Custom rules, overrides

### Maximum line length

Ideally, each function argument should fall on its own line. For example:

```solidity
thisFunctionCallIsReallyLong(
    longArgument1,
    longArgument2,
    longArgument3
);
```

For the time-being, default `make format` line-breaking is acceptable for uniformity. This is based on a fixed line length of `120` characters instead.

### Imports

Sort imports by length.

```solidity
// Bad
import {Registry} from "./Registry.sol";
import {Token} from "./Token.sol";
import {BaseConsumer} from "./consumer/Base.sol";

// Good
import {Token} from "./Token.sol";
import {Registry} from "./Registry.sol";
import {BaseConsumer} from "./consumer/Base.sol";
```

### Section ordering

Ordering of sections in contract goes:

1. SPDX identifier
2. Imports
3. Public structs
4. Contract definition
5. Structs
6. Enums
7. Constants
8. Immutable variables
9. Mutable variables
10. Events
11. Errors
12. Modifiers
13. Constructor
14. Internal functions
15. External functions
16. Fallback function

Sections are delineated using headers generated from [transmissions11/headers](https://github.com/transmissions11/headers).

### Control structures

1. Always wrap `if` statements in closures
2. Do not use one-line statements

```solidity
// Bad
if (value == 0) return 1;

// Good
if (value == 0) {
    return 1;
}
```

### Function declaration

Always explitly return variables from functions.

```solidity
// Bad
function test() external returns (uint256 myVar) {
    myVar = 1;
}

// Good
function test() external returns (uint256) {
    myVar = 1;
    return myVar;
}
```

### Prefer least visibility, when possible

Prefer `private` > `internal` > `external` > `public`, to best discretion.

## General recommendations

### Naming

1. Prefer `camelCase`.
2. For constants, immutables, and values that should act as constants or immutables (in cases where you can't initialize as such, like tests), prefer `ALL_CAPS_CONSTANTS`.
3. Function names should start with imperative verbs
4. Functions with `internal` visibility should be prefixed with an underscore: `_internalFunction`. This is not necessary for variables

### Variables

1. Explicitly declare variable sizes (no `uint`)
2. Prefer smallest variable size by default (eg `uint32` for timestamp over `uint256`), unless in special cases where casting overhead is expensive or readability impact of switching is low
3. Declare in order `type visibility mutability name`, eg `address internal immutable myContractAddress`

### Constructor

1. Prefer typed contract inheritance (eg `Type myContract` over `address myContractAddress`)
2. Ignore (2) when setting up developer-facing interfaces. It's easier for developers to not have to worry about the initialization.

### Errors

Use custom errors.

### Events

1. Choose to emit events liberally.
2. Think through what data would be useful to index off-chain when determining event parameters.

### Assembly

1. Generally, avoid unless significant optimizations possible
2. Comment all memory layouts
3. Use only `memory-safe` assembly; mark assembly blocks as such

## Misc

1. Prefer two-step processes (`ownership` transfer, joining as a node) over one step to reduce chance for human error
