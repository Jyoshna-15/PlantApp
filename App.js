


import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home_Screen from './Screens/Home';
import Input_Screen from './Screens/Input';
import Results_Screen from './Screens/Results';
import Profile from './Screens/Profile'
import Calender from './Screens/calender'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>{/* screenOptions={{headerShown:false}}*/ }
        <Stack.Screen name="🏠 Home" component={Home_Screen}/>
        <Stack.Screen name="Input" component={Input_Screen}/>
        <Stack.Screen name="Results" component={Results_Screen}/>
        <Stack.Screen name="Profile" component={Profile}/>
        <Stack.Screen name="Calender" component={Calender}/>



      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});
