const express = require('express');
const router = express.Router();
const { Expo } = require("expo-server-sdk");

let expo = new Expo();
let tickets = [];

router.post("/token", (req, res) => {
  try {
    if(req.body.data == req.user.notificationToken)
      return res.send({message: 'same.'});
    req.user.notificationToken = req.body.data;
    req.user.save((err,data) => {
      if(err) throw err;
      console.log(req.body.data);
      res.send({message: 'token updated.'});
    });
  } catch(err) {
    console.log(err);
    res/*.status(422)*/.send({error: err.message});
  }
});

router.post("/message", async (req, res) => {
  try {
    if(!req.user.notificationToken || !Expo.isExpoPushToken(req.user.notificationToken))
      throw {message: 'no token'};
    
    let messages = [];

    messages.push({
      to: req.user.notificationToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' },
    });

    let chunks = expo.chunkPushNotifications(messages);
    (async () => {
      // Send the chunks to the Expo push notification service. There are
      // different strategies you could use. A simple one is to send one chunk at a
      // time, which nicely spreads the load out over time:
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        } catch (error) {
          console.error(error);
        }
      }
    })();
    res.send({message: 'notification sent.'});
  } catch(err) {

  }
});

router.get('/tickets', (req,res) => {
  let receiptIds = [];
for (let ticket of tickets) {
  // NOTE: Not all tickets have IDs; for example, tickets for notifications
  // that could not be enqueued will have error information and no receipt ID.
  if (ticket.id) {
    receiptIds.push(ticket.id);
  }
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
  // Like sending notifications, there are different strategies you could use
  // to retrieve batches of receipts from the Expo service.
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`);
          }
        }
      }
      res.send(receipts);
    } catch (error) {
      console.error(error);
    }
  }
})();
})
module.exports = router;
