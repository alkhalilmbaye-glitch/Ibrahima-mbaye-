import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ShopSettings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<ShopSettings>({
    name: "AL KHALIL BUSINESS COMPAGNY",
    phone: "76 383 56 91",
    address: "Dakar, Sénégal",
    currency: "XOF"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as ShopSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to settings:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { settings, loading };
}
