'use strict';

const formUserSetting = $('#form-user-settings').validate({
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
    'current-password': {
      required: true,
      minlength: 5
    },
    'password': {
      minlength: 5
    },
    'repassword': {
      minlength: 5,
      equalTo: '#user-settings-password'
    }
  },
  messages: {
    'email': 'Please enter your account\'s email',
    'current-password': {
      minlength: 'Your password must be at least 5 characters long',
      required: 'Please provide your current password'
    },
    'password': {
      minlength: 'Your password must be at least 5 characters long'
    },
    repassword: {
      minlength: 'Your password must be at least 5 characters long',
      equalTo: 'Please enter the same password as above'
    }
  }
});

// Print toast success
function updateUserInfo(event, form, userId) {
  event.preventDefault();

  if ($(form).valid()) {
    fetch(`/user/update/${userId}`, {
      credentials: 'same-origin',
      method: 'put',
      body: new FormData(form)
    }).then(response => response.json())
      .then(json => {
      if (json.status === 'ok') {
        $.bootstrapGrowl('<h4>Hi there!</h4> <p>Your informations are updated!</p>', {
          type: 'success',
          delay: 2500,
          allow_dismiss: true
        });
        form['password'] = form['repassword'] = form['current-password'] = '';
      } else {
        $.bootstrapGrowl('<h4>Hi there!</h4> <p>The operation failed!</p>', {
          type: 'danger',
          delay: 2500,
          allow_dismiss: true
        });
      }
    });
  }
}
