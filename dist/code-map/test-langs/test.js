"use strict";
// Class implementation
class Greeting {
    prefix;
    constructor(prefix) {
        this.prefix = prefix;
    }
    greet(name) {
        return `${this.prefix}, ${name}!`;
    }
    // Static method
    static printGreeting(greeter, name) {
        console.log(greeter.greet(name));
    }
}
// Function
function createGreeter(prefix) {
    return new Greeting(prefix);
}
// Main execution
const greeting = createGreeter('Hello');
Greeting.printGreeting(greeting, 'World');
//# sourceMappingURL=test.js.map