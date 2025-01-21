export declare const removeUndefinedProps: <T extends object>(obj: T) => T;
export declare const removeNullOrUndefinedProps: <T extends object>(obj: T, exceptions?: string[]) => T;
export declare const addObjects: <T extends {
    [key: string]: number;
}>(obj1: T, obj2: T) => T;
export declare const subtractObjects: <T extends {
    [key: string]: number;
}>(obj1: T, obj2: T) => T;
export declare const hasChanges: <T extends object>(obj: T, partial: Partial<T>) => boolean;
export declare const hasSignificantDeepChanges: <T extends object>(obj: T, partial: Partial<T>, epsilonForNumbers: number) => boolean;
export declare const filterObject: <T extends object>(obj: T, predicate: (value: any, key: keyof T) => boolean) => { [P in keyof T]: T[P]; };
/**
 * Asserts that a condition is true. If the condition is false, it throws an error with the provided message.
 * @param condition The condition to check
 * @param message The error message to display if the condition is false
 * @throws {Error} If the condition is false
 */
export declare function assert(condition: boolean, message: string): asserts condition;
