
i18n.map('en', {
  walletPanel: {
    title: 'Set Wallet Address',
    subtitle: 'Please set your Bitcoin wallet address so that you can receive commissions',
    inputLabel: 'Bitcoin Wallet Address',
    button: 'Submit',
    successMessage: 'A confirmation email was sent to your registered email address.',

    errors: {
      unauthorized: 'Unauthorized',
      invalidWalletAddress: 'Please enter a valid wallet address',
      sameAddress: 'That is already your address'
    }
  }
});

i18n.map('ja', {
  walletPanel: {
    title: 'コミッション受け取り先の設定',
    subtitle: 'コミッションを受け取る為に、Bitcoinウォレットのアドレスを設定してください',
    inputLabel: '受け取り先Bitcoinウォレットアドレス（識別子ではありません）',
    button: '設定',
    successMessage: 'ご登録のメールアドレスに変更確認メールを送信しました',

    errors: {
      unauthorized: '権限がありません。',
      invalidWalletAddress: '有効なウォレットアドレスを入力してください。',
      sameAddress: 'このアドレスは既に使用されています'
    }
  }
});

i18n.map('ko', {
  walletPanel: {
    title: '커미션 수취 대상 설정',
    subtitle: '커미션 수취를 위해서는 비트코인 월렛 어드레스를 설정해 주십시오.',
    inputLabel: '수취 대상 비트코인 월렛 어드레스(식별자가 없습니다.)',
    button: '설정',
    successMessage: '등록하신 메일 어드레스로 변경 확인 메일을 보냈습니다.',

    errors: {
      unauthorized: '권한이 없음',
      invalidWalletAddress: '유효한 월렛 어드레스를 입력해 주십시오.',
      sameAddress: '이미 사용 중인 어드레스입니다.',
    }
  }
});

i18n.map('zh', {
  walletPanel: {
    title: '设定收取佣金地址',
    subtitle: '收取佣金请先设定比特币钱包地址',
    inputLabel: '比特币钱包地址',
    button: '设定',
    successMessage: '更改确认邮件已发送到您的邮箱。',

    errors: {
      unauthorized: '未得到授权',
      invalidWalletAddress: '请输入有效的钱包地址',
      sameAddress: '这是您已注册的电邮。'
    }
  }
});
