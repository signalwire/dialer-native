export type RootStackParamList = {
  Welcome: undefined;
  Dialer: undefined;
  Call: {
    phoneNumber?: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
