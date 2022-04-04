import React, { createContext, useReducer } from "react";
import { auth } from "../lib/firebase";

type UserWithData = {
  uid: string;
  name: string;
  email: string;
};

export type UserData = UserWithData | null;

export enum UserContextActionTypes {
  SignIn,
  SignOut,
}

export interface SignIn {
  type: UserContextActionTypes.SignIn;
  payload: UserData;
}

export interface SignOut {
  type: UserContextActionTypes.SignOut;
}

export type UserContextAction = SignIn | SignOut;

export type UserContextState = {
  user: UserData;
};

const INITIAL_STATE: UserContextState = {
  user: null,
};

const userContextReducer = (
  state: UserContextState,
  action: UserContextAction
) => {
  switch (action.type) {
    case UserContextActionTypes.SignIn:
      return { user: action.payload };
    case UserContextActionTypes.SignOut:
      console.log("signing out!");
      auth.signOut();
      return { user: null };
    default:
      throw new Error(`Unhandled action ${action}`);
  }
};

export const UserContext = createContext<{
  state: UserContextState;
  dispatch: React.Dispatch<UserContextAction>;
}>({
  state: INITIAL_STATE,
  dispatch: () => undefined,
});

const UserContextProvider = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(userContextReducer, INITIAL_STATE);
  console.log('IN USERCONTEXT.TS')
  console.log({ currentUser: auth.currentUser });
  console.log(!!auth.currentUser);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
