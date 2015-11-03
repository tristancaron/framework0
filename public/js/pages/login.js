"use strict";

(() => {
  const switchView = (viewHide, viewShow, viewHash) => {
    viewHide.slideUp(250);
    viewShow.slideDown(250, () => $('input').placeholder());

    if (viewHash) window.location = '#' + viewHash;
    else window.location = '#';
  };

  var formLogin = $('#form-login'),
    formReminder = $('#form-reminder'),
    formRegister = $('#form-register');

  $('#link-register-login').click(function () {
    switchView(formLogin, formRegister, 'register');
  });

  $('#link-register').click(function () {
    switchView(formRegister, formLogin, '');
  });

  $('#link-reminder-login').click(function () {
    switchView(formLogin, formReminder, 'reminder');
  });

  $('#link-reminder').click(function () {
    switchView(formReminder, formLogin, '');
  });

  if (window.location.hash === '#register') {
    formLogin.hide();
    formRegister.show();
  }

  if (window.location.hash === '#reminder') {
    formLogin.hide();
    formReminder.show();
  }

  formLogin.validate({
    errorClass: 'help-block animation-slideDown',
    errorElement: 'div',
    errorPlacement(error, e) {
      e.parents('.form-group > div').append(error);
    },
    highlight(e) {
      $(e).closest('.form-group').removeClass('has-success has-error').addClass('has-error');
      $(e).closest('.help-block').remove();
    },
    success(e) {
      e.closest('.form-group').removeClass('has-success has-error');
      e.closest('.help-block').remove();
    },
    rules: {
      'email': {
        required: true,
        email: true
      },
      'password': {
        required: true,
        minlength: 5
      }
    },
    messages: {
      'email': 'Please enter your account\'s email',
      'password': {
        required: 'Please provide your password',
        minlength: 'Your password must be at least 5 characters long'
      }
    }
  });

  formReminder.validate({
    errorClass: 'help-block animation-slideDown',
    errorElement: 'div',
    errorPlacement(error, e) {
      e.parents('.form-group > div').append(error);
    },
    highlight(e) {
      $(e).closest('.form-group').removeClass('has-success has-error').addClass('has-error');
      $(e).closest('.help-block').remove();
    },
    success(e) {
      e.closest('.form-group').removeClass('has-success has-error');
      e.closest('.help-block').remove();
    },
    rules: {
      'email': {
        required: true,
        email: true
      }
    },
    messages: {
      'email': 'Please enter your account\'s email'
    }
  });

  formRegister.validate({
    errorClass: 'help-block animation-slideDown',
    errorElement: 'div',
    errorPlacement(error, e) {
      e.parents('.form-group > div').append(error);
    },
    highlight(e) {
      $(e).closest('.form-group').removeClass('has-success has-error').addClass('has-error');
      $(e).closest('.help-block').remove();
    },
    success(e) {
      if (e.closest('.form-group').find('.help-block').length === 2) {
        e.closest('.help-block').remove();
      } else {
        e.closest('.form-group').removeClass('has-success has-error');
        e.closest('.help-block').remove();
      }
    },
    rules: {
      'firstname': {
        required: true,
        minlength: 2
      },
      'lastname': {
        required: true,
        minlength: 2
      },
      'email': {
        required: true,
        email: true
      },
      'password': {
        required: true,
        minlength: 5
      },
      'password-verify': {
        required: true,
        equalTo: '#register-password'
      },
      'terms': {
        required: true
      }
    },
    messages: {
      'firstname': {
        required: 'Please enter your firstname',
        minlength: 'Please enter your firstname'
      },
      'lastname': {
        required: 'Please enter your lastname',
        minlength: 'Please enter your lastname'
      },
      'email': 'Please enter a valid email address',
      'password': {
        required: 'Please provide a password',
        minlength: 'Your password must be at least 5 characters long'
      },
      'password-verify': {
        required: 'Please provide a password',
        minlength: 'Your password must be at least 5 characters long',
        equalTo: 'Please enter the same password as above'
      },
      'terms': {
        required: 'Please accept the terms!'
      }
    }
  });
})();
