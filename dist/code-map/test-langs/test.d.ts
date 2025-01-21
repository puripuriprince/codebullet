interface Greeter {
    greet(name: string): string;
}
declare class Greeting implements Greeter {
    private prefix;
    constructor(prefix: string);
    greet(name: string): string;
    static printGreeting(greeter: Greeter, name: string): void;
}
declare function createGreeter(prefix: string): Greeter;
declare const greeting: Greeter;
