import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RegisterScreen } from './src/screens/RegisterScreen';

// 1. Importar as Telas
// Assumindo que você criou a LoginScreen e a RegisterScreen 
// import { LoginScreen } from './screens/LoginScreen'; 

// 2. Configuração do Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();

// 3. Tema Customizado do React Native Paper (Opcional, mas recomendado)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db', // Seu azul primário
    accent: '#f1c40f',  // Amarelo para destaque/alerta
    error: '#e74c3c',   // Vermelho para erros
    background: '#f7f7f7', // Fundo mais suave
  },
};

// 4. Componente Principal
export default function App() {
  return (
    // PaperProvider envolve toda a aplicação para fornecer o tema
    <PaperProvider theme={theme}>
      {/* NavigationContainer gerencia o estado de navegação */}
      <NavigationContainer>
        {/* Stack.Navigator define a estrutura de navegação */}
        <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Register" component={RegisterScreen} />
          {/* Você precisará criar a LoginScreen */}
          {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
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