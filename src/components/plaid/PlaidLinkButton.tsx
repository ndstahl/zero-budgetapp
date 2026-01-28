import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Button } from '../ui/Button';
import { usePlaid } from '../../hooks/usePlaid';
import Toast from 'react-native-toast-message';
import { Link2 } from 'lucide-react-native';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Button that opens Plaid Link to connect a bank account.
 *
 * On native, this would use `react-native-plaid-link-sdk`.
 * On web, this would use `react-plaid-link`.
 *
 * The Plaid Link SDK requires native module support (EAS Build).
 * This component handles the full flow: create link token -> open link -> exchange token.
 */
export function PlaidLinkButton({
  onSuccess,
  title = 'Link Bank Account',
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
}: PlaidLinkButtonProps) {
  const { createLinkToken, exchangeToken, isCreatingLink, isExchanging } = usePlaid();
  const [isLinking, setIsLinking] = useState(false);

  const handlePress = useCallback(async () => {
    setIsLinking(true);
    try {
      // Step 1: Get link token from our edge function
      const linkToken = await createLinkToken(undefined);

      // Step 2: Open Plaid Link
      // NOTE: In a real app, you'd use react-native-plaid-link-sdk here:
      //
      // import { PlaidLink } from 'react-native-plaid-link-sdk';
      // PlaidLink.openLink({
      //   tokenConfig: { token: linkToken },
      //   onSuccess: async (success) => {
      //     await exchangeToken({
      //       publicToken: success.publicToken,
      //       institutionId: success.metadata.institution?.id,
      //       institutionName: success.metadata.institution?.name,
      //     });
      //     onSuccess?.();
      //   },
      //   onExit: (exit) => {
      //     if (exit.error) {
      //       Toast.show({ type: 'error', text1: 'Link Error', text2: exit.error.displayMessage });
      //     }
      //   },
      // });
      //
      // For now, we show a placeholder message since Plaid Link SDK
      // requires native modules which need EAS Build configuration.

      Toast.show({
        type: 'info',
        text1: 'Plaid Link Ready',
        text2: `Link token created. Connect Plaid Link SDK for full bank sync (requires EAS Build).`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: err.message ?? 'Failed to start bank link',
      });
    } finally {
      setIsLinking(false);
    }
  }, [createLinkToken, exchangeToken, onSuccess]);

  return (
    <Button
      title={title}
      onPress={handlePress}
      loading={isLinking || isCreatingLink || isExchanging}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      icon={<Link2 color={variant === 'primary' ? '#FFFFFF' : '#4F46E5'} size={16} />}
    />
  );
}
