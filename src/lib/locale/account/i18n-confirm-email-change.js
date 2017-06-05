import { getSupportEmailByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  confirmEmailChange: {
    thankYou: 'Your new email address has been successfully set. A confirmation email will be sent to your registered email address within an hour. If you do not receive it, please contact us at ' + getSupportEmailByLanguage('en') + '. Thank you.',

    errors: {
      'invalid-ref-code': 'This link is no longer valid',
    }
  }
});

i18n.map('ja', {
  confirmEmailChange: {
    thankYou: '新しいメールアドレスに変更されました。<br />1時間以内に新しいメールアドレスに確認メールが送信されます。受信されない場合は' + getSupportEmailByLanguage('ja') + 'にお問い合わせください。',

    errors: {
      'invalid-ref-code': 'このリンクは有効ではありません',
    }
  }
});

i18n.map('ko', {
  confirmEmailChange: {
    thankYou: '새 메일 어드레스로 변경되었습니다.<br />등록하신 메일 어드레스로 확인 메일이 발송됩니다. 한 시간이 지나도 메일이 도착하지 않는 경우, 커스터머 서비스로 문의해 주십시오.',

    errors: {
      'invalid-ref-code': '이 링크는 유효하지 않습니다.',
    }
  }
});

i18n.map('zh', {
  confirmEmailChange: {
    thankYou: '非常感谢。敝司将会进行电邮更改设定，一个小时内会发送确认电邮至您注册的邮箱，如没收到请联系客服。',

    errors: {
      'invalid-ref-code': '此连结已无效。',
    }
  }
});
