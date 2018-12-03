import React, { Component } from 'react';
import {
  View, Text, StyleSheet, Alert, Dimensions, Keyboard, TouchableWithoutFeedback, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { FormInput } from 'react-native-elements';
import RF from 'react-native-responsive-fontsize';
import { initializeAppWallet } from '../../../store/actions/creators/AppConfig';
import LinearButton from '../../../components/linearGradient/LinearButton';
import BackWithMenuNav from '../../../components/customPageNavs/BackWithMenuNav';
import BoxShadowCard from '../../../components/shadowCards/BoxShadowCard';

const ethers = require('ethers');

class RecoverWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mnemonic: '',
      value: '',
      buttonDisabled: true,
      walletProcessing: false,
    };
  }

  navigate = async (wallet) => {
    await this.setState({ walletProcessing: false });
    const navigateToCreateWalletName = NavigationActions.navigate({
      routeName: 'createWalletNameRecovered',
      params: { wallet },
    });
    this.props.navigation.dispatch(navigateToCreateWalletName);
  }

  recoverMnemonic = async () => {
    await this.setState({ walletProcessing: true });
    let wallet;
    const inDebug = this.props.debugMode;
    try {
      if (!inDebug) {
        const mnemonic = this.state.mnemonic.trim();
        wallet = await ethers.Wallet.fromMnemonic(mnemonic);
      } else {
        wallet = await new ethers.Wallet('0x923ed0eca1cee12c1c3cf7b8965fef00a2aa106124688a48d925a778315bb0e5');
      }
      this.navigate(wallet);
    } catch (err) {
      Alert.alert(
        'Mnemonic Error',
        'Your mnemonic was invalid, please re-enter.',
        [
          {
            text: 'OK',
            onPress: () => {
              this.setState({ walletProcessing: false });
              return console.log('error');
            },
          },
        ],
        { cancelable: false },
      );
    }
  };

  /**
   * Updates the local state with the latest mnemonic that was inputted in the input field
   * @param {String} mnemonicInput
   */
  renderRecoveryKey(mnemonicInput) {
    const totalWords = mnemonicInput.split(' ');
    if (totalWords.length === 12) {
      this.setState({ value: mnemonicInput.toLowerCase() });
      this.setState({ mnemonic: mnemonicInput.toLowerCase() });
      this.setState({ buttonDisabled: false });
    } else {
      this.setState({ buttonDisabled: true });
    }
  }

  /**
   * Returns the form required to recover the wallet
   */
  render() {
    const { walletProcessing, buttonDisabled } = this.state;
    const { debugMode } = this.props;
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.mainContainer}>
              <View style={styles.navContainer}>
                <BackWithMenuNav
                    showMenu={false}
                    showBack={true}
                    navigation={this.props.navigation}
                    backPage={'createWalletNameRecovered'}
                />
              </View>
              <Text style={styles.textHeader} >Recover Passphrase</Text>
              <View style={styles.boxShadowContainer}>
                <View style={styles.contentContainer} >
                  <BoxShadowCard>
                    {
                      walletProcessing
                        ? <View>
                            <Text style={styles.cardText}>
                              Please wait while your wallet is being created..
                            </Text>
                            <View style={[styles.container, styles.horizontal]}>
                              <ActivityIndicator size="large" color="#12c1a2" />
                            </View>
                          </View>
                        : <View>
                            <Text style={styles.cardText}>
                              Enter your 12 word recovery passphrase to recover your wallet.
                            </Text>
                            <View style={styles.formInputContainer}>
                              <FormInput
                                  placeholder={'Ex. man friend love long phrase ... '}
                                  onChangeText={this.renderRecoveryKey.bind(this)}
                                  inputStyle={styles.txtMnemonic}
                              />
                            </View>
                        </View>
                      }
                    </BoxShadowCard>
                </View>
              </View>
              <View style={styles.btnContainer}>
                <LinearButton
                    onClickFunction={ this.recoverMnemonic }
                    buttonText= 'Recover'
                    customStyles={styles.button}
                    buttonStateEnabled={ debugMode ? false : buttonDisabled}
                />
              </View>
            </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f4f7f9',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f7f9',
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  navContainer: {
    flex: 0.65,
  },
  textHeader: {
    fontFamily: 'Cairo-Light',
    fontSize: RF(4),
    letterSpacing: 0.8,
    paddingLeft: '9%',
    color: '#000000',
    flex: 0.65,
  },
  boxShadowContainer: {
    alignItems: 'center',
    flex: 2.5,
  },
  contentContainer: {
    width: '82%',
    flex: 1,
  },
  cardText: {
    paddingBottom: '15%',
    paddingTop: '10%',
    paddingLeft: '10%',
    paddingRight: '10%',
    fontFamily: 'WorkSans-Light',
    letterSpacing: 0.4,
    lineHeight: RF(3.8),
    color: '#000000',
    fontSize: RF(2.4),
    fontWeight: '300',
  },
  txtMnemonic: {
    width: '100%',
    flexWrap: 'wrap',
    color: '#12c1a2',
    letterSpacing: 0.4,
    fontSize: RF(2.4),
    fontFamily: 'WorkSans-Regular',
    borderBottomWidth: 0.001,
  },
  formInputContainer: {
    width: '90%',
    marginLeft: '5%',
  },
  btnContainer: {
    flex: 2.5,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: '2.5%',
    marginTop: '2.5%',
  },
  button: {
    width: '82%',
    height: Dimensions.get('window').height * 0.082,
  },
});

const mapStateToProps = ({ Debug, Wallet }) => {
  const { debugMode, testWalletName } = Debug;
  const {
    wallets, tempWalletName, appPassword, network,
  } = Wallet;
  return {
    debugMode, testWalletName, wallets, tempWalletName, appPassword, network,
  };
};

export default connect(mapStateToProps, { initializeAppWallet })(RecoverWallet);
