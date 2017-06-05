import { getSupportEmailByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  confirmWalletChange: {
    thankYou: 'A confirmation email will be sent to your registered email address within an hour. If you do not receive it, please contact us at ' + getSupportEmailByLanguage('en') + '. Thank you.',

    errors: {
      'invalid-ref-code': 'This link is no longer valid'
    }
  }
});

i18n.map('ja', {
  confirmWalletChange: {
    thankYou: 'ウォレットアドレスの変更依頼を承りました。1時間以内にご登録のメールアドレスに確認メールが送信されます。受信されない場合は' + getSupportEmailByLanguage('ja') + 'にお問い合わせください。',

    errors: {
      'invalid-ref-code': 'このリンクは有効ではありません'
    }
  }
});

i18n.map('ko', {
  confirmWalletChange: {
    thankYou: '월렛 어드레스 변경 요청이 접수되었습니다. 등록하신 메일 어드레스로 확인 메일이 발송됩니다. 한 시간이 지나도 메일이 도착하지 않는 경우 ' + getSupportEmailByLanguage('ko') + '에 문의해 주십시오.',

    errors: {
      'invalid-ref-code': '이 링크는 유효하지 않습니다.'
    }
  }
});

i18n.map('zh', {
  confirmWalletChange: {
    thankYou: '非常感谢。一个小时内会发送确认电邮至您注册的邮箱，如没收到请联系' + getSupportEmailByLanguage('zh') + '。',

    errors: {
      'invalid-ref-code': '此连结已无效。'
    }
  }
});
