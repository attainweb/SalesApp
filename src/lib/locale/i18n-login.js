import { getSupportEmailByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  login: {
    greeting: 'Welcome Back',
    title: {
      forgot: 'Reset Password',
      login: 'Login',
    },
    email: 'EMAIL ADDRESS',
    password: 'PASSWORD',
    button: 'Login',
    loginLink: 'Login',
    reorderButton: 'Reorder',
    resetLink: 'Forgot password?',
    resetButton: 'Send Reset Email',
    resetButtonSent: 'Email Sent',
    supportEmail: getSupportEmailByLanguage('en'),
    errors: {
      matchFailed: 'Match failed',
      userNotFound: 'User not found',
      noPasswordSet: 'User has no password set',
      incorrectPassword: 'Incorrect password'
    },
  }
});

i18n.map('ja', {
  login: {
    greeting: 'ようこそ',
    title: {
      forgot: 'パスワードのリセット',
      login: 'ログイン',
    },
    email: 'メールアドレス',
    password: 'パスワード',
    button: 'ログイン',
    loginLink: 'ログイン',
    reorderButton: '追加注文',
    resetLink: 'パスワードを忘れた方は',
    resetButton: 'リセット用メールを送信',
    resetButtonSent: 'メールが送信されました',
    supportEmail: getSupportEmailByLanguage('ja'),
    errors: {
      matchFailed: '一致しません',
      userNotFound: 'ユーザーが見つかりません',
      noPasswordSet: 'パスワードが設定されていません。',
      incorrectPassword: 'パスワードが一致しません'
    },
  }
});

i18n.map('ko', {
  login: {
    greeting: '환영합니다.',
    title: {
      forgot: '패스워드 리셋',
      login: '로그인',
    },
    email: '메일 어드레스',
    password: '패스워드',
    button: '로그인',
    loginLink: '로그인',
    reorderButton: '재주문',
    resetLink: '패스워드를 잊으신 분은 이쪽으로',
    resetButton: '리셋용 메일을 송신',
    resetButtonSent: '메일이 송신되었습니다.',
    supportEmail: getSupportEmailByLanguage('ko'),
    errors: {
      matchFailed: '일치하지 않습니다.',
      userNotFound: '유저를 찾을 수 없습니다.',
      noPasswordSet: '패스워드 설정이 되어있지 않습니다.',
      incorrectPassword: '잘못된 패스워드입니다.'
    },
  }
});

i18n.map('zh', {
  login: {
    greeting: '欢迎',
    title: {
      forgot: '重设密码',
      login: '登入',
    },
    email: '电邮',
    password: '密码',
    button: '登入',
    loginLink: '登入',
    reorderButton: '再兑换',
    resetLink: '忘记密码',
    resetButton: '发送重设密码电邮',
    resetButtonSent: '已寄送至电邮',
    supportEmail: getSupportEmailByLanguage('zh'),
    errors: {
      matchFailed: '配对错误',
      userNotFound: '没有此用户',
      noPasswordSet: '密码尚未设定',
      incorrectPassword: '密码错误'
    },
  }
});
