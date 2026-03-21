import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TabBar from '../../components/TabBar';
import designSystem from '../../context/design_system.json';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <TabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{
        lazy: true,
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <MaterialTopTabs.Screen
        name="community"
        options={{
          title: 'Community',
        }}
      />
      <MaterialTopTabs.Screen
        name="learn"
        options={{
          title: 'Learn',
        }}
      />
      <MaterialTopTabs.Screen
        name="actions"
        options={{
          title: 'Actions',
        }}
      />
      <MaterialTopTabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </MaterialTopTabs>
  );
}
