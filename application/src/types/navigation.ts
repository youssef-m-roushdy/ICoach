export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Login: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
};

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
