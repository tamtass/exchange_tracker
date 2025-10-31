import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

admin.initializeApp()
const db = admin.firestore()

// Example: scheduled function to fetch latest rates every hour
export const scheduledFetchRates = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=EUR')
    const data: any = await res.json()
    const timestamp = admin.firestore.FieldValue.serverTimestamp()

    // Save snapshot in Firestore under `rates/latest` and add historical document
    await db.collection('rates').doc('latest').set({ base: data.base, rates: data.rates, fetchedAt: timestamp })
    await db.collection('rates_history').add({ base: data.base, rates: data.rates, fetchedAt: timestamp })

    console.log('Rates updated')
  } catch (err) {
    console.error('Failed to fetch rates', err)
  }
})

// Example: check alerts and send FCM notifications
export const checkAlertsAndNotify = functions.pubsub.schedule('every 15 minutes').onRun(async () => {
  const latestDoc = await db.collection('rates').doc('latest').get()
  if (!latestDoc.exists) return null
  const latest = latestDoc.data() || {}
  const rates = (latest as any).rates || {}

  // Get all users with alerts
  const usersSnap = await db.collection('users').get()
  const messages: admin.messaging.Message[] = []

  usersSnap.forEach(userDoc => {
    const u = userDoc.data()
    const alerts = (u as any).alerts || []
    const fcmTokens = (u as any).fcmTokens || []

    alerts.forEach((alert: any) => {
      // alert.pair expected like 'EUR/HUF'
      const [base, quote] = alert.pair.split('/')
      const rateForPair = (base === (latest as any).base) ? rates[quote] : null
      if (!rateForPair) return

      if ((alert.direction === 'above' && rateForPair > alert.threshold) || (alert.direction === 'below' && rateForPair < alert.threshold) || (!alert.direction && rateForPair > alert.threshold)) {
        fcmTokens.forEach((token: string) => {
          messages.push({
            token,
            notification: {
              title: 'Exchange Alert',
              body: `${alert.pair} is now ${rateForPair} (threshold ${alert.threshold})`
            },
            data: { pair: alert.pair, rate: String(rateForPair) }
          })
        })
      }
    })
  })

  // Send messages in batches
  while (messages.length) {
    const batch = messages.splice(0, 100)
    try {
      const resp = await admin.messaging().sendAll(batch)
      console.log('Sent batch with', resp.successCount, 'successes')
    } catch (err) {
      console.error('FCM send error', err)
    }
  }

  return null
})
