import { useReducer } from "react";

export type ClaimState = "IDLE" | "LOADING" | "READY" | "EMPTY" | "CLAIMING" | "SUCCESS" | "ERROR";

export interface ClaimMachine {
  state: ClaimState;
  error?: string;
}

type Action =
  | { type: "SET_LOADING" }
  | { type: "SET_READY" }
  | { type: "SET_EMPTY" }
  | { type: "SET_ERROR"; error: string }
  | { type: "START_CLAIM" }
  | { type: "CLAIM_SUCCESS" }
  | { type: "CLAIM_ERROR"; error: string }
  | { type: "RESET" };

export const initialClaimMachine: ClaimMachine = { state: "IDLE" };

function reducer(state: ClaimMachine, action: Action): ClaimMachine {
  switch (action.type) {
    case "SET_LOADING":
      return { state: "LOADING" };
    case "SET_READY":
      return { state: "READY" };
    case "SET_EMPTY":
      return { state: "EMPTY" };
    case "SET_ERROR":
      return { state: "ERROR", error: action.error };
    case "START_CLAIM":
      return { state: "CLAIMING" };
    case "CLAIM_SUCCESS":
      return { state: "SUCCESS" };
    case "CLAIM_ERROR":
      return { state: "ERROR", error: action.error };
    case "RESET":
      return { state: "IDLE" };
    default:
      return state;
  }
}

export function useClaimMachine() {
  const [machine, dispatch] = useReducer(reducer, initialClaimMachine);
  return { machine, dispatch };
}
