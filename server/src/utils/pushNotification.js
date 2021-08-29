const express = require('express');
const router = express.Router();
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

let savedPushTokens = [];

const handlePushTokens = ({ title, body }) => {
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    notifications.push({
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: { body }
    });
  }

  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

const saveToken = (token) => {
  console.log(token, savedPushTokens);
  const exists = savedPushTokens.find(t => t === token);
  if (!exists) {
    savedPushTokens.push(token);
  }
};

router.get("/", (req, res) => {
  res.send("Push Notification Server Running");
});

router.post("/token", (req, res) => {
    console.log("asd", req.body.token.value.data);
  saveToken(req.body.token.value.data);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

router.post("/message", (req, res) => {
  handlePushTokens(req.body);
  console.log(`Received message, with title: ${req.body.title}`);
  res.send(`Received message, with title: ${req.body.title}`);
});

module.exports = router;
