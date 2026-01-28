import PostHog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let posthog: PostHog | null = null;

export function initAnalytics() {
  if (!POSTHOG_KEY || __DEV__) return;

  posthog = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
  });
}

type Properties = Record<string, string | number | boolean | null>;

export const analytics = {
  capture(event: string, properties?: Properties) {
    posthog?.capture(event, properties);
  },
  identify(userId: string, traits?: Properties) {
    posthog?.identify(userId, traits);
  },
  screen(screenName: string, properties?: Properties) {
    posthog?.screen(screenName, properties);
  },
  reset() {
    posthog?.reset();
  },
};
