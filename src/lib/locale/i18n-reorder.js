import { getSupportEmailByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  reorder: {
    title: 'Reorder ' + getProductNameByLanguage('en'),
    language: 'Select Language',
    button: 'Order',
    errors: {
      emailNotFound: "We cannot find this email address. Please enter your registered email address.",
      waitingForApproval: "You cannot place another order until your account is approved.",
      youAreNotAllowedToOrder: 'You cannot order ' + getProductNameByLanguage('en') + ' with this account. Please contact us at' + getSupportEmailByLanguage('en'),
      salesOver: getProductNameByLanguage('en') + ' pre-sale has ended. Thank you for your support!',
    },
    reset: 'Reset',
    confirmEmail: 'Confirm Email Address'
  }
});

i18n.map('ja', {
  reorder: {
    title: getProductNameByLanguage('jp') + 'を再注文する',
    button: '再注文する',
    language: '言語',
    errors: {
      emailNotFound: "そのメールアドレスは登録されていません。交換者登録しているメールアドレスを入力して下さい。",
      waitingForApproval: "アカウントが承認されるまで交換注文を出すことはできません。今しばらくお待ち下さい。",
      youAreNotAllowedToOrder: "このアカウントでは交換注文が行えません。お手数ですが弊社サポートまでご連絡下さい。",
      salesOver: getProductNameByLanguage('jp') + 'プレセールは全期終了いたしました。皆様のご愛顧ありがとうございました。',
    },
    reset: 'リセット',
    confirmEmail: 'メールアドレスを確定'
  }
});

i18n.map('ko', {
  reorder: {
    title: getProductNameByLanguage('ko') + ' 교환 재주문하기',
    button: '주문하기',
    language: '사용 언어 선택',
    errors: {
      emailNotFound: "이 메일 어드레스는 등록되어 있지 않습니다. 교환자 등록을 한 메일 어드레스를 입력해 주십시오.",
      waitingForApproval: "계정이 승인될 때까지 교환주문을 할 수 없습니다. 잠시만 기다려 주십시오.",
      youAreNotAllowedToOrder: "이 계정은 교환주문을 할 수 없습니다. 번거로우시겠지만 당사 커스터머 서비스로 연락 부탁드립니다.",
      salesOver: getProductNameByLanguage('ko') + ' 프리세일 제1기부터 제4기까지 전체 프리세일이 종료되었습니다. 여러분의 성원 감사합니다.',
    },
    reset: '리셋',
    confirmEmail: '메일 어드레스 확정'
  }
});

i18n.map('zh', {
  reorder: {
    title: '再次兑换艾达币',
    button: '兑换',
    language: '选择语言',
    errors: {
      emailNotFound: '此电邮没有注册纪录，请输入已注册完成的兑换者电邮地址。',
      waitingForApproval: '帐户尚未被认证前无法进行兑换，烦请稍候。',
      youAreNotAllowedToOrder: '此帐户无法进行兑换，烦请洽询客服人员。',
      salesOver: getProductNameByLanguage('zh') + '的预售已完满结束，感谢各位的支持和爱戴。',
    },
    reset: '重设',
    confirmEmail: '确认电邮'
  }
});
