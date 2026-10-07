# تطبيق قريب للموبايل (Native)

الموقع حالياً **PWA** يعمل من المتصفح على الموبايل.

## المسار الموصى به: Expo (React Native)

```bash
npx create-expo-app@latest areep-mobile -t blank-typescript
cd areep-mobile
npx expo install react-native-webview expo-secure-store
```

ثم WebView يفتح نفس الموقع المنشور:

```tsx
import { WebView } from "react-native-webview"
export default function App() {
  return (
    <WebView
      source={{ uri: "https://YOUR-VERCEL-URL/ar" }}
      style={{ flex: 1 }}
      allowsInlineMediaPlayback
      geolocationEnabled
    />
  )
}
```

### النشر
- Google Play: `eas build -p android` ثم رفع AAB
- App Store: `eas build -p ios` (يحتاج حساب Apple Developer)

### مرحلة تالية
API مشترك من `areep` (نفس `/api/*`) + شاشات Native للرئيسية/الشات بدل WebView فقط.
