import { getProductNameByLanguage } from '../../imports/lib/settings';

i18n.map('en', {
  emailSubjects: {
    confirmFundsReceived: 'Your payment has been confirmed (Email Id: {$1})',
    distributorApproval: 'Your enrollment has been successfully approved (Email Id: {$1})',
    buyerApproval: 'Your account has been successfully approved (Email Id: {$1})',
    invoiceBank: 'Thank you for your ' + getProductNameByLanguage('en') + ' purchase (Email Id: {$1})',
    invoiceBtc: 'Thank you for your ' + getProductNameByLanguage('en') + ' purchase (Email Id: {$1})',
    ET204InvoiceExpiredEmail: 'Your invoice has expired (Email Id: {$1})',
    ET206InvoiceCanceledEmail: 'Your invoice has been canceled (Email Id: {$1})',
    ET301Receipt: 'Receipt for your ' + getProductNameByLanguage('en') + ' purchase (Email Id: {$1})',
    reset: 'Please reset your password (Email Id: {$1})',
    signup: 'Your enrollment request has been sent (Email Id: {$1})',
    waitForSaleToStart: 'Thank You for your enrollment (Email Id: {$1})',
    EU302WalletAddressChangedConfirmation: 'Wallet address change confirmation (Email Id: {$1})',
    EU303WalletAddressChanged: 'Your wallet address has been changed (Email Id: {$1})',
    EU304EmailChangeNewEmailConfirmation: 'You requested to change your email address (Email Id: {$1})',
    EU305EmailChangeCurrentEmailConfirmation: 'Please confirm your new email address (Email Id: {$1})',
    EU306EmailChanged: 'Your email address has been successfully changed (Email Id: {$1})',
    productReservedButPending: 'Your account has not been approved yet (Email Id: {$1})',
    ET101TicketEnqueuedEmail: 'You are currently waiting for cancellation (Email Id: {$1})',
    EU102waitingForProductWhilePendingCompliance: 'Your account is being reviewed by our compliance team (Email Id: {$1})',
    sendEU501RegenerateAllProductPasscodes: 'Please regenerate all ' + getProductNameByLanguage('en') + ' passcodes (Email Id: {$1})',
    sendEU502RegenerateProductPasscode: 'Please regenerate ' + getProductNameByLanguage('en') + ' passcode (Email Id: {$1})',
    emailVerificationCode: 'Email verification code',
  }
});

i18n.map('ja', {
  emailSubjects: {
    confirmFundsReceived: 'ご送金ありがとうございます (Email Id: {$1})',
    distributorApproval: '承認作業完了のお知らせ (Email Id: {$1})',
    buyerApproval: 'あなたのアカウントが承認されました (Email Id: {$1})',
    invoiceBank: 'ご注文確定 (Email Id: {$1})',
    invoiceBtc: 'ご注文が確定致しました (Email Id: {$1})',
    ET204InvoiceExpiredEmail: 'ご注文がキャンセルとなりました (Email Id: {$1})',
    ET206InvoiceCanceledEmail: 'あなたの請求書がキャンセルされました (Email Id: {$1})',
    ET301Receipt: '受領証 (Email Id: {$1})',
    reset: 'パスワードのリセット (Email Id: {$1})',
    signup: '仮登録完了 (Email Id: {$1})',
    waitForSaleToStart: 'ご登録ありがとうございます (Email Id: {$1})',
    EU302WalletAddressChangedConfirmation: 'お客様のウォレットアドレス変更依頼を承りました',
    EU303WalletAddressChanged: 'お客様のウォレットアドレスが変更されました (Email Id: {$1})',
    EU304EmailChangeNewEmailConfirmation: 'メールアドレス変更依頼を承りました(Email Id: {$1})',
    EU305EmailChangeCurrentEmailConfirmation: 'メールアドレス変更のご確認 (Email Id: {$1})',
    EU306EmailChanged: 'あなたのメールアドレスが変更されました(Email Id: {$1})',
    productReservedButPending: 'お客様のアカウントは現在承認待ちの状態です (Email Id: {$1})',
    ET101TicketEnqueuedEmail: '現在キャンセル待ちの状態です (Email Id: {$1})',
    EU102waitingForProductWhilePendingCompliance: '現在コンプライアンスチェックを行っております (Email Id: {$1})',
    sendEU501RegenerateAllProductPasscodes: 'すべての' + getProductNameByLanguage('ja') + '還元用コードを再生成してください (Email Id: {$1})',
    sendEU502RegenerateProductPasscode: getProductNameByLanguage('ja') + '還元用コードを再生成してください (Email Id: {$1})',
    emailVerificationCode: 'Eメール認証コード',
  }
});

i18n.map('ko', {
  emailSubjects: {
    confirmFundsReceived: '송금해 주셔서 감사합니다. (Email Id: {$1})',
    distributorApproval: '승인 작업 완료 알림. (Email Id: {$1})',
    buyerApproval: '귀하의 계정은 승인되었습니다. (Email Id: {$1})',
    invoiceBank: '주문 확정 (Email Id: {$1})',
    invoiceBtc: '주문을 확정하였습니다. (Email Id: {$1})',
    ET204InvoiceExpiredEmail: '주문이 캔슬되었습니다. (Email Id: {$1})',
    ET206InvoiceCanceledEmail: '청구서가 캔슬되었습니다. (Email Id: {$1})',
    ET301Receipt: '영수증 (Email Id: {$1})',
    reset: '패스워드 리셋. (Email Id: {$1})',
    signup: '임시등록 완료 (Email Id: {$1})',
    waitForSaleToStart: '등록해 주셔서 감사합니다. (Email Id: {$1})',
    EU302WalletAddressChangedConfirmation: '귀하의 월렛 어드레스 변경 요청이 접수되었습니다. (Email Id: {$1})',
    EU303WalletAddressChanged: '월렛 어드레스가 변경되었습니다. (Email Id: {$1})',
    EU304EmailChangeNewEmailConfirmation: '메일 어드레스 계정 확인(Email Id: {$1})',
    EU305EmailChangeCurrentEmailConfirmation: '메일 어드레스 변경 확인(Email Id: {$1})',
    EU306EmailChanged: '메일 어드레스가 성공적으로 변경되었습니다.(Email Id: {$1})',
    productReservedButPending: '귀하의 계정은 현재 승인 대기 상태입니다. (Email Id: {$1})',
    ET101TicketEnqueuedEmail: '현재 캔슬 대기 상태입니다. (Email Id: {$1}',
    EU102waitingForProductWhilePendingCompliance: '현재 컴플라이언스 심사 중입니다. (Email Id: {$1})',
    sendEU501RegenerateAllProductPasscodes: '모든 ' + getProductNameByLanguage('ko') + ' 코드를 재생성해 주십시오.(Email Id: {$1})',
    sendEU502RegenerateProductPasscode: getProductNameByLanguage('ko') + ' 코드를 재생성해 주십시오.(Email Id: {$1})',
    emailVerificationCode: '메일 확인 코드 안내',
  }
});

i18n.map('zh', {
  emailSubjects: {
    confirmFundsReceived: '非常感谢您的汇款 (Email Id: {$1})',
    distributorApproval: '完成认证程序的通知 (Email Id: {$1})',
    buyerApproval: '您的帐户已完成认证 (Email Id: {$1})',
    invoiceBank: '请确认订单 (Email Id: {$1})',
    invoiceBtc: '订单已确认 (Email Id: {$1})',
    ET204InvoiceExpiredEmail: '您的订单已取消 (Email Id: {$1})',
    ET206InvoiceCanceledEmail: '您的订单已被取消 (Email Id: {$1})',
    ET301Receipt: '收据 (Email Id: {$1})',
    reset: '设定密码 (Email Id: {$1})',
    signup: '注册完成 (Email Id: {$1})',
    waitForSaleToStart: '非常感谢您的注册 (Email Id: {$1})',
    EU302WalletAddressChangedConfirmation: '确认钱包地址更改 (Email Id: {$1})',
    EU303WalletAddressChanged: '您的钱包地址已更改 (Email Id: {$1})',
    EU304EmailChangeNewEmailConfirmation: '确认电邮地址 (Email Id: {$1})',
    EU305EmailChangeCurrentEmailConfirmation: '确认电邮地址更改 (Email Id: {$1})',
    EU306EmailChanged: '电邮地址已成功变更 (Email Id: {$1})',
    productReservedButPending: '您的订单已被接纳，现帐户正在等待认证 (Email Id: {$1})',
    ET101TicketEnqueuedEmail: '您的申请列于候补清单 (Email Id: {$1})',
    EU102waitingForProductWhilePendingCompliance: '现正进行客户认证 (Email Id: {$1})',
    sendEU501RegenerateAllProductPasscodes: '请重新发行所有' + getProductNameByLanguage('zh') + '换领码 (Email Id: {$1})',
    sendEU502RegenerateProductPasscode: '请重新发行' + getProductNameByLanguage('zh') + '换领码  (Email Id: {$1})',
    emailVerificationCode: '电邮认证码通知',
  }
});
