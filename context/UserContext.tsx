import React, { createContext, useReducer } from "react";

type UserWithData = {
  uid: string;
  name: string;
  email: string;
};

export type UserData = UserWithData | null;

export enum UserContextActionTypes {
  SetUser,
}

export interface SetUser {
  type: UserContextActionTypes.SetUser;
  payload: UserData;
}
export type UserContextAction = SetUser;

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
    case UserContextActionTypes.SetUser:
      return { user: action.payload };
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

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
