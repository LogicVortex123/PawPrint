import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthParamList = {
  Login: undefined;
  Register: undefined;
};

export type PetsParamList = {
  PetList: undefined;
  PetForm: { localId?: string } | undefined;
};

export type HealthParamList = {
  HealthHome: undefined;
  VaccinationForm: undefined;
  WeightForm: undefined;
  DocumentForm: undefined;
};

export type AppointmentParamList = {
  AppointmentList: undefined;
  AppointmentForm: undefined;
};

export type TabParamList = {
  Home: undefined;
  Pets: NavigatorScreenParams<PetsParamList>;
  Health: NavigatorScreenParams<HealthParamList>;
  Appointments: NavigatorScreenParams<AppointmentParamList>;
  Profile: undefined;
};
