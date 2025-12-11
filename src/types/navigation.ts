export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Dialer: undefined;
  Call: {
    phoneNumber?: string;
    contactName?: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
