export type TabsParamList = {
  index: undefined;
  'add-symptom': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabsParamList {}
  }
} 