/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import type { Node } from 'react';
 import { NavigationContainer } from '@react-navigation/native';
 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 
 import { MainServer } from './src/screens/setup/MainServer';
 import { Main } from './src/screens/Main';
 
 import {
     SafeAreaView,
     ScrollView,
     StatusBar,
     StyleSheet,
     Text,
     useColorScheme,
     View,
 } from 'react-native';
 
 import {
     Colors,
     DebugInstructions,
     Header,
     LearnMoreLinks,
     ReloadInstructions,
 } from 'react-native/Libraries/NewAppScreen';
 import { Connect } from './src/screens/setup/Connect';
 import Token from './src/lib/Token';
import { ContentServerSetup } from './src/screens/setup/ContentServerSetup';
 
 const Stack = createNativeStackNavigator();
 
 const App: () => Node = () => {
     const isDarkMode = true; //useColorScheme() === 'dark';
     const [signedIn, setSignedIn] = React.useState(false);
 
     const backgroundStyle = {
         backgroundColor: Colors.darker
     };
 
     const token = new Token();

     Promise.all([token.isMainTokenValid(), token.isContentTokenValid()]).then(values => {
        setSignedIn(values[0] && values[1]);
    });

 
     return (
         <NavigationContainer style={{backgroundColor: Colors.darker}}>
             <Stack.Navigator
                 initialRouteName="MainServer"
                 screenOptions={{
                     cardStyle: backgroundStyle,
                     headerStyle: { elevation: 0 },
                 }}
             >
                 {signedIn && 
                     <Stack.Screen
                         name="Main"
                         component={Main}
                         options={{
                             headerShown: false
                         }}
                     />
                 }
                 {!signedIn &&
                 <>
                    <Stack.Screen
                        name="MainServer"
                        component={MainServer}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="Connect"
                        component={Connect}
                        options={{
                            headerShown: false
                        }}
                    />
                    <Stack.Screen
                        name="ContentServer"
                        component={ContentServerSetup}
                        options={{
                            headerShown: false
                        }}
                    />
                 </>
                 }
             </Stack.Navigator>
         </NavigationContainer>
     );
 };
 
 const styles = StyleSheet.create({
     sectionContainer: {
         marginTop: 32,
         paddingHorizontal: 24,
     },
     sectionTitle: {
         fontSize: 24,
         fontWeight: '600',
     },
     sectionDescription: {
         marginTop: 8,
         fontSize: 18,
         fontWeight: '400',
     },
     highlight: {
         fontWeight: '700',
     },
 });
 
 export default App;
 