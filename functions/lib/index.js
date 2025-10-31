"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlertsAndNotify = exports.scheduledFetchRates = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const node_fetch_1 = __importDefault(require("node-fetch"));
admin.initializeApp();
const db = admin.firestore();
// Example: scheduled function to fetch latest rates every hour
exports.scheduledFetchRates = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    try {
        const res = await (0, node_fetch_1.default)('https://api.exchangerate.host/latest?base=EUR');
        const data = await res.json();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        // Save snapshot in Firestore under `rates/latest` and add historical document
        await db.collection('rates').doc('latest').set({ base: data.base, rates: data.rates, fetchedAt: timestamp });
        await db.collection('rates_history').add({ base: data.base, rates: data.rates, fetchedAt: timestamp });
        console.log('Rates updated');
    }
    catch (err) {
        console.error('Failed to fetch rates', err);
    }
});
// Example: check alerts and send FCM notifications
exports.checkAlertsAndNotify = functions.pubsub.schedule('every 15 minutes').onRun(async () => {
    const latestDoc = await db.collection('rates').doc('latest').get();
    if (!latestDoc.exists)
        return null;
    const latest = latestDoc.data() || {};
    const rates = latest.rates || {};
    // Get all users with alerts
    const usersSnap = await db.collection('users').get();
    const messages = [];
    usersSnap.forEach(userDoc => {
        const u = userDoc.data();
        const alerts = u.alerts || [];
        const fcmTokens = u.fcmTokens || [];
        alerts.forEach((alert) => {
            // alert.pair expected like 'EUR/HUF'
            const [base, quote] = alert.pair.split('/');
            const rateForPair = (base === latest.base) ? rates[quote] : null;
            if (!rateForPair)
                return;
            if ((alert.direction === 'above' && rateForPair > alert.threshold) || (alert.direction === 'below' && rateForPair < alert.threshold) || (!alert.direction && rateForPair > alert.threshold)) {
                fcmTokens.forEach((token) => {
                    messages.push({
                        token,
                        notification: {
                            title: 'Exchange Alert',
                            body: `${alert.pair} is now ${rateForPair} (threshold ${alert.threshold})`
                        },
                        data: { pair: alert.pair, rate: String(rateForPair) }
                    });
                });
            }
        });
    });
    // Send messages in batches
    while (messages.length) {
        const batch = messages.splice(0, 100);
        try {
            const resp = await admin.messaging().sendAll(batch);
            console.log('Sent batch with', resp.successCount, 'successes');
        }
        catch (err) {
            console.error('FCM send error', err);
        }
    }
    return null;
});
