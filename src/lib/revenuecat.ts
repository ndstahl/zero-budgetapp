import Purchases, {
  type PurchasesPackage,
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

const ENTITLEMENT_ID = 'premium';

export const RevenueCat = {
  async initialize(userId?: string) {
    const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;
    if (!apiKey) return;

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey, appUserID: userId });
  },

  async login(userId: string) {
    try {
      await Purchases.logIn(userId);
    } catch {
      // silent fail — user may not exist in RC yet
    }
  },

  async logout() {
    try {
      await Purchases.logOut();
    } catch {
      // silent
    }
  },

  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch {
      return [];
    }
  },

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  },

  async restorePurchases(): Promise<CustomerInfo> {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  },

  isPremium(customerInfo: CustomerInfo | null): boolean {
    if (!customerInfo) return false;
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  },
};
