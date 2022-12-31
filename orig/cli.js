import { getState } from "./state.js";

export function cli(args) {
    console.log(args);

    // retrieve state
    const currentState = getState();
    console.log(currentState);
    if ('sending' !== currentState)
        process.exit(1);
}