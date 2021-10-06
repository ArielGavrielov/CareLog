import * as Notifications from 'expo-notifications';
import { CareLogAPI } from './carelog';

const registerForPushNotifications = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('notification status', status);
    return;
  }

  // Get the token that identifies this device
  let token = await Notifications.getExpoPushTokenAsync();
  console.log(token);
  try {
    CareLogAPI.post('/user/notifications/token/', token);
  } catch(err) {

  }
}
export default registerForPushNotifications;