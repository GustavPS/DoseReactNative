/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainServer } from './src/screens/setup/MainServerOld';
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
import { ContentServerSetup } from './src/screens/setup/ContentServerSetup';
import { Player } from './src/screens/Player';
import { MovieInfo } from './src/screens/info/MovieInfo';
import { Initial } from './src/screens/Initial';
import { ShowInfo } from './src/screens/info/ShowInfo';
import { SeasonInfo } from './src/screens/info/SeasonInfo';
import { Genre } from './src/screens/Genre';

const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = true; //useColorScheme() === 'dark';
  const [signedIn, setSignedIn] = React.useState(false);

  const backgroundStyle = {
    backgroundColor: Colors.darker
  };


  return (
    <NavigationContainer style={{ backgroundColor: Colors.darker }}>
      <Stack.Navigator
        initialRouteName="Initial"
        screenOptions={{
          cardStyle: backgroundStyle,
          headerStyle: { elevation: 0 },
          unmountOnBlur: true,
        }}
        unmountOnBlur={true}
      >
        <Stack.Screen
          name="Initial"
          component={Initial}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MainServer"
          component={MainServer}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MovieInfo"
          component={MovieInfo}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ShowInfo"
          component={ShowInfo}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SeasonInfo"
          component={SeasonInfo}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Player"
          component={Player}
          options={{
            headerShown: false
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
        <Stack.Screen
          name="Genre"
          component={Genre}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer >
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
