import React, {Component} from 'react';
import {connect} from 'react-redux';
import debounce from 'lodash.debounce';

import SignDialog from '../components/SignDialog';
import Button from 'coral-ui/components/Button';

import validate from 'coral-framework/helpers/validate';
import errorMsj from 'coral-framework/helpers/error';

import {
  changeView,
  fetchSignUp,
  fetchSignIn,
  showSignInDialog,
  hideSignInDialog,
  fetchSignInFacebook,
  fetchForgotPassword,
  facebookCallback,
  fetchCheckAvailability
} from '../../coral-framework/actions/auth';

class SignInContainer extends Component {
  initialState = {
    formData: {
      email: '',
      displayName: '',
      password: '',
      confirmPassword: ''
    },
    errors: {},
    showErrors: false
  };

  constructor(props) {
    super(props);
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.cleanState = this.cleanState.bind(this);
    this.addError = this.addError.bind(this);
  }

  componentDidMount() {
    window.authCallback = this.props.facebookCallback;
  }

  cleanState () {
    this.setState(this.initialState);
  }

  handleChange(e) {
    const {name, value} = e.target;
    this.setState(state => ({
      ...state,
      formData: {
        ...state.formData,
        [name]: value
      }
    }), () => {
      this.validation(name, value);
    });
  }

  addError(name, error) {
    return this.setState(state => ({
      errors: {
        ...state.errors,
        [name]: error
      }
    }));
  }

  validation(name, value) {
    const {addError} = this;
    const {formData} = this.state;
    const {checkAvailability} = this.props;

    if (!value.length) {
      addError(name, 'Please, fill this field');
    } else if (name === 'confirmPassword' && formData.confirmPassword !== formData.password) {
      addError(name, 'Passwords don`t match. Please, check again.');
    } else if (!validate[name](value)) {
      addError(name, errorMsj[name]);
    } else {
      const { [name]: prop, ...errors } = this.state.errors; // eslint-disable-line
      // Removes Error
      this.setState(state => ({...state, errors}));
      // Checks Email Availability
      if (name === 'email') {
        debounce(checkAvailability({[name]: value}), 250);
      }
    }
  }

  isCompleted() {
    const {formData} = this.state;
    const {emailAvailable} = this.props.auth;
    return !Object.keys(formData).filter(prop => !formData[prop].length).length && emailAvailable;
  }

  displayErrors(show = true) {
    this.setState({showErrors: show});
  }

  handleSignUp(e) {
    e.preventDefault();
    const {errors} = this.state;
    this.displayErrors();
    if (this.isCompleted() && !Object.keys(errors).length) {
      this.props.fetchSignUp(this.state.formData);
      this.cleanState();
    }
  }

  handleSignIn(e) {
    e.preventDefault();
    this.props.fetchSignIn(this.state.formData);
    this.cleanState();
  }

  handleClose() {
    this.props.hideSignInDialog();
    this.cleanState();
  }

  changeView(view) {
    this.cleanState();
    this.props.changeView(view);
  }

  render() {
    const {auth, showSignInDialog} = this.props;
    return (
      <div>
        <Button onClick={showSignInDialog}>
          Sign in to comment
        </Button>
        <SignDialog
          open={showSignInDialog}
          view={auth.view}
          {...this}
          {...this.state}
          {...this.props}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth.toJS()
});

const mapDispatchToProps = dispatch => ({
  facebookCallback: (err, data) => dispatch(facebookCallback(err, data)),
  fetchSignUp: (formData) => dispatch(fetchSignUp(formData)),
  fetchSignIn: (formData) => dispatch(fetchSignIn(formData)),
  fetchSignInFacebook: () => dispatch(fetchSignInFacebook()),
  fetchForgotPassword: (formData) => dispatch(fetchForgotPassword(formData)),
  showSignInDialog: () => dispatch(showSignInDialog()),
  changeView: (view) => dispatch(changeView(view)),
  handleClose: () => dispatch(hideSignInDialog()),
  checkAvailability: (formData) => dispatch(fetchCheckAvailability(formData))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SignInContainer);
