import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ValidateCodeScreen } from './src/screens/ValidateCodeScreen';
import { ValidateEmailCodeScreen } from './src/screens/ValidateEmailCodeScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { colors } from './src/theme/colors';

// Configuração do Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ValidateCode: { email: string };
  ValidateEmailCode: { newEmail: string };
  ResetPassword: { token: string };
  Profile: { userId: number };
  EditProfile: { profile: any };
};
const Stack = createStackNavigator<RootStackParamList>();

// Tema Customizado do React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    onPrimary: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onBackground: colors.onBackground,
    onSurface: colors.onSurface,
  },
};

// Componente Principal
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ValidateCode" component={ValidateCodeScreen} />
          <Stack.Screen name="ValidateEmailCode" component={ValidateEmailCodeScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}

// O StyleSheet é mantido para qualquer estilo global, mas será menos usado com Paper
const styles = StyleSheet.create({
  // Manter o estilo container é opcional aqui, pois PaperProvider lida com o fundo
  container: {
    flex: 1,
  },
});