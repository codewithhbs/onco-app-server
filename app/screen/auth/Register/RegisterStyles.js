import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: width * 0.6,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  otpContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  resendButton: {
    marginTop: 24,
    padding: 12,
  },
  resendText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  successMessage: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorMessageText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  }
});