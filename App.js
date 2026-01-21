import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import SendSOSScreen from './screens/SendSOSScreen';
import ReliefCentersScreen from './screens/ReliefCentersScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AdminChatScreen from './screens/AdminChatScreen';
import AdminAnnouncementsScreen from './screens/AdminAnnouncementsScreen';
import React from 'react';
import { AnnouncementsProvider } from './context/AnnouncementsContext';
import { ThemeProvider, useTheme } from './theme';
import { TouchableOpacity } from 'react-native';
import DashboardScreen from './screens/DashboardScreen';
import SOSRequestScreen from './screens/SOSRequestScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminAnalyticsScreen from './screens/AdminAnalyticsScreen';
import UserChatScreen from './screens/UserChatScreen';
import { RequestsProvider } from './context/RequestsContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'dashboard',
            Announcements: 'campaign',
          };
          return <MaterialIcons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Announcements" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const map = {
            AdminHome: 'space-dashboard',
            Analytics: 'insights',
            Announcements: 'campaign',
          };
          return <MaterialIcons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Tab.Screen name="Analytics" component={AdminAnalyticsScreen} />
      <Tab.Screen name="Announcements" component={AdminAnnouncementsScreen} />
    </Tab.Navigator>
  );
}

function DashboardSwitch({ route }) {
  const role = route?.params?.role || 'User';
  return role === 'Admin' ? <AdminTabs /> : <UserTabs />;
}

function RootNavigation() {
  const { colors, mode, setMode } = useTheme();
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Disaster Relief SOS' }} />
        <Stack.Screen
          name="Dashboard"
          component={DashboardSwitch}
          options={({ navigation }) => ({
            title: 'Dashboard',
            headerShown: true,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')} style={{ paddingHorizontal: 8 }}>
                <MaterialIcons name={mode === 'dark' ? 'wb-sunny' : 'dark-mode'} size={22} color={colors.text} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ paddingHorizontal: 8 }}>
                <MaterialIcons name="logout" size={22} color={colors.text} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="SOSRequest" component={SOSRequestScreen} options={{ title: 'SOS Request' }} />
        <Stack.Screen name="UserChat" component={UserChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="SendSOS" component={SendSOSScreen} options={{ title: 'Send SOS' }} />
        <Stack.Screen name="ReliefCenters" component={ReliefCentersScreen} options={{ title: 'Relief Centers' }} />
        <Stack.Screen name="AdminChat" component={AdminChatScreen} options={{ title: 'Admin Chat (Demo)' }} />
        <Stack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} options={{ title: 'Announcements (Admin)' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AnnouncementsProvider>
        <RequestsProvider>
          <RootNavigation />
        </RequestsProvider>
      </AnnouncementsProvider>
    </ThemeProvider>
  );
}
