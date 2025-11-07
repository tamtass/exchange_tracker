# Exchange Tracker

A real-time currency exchange rate tracker built with Vue 3, TypeScript, and Firebase. Track multiple currencies, visualize historical data, and set price alerts with a modern, responsive interface.

## Features

### 📊 Real-Time Rate Tracking
- Live exchange rates with configurable refresh intervals (5 seconds to 5 minutes)
- Track multiple currency pairs simultaneously (EUR base)
- Add/remove currencies on the fly with an intuitive interface
- Visual indicators for rate updates

### 📈 Historical Data Visualization
- Interactive Chart.js line charts showing rate trends
- Configurable data points (10-200 historical entries)
- Smooth animations and hover tooltips
- Dropdown to switch between tracked currencies

### 🔔 Price Alerts
- Set alerts for when rates go above or below specific thresholds
- Browser notifications when alerts trigger
- Manage multiple alerts per currency
- Real-time alert checking on each rate update

### 💾 Data Persistence
- All rates automatically saved to Firebase Firestore
- User preferences persisted (tracked currencies, alerts, settings)
- Seamless experience across sessions
- No manual save required

### 🎨 Modern UI/UX
- Dark grey theme with pastel green accents
- Smooth animations and transitions
- Rounded corners and subtle shadows
- Fully responsive design
- Modal-based settings and alerts management

## Tech Stack

- **Frontend:** Vue 3 (Composition API), TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Chart.js
- **Backend:** Firebase (Firestore, Authentication, Cloud Functions)
- **State Management:** Pinia
- **API:** Exchange Rate API (exchangerate-api.com)

## Project Structure

```
exchange_tracker/
├── frontend/          # Vue 3 application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── router/
│   └── public/
└── functions/         # Firebase Cloud Functions
    └── src/
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tamtass/exchange_tracker.git
   cd exchange_tracker
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase config to `frontend/src/services/firebase.ts`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

### Optional: Firebase Functions Setup

1. **Install functions dependencies**
   ```bash
   cd functions
   npm install
   ```

2. **Deploy functions** (requires Firebase CLI)
   ```bash
   firebase deploy --only functions
   ```

## Usage

### Adding Currencies
1. Click the **"+ Add Currency"** button
2. Select from the available currency list
3. The new currency appears immediately with live rates

### Removing Currencies
1. Hover over any currency card
2. Click the **✕** button that appears
3. Currency is removed (minimum 1 currency required)

### Configuring Settings
1. Click the **Settings** button
2. Choose refresh rate (5s - 5min)
3. Set chart data points (10 - 200)
4. Click **Save Settings**

### Creating Alerts
1. Click the **Alerts** button
2. Select currency pair
3. Choose alert type (above/below)
4. Enter target rate value
5. Click **Create Alert**
6. Grant notification permissions when prompted

## Firestore Collections

### `exchangeRates`
Stores historical rate data:
```typescript
{
  base: string,           // Base currency (EUR)
  rates: Record<string, number>,  // Rate object
  timestamp: Timestamp,   // Server timestamp
  date: string           // ISO date string
}
```

### `userPreferences`
Stores user settings:
```typescript
{
  trackedCurrencies: string[],  // Array of currency codes
  alerts: Alert[],              // Alert configurations
  refreshRate: number,          // Milliseconds
  chartDataLimit: number,       // Number of data points
  updatedAt: Timestamp
}
```

## Development

### Build for Production
```bash
cd frontend
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Checking
```bash
npm run type-check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

**Tamás Tass**
- GitHub: [@tamtass](https://github.com/tamtass)
- Portfolio: [tamtass.github.io/web_portfolio](https://tamtass.github.io/web_portfolio)

---

Built with ❤️ using Vue 3 and Firebase
