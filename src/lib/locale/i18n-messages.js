import { getSupportEmailByLanguage, getProductNameByLanguage, getCompanyInfoByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  messages: {
    thankYou: 'Thank you for your enrollment request. <br /> A confirmation email will be sent to your registered email address within an hour. If you do not receive it, please contact us at ' + getSupportEmailByLanguage('en') + '.',
    enrollThankYou: 'Thank you for your enrollment. <br /> <br /> You will be notified when the next ' + getProductNameByLanguage('en') + ' presale starts.',
    enrollThankYouInvoice: 'Thank you for your enrollment. <br /> <br /> An invoice will be sent to your registered email address within 6 business days. If you do not receive it, please contact us at ' + getSupportEmailByLanguage('en') + '.',
    enrollThankYouDistributor: 'Thank you for your enrollment. <br /> <br /> A confirmation email will be sent to your registered email address within an hour. If you do not receive it, please contact us at ' + getSupportEmailByLanguage('en') + '.',
    thankYouSubmit: 'Your account is now pending Administrator approval. <br /> An approval email will be sent to your registered email address within 6 business days.',
    thankYouPurchase: 'Thank you for your order! An invoice will be sent to your registered email address soon. Please note that an invoice for large orders (Daily amount >$4,800 and Monthly amount >$24,000) and Bitcoin payment may take some time to be issued.',
    limitApprovalNotice: 'Your requested amount requires our compliance checks. We will contact you after reviewing your request.',
    buyer: 'Your account has been successfully approved. An approval email will be sent from us within 3 business days (during the presale period).',
    rejectionNotice: 'There were issues processing your account.',
    adminAdded: 'Compliance Administrator Added',
    reorderThankYou: 'Thank you for your order.<br /> <br /> You will receive a confirmation email shortly.',
    customerServiceOfficerAdded: 'Customer Service Officer added',
    salesOver: getProductNameByLanguage('en') + ' pre-sale has ended. Thank you for your support!',
  }
});

i18n.map('ja', {
  messages: {
    thankYou: '仮登録ありがとうございました。<br />後ほど登録確認メールがあなたのアドレスに送信されます。<br />メールが送信されるまで最大で1時間かかる場合があります。万が一メールが届かない場合は、' + getSupportEmailByLanguage('ja') + ' までお問い合わせください。',
    enrollThankYou: 'ご登録ありがとうございます。<br /> <br />現在' + getProductNameByLanguage('ja') + '交換を休止しております。交換が再開された際に改めてご連絡させていただきます。',
    enrollThankYouInvoice: 'ご登録ありがとうございます。<br>後ほど登録されたメールアドレスに請求書が届きますので、そちらの指示に従って下さい。<br>なお、銀行振込では通常1時間、ビットコインでは通常6営業日以内に請求書が届きますので、これらの期間が経過しても請求書が届かない場合は弊社サポートにご連絡下さい。',
    enrollThankYouDistributor: 'ご登録ありがとうございます。<br />後ほど登録確認メールがあなたのアドレスに送信されます。<br />メールが送信されるまで最大で1時間ほど時間がかかる場合があります。万が一メールが届かない場合は、' + getSupportEmailByLanguage('ja') + ' までお問い合わせください。',
    thankYouSubmit: 'あなたのアカウントは現在' + getCompanyInfoByLanguage('ja').companyName + 'による承認待ちです。<br/>申し訳ありませんが承認作業が完了するまでは、一切の作業を行っていただくことができません。<br/>通常6営業日以内に承認結果をご登録のメールアドレスにご連絡させて頂きます。',
    thankYouPurchase: 'ご注文ありがとうございます。後ほど請求書をメールにて送付させていただきます。なお、日額で$4,800米ドル、月額で$24,000米ドルを超える交換、ならびにBitcoinでのお支払いをご希望の場合は、弊社手続きの都合上、請求書の発行までお時間をいただきます。',
    limitApprovalNotice: 'お客様の交換ご希望額はコンプライアンス審査が必要となります。弊社で審査を行った後、近日中に改めてご連絡差し上げます。',
    buyer: 'お客様のアカウントは無事承認されました。交換期間中であれば、通常３営業日以内に送られる' + getCompanyInfoByLanguage('ja').companyName + 'からのメールをお待ちください。メールが届き次第、実際に'  + getProductNameByLanguage('ja') + '交換を行えるようになります。',
    rejectionNotice: 'お客様のアカウントの処理時に問題がありました。',
    adminAdded: 'コンプライアンス責任者が追加されました',
    reorderThankYou: 'ご注文ありがとうございます。<br /><br />すぐに確認のメールが届きますのでご確認下さい。',
    customerServiceOfficerAdded: 'カスタマーサービス責任者が追加されました。',
    salesOver: getProductNameByLanguage('ja') + 'プレセールは全期終了いたしました。皆様のご愛顧ありがとうございました。',
  }
});

i18n.map('ko', {
  messages: {
    thankYou: '임시등록해 주셔서 감사합니다.<br />잠시 후, 등록 확인 메일이 귀하의 메일 어드레스로 송신됩니다.<br />메일이 송신될 때 까지 최대 1시간이 걸리는 경우가 있습니다. 만약 메일이 오지 않은 경우, ' + getSupportEmailByLanguage('ko') + '로 문의 부탁드립니다.',
    enrollThankYou: '등록해 주셔서 감사합니다.<br /> <br />현재, ' + getProductNameByLanguage('ko') + ' 교환 중지 중입니다. 교환이 재개되면 다시 연락 드리겠습니다.',
    enrollThankYouInvoice: '등록해 주셔서 감사합니다.<br /> <br /> 잠시 후, 등록 한 메일 어드레스로 청구서가 도착하므로 그 내용에 따라 주십시오.<br>또한, 은행 송금은 통상 1시간, 비트코인은 통상 영업일 6일 이내에 청구서가 도착하므로 이 기간이 지나도 청구서가 도착하지 않은 경우 커스터머 서비스로 연락 주십시오. ',
    enrollThankYouDistributor: '등록해 주셔서 감사합니다.<br /> <br /> 잠시 후, 등록확인 메일이 귀하의 메일 어드레스로 송신됩니다.',
    thankYouSubmit: '귀하의 계정은 현재, ' + getCompanyInfoByLanguage('ko').companyName + '의 승인을 대기 중입니다.<br />대단히 죄송합니다만 승인작업이 완료될 때까지는 다른 작업을 할 수 없습니다.<br>통상, 영업일 6일 이내에 승인결과를 등록하신 메일 어드레스로 연락 드립니다.',
    thankYouPurchase: '주문해 주셔서 감사합니다. 잠시 후, 청구서를 메일로 송신하겠습니다. 단, 일 정액 $4,800 미국 달러, 월 정액 $24,000 이상의 비트코인 결제를 원하시는 경우, 당사 규정 상 청구서 발행까지 시간이 걸림으로 양해 부탁드립니다.',
    limitApprovalNotice: '고객님의 교환 희망금액은 컴플라이언스 심사에 필요한 금액을 초과하고 있습니다. 당사에서 심사에 들어간 후, 곧 다시 연락 드리겠습니다.',
    buyer: '고객님의 계정은 무사히 승인되었습니다. 교환 기간 중이라면 통상 영업일 3일 이내에 ' + getCompanyInfoByLanguage('ko').companyName + '에서 송신하는 메일을 기다려주십시오. 실제 메일이 도착하는 대로 ' + getProductNameByLanguage('ko') + ' 교환을 할 수 있게 됩니다.',
    rejectionNotice: '고객님의 계정을 처리하는 중에 문제가 있었습니다.',
    adminAdded: '관리자가 첨가되었습니다.',
    reorderThankYou: '주문 감사합니다.<br /> <br /> 곧 확인 메일이 도착하므로 확인해 주십시오.',
    customerServiceOfficerAdded: '커스터머 서비스 책임자가 첨가되었습니다.',
    salesOver: getProductNameByLanguage('ko') + ' 프리세일 제1기부터 제4기까지 전체 프리세일이 종료되었습니다. 여러분의 성원 감사합니다.',
  }
});

i18n.map('zh', {
  messages: {
    thankYou: '感谢您的注册申请。 <br /> 稍后注册确认邮件将会发送至您的电邮。<br />信件发送可能约需一个小时的时间, 若届时未收到信件，烦请与 ' + getSupportEmailByLanguage('zh') + ' 联系。',
    enrollThankYou: '感谢您的注册。 <br /> <br /> 现在为艾达币兑换业务休止期间，待兑换业务重开时敝公司将再与您联系。',
    enrollThankYouInvoice: '感谢您的注册。 <br />稍后请款单将会发送至您注册的电邮，请依内容指示进行操作。<br />银行汇款的请款单为约一小时、比特币付款为约六个工作天内发送，届时若未收到请款单烦请与敝司客服联系确认。',
    enrollThankYouDistributor: '感谢您的注册。 <br /> <br /> 稍后注册确认邮件将会发送至您的电邮。<br />信件发送可能约需一个小时的时间, 若届时未收到信件，烦请与 ' + getSupportEmailByLanguage('zh') + ' 联系。',
    thankYouSubmit: '您的帐号目前待' + getCompanyInfoByLanguage('zh').companyName + '认证中。 <br /> 认证完成前无法进行任何操作，烦请见谅。<br/>正常情况下于六个工作天内会发送认证结果到您注册的电邮。',
    thankYouPurchase: '感谢您的兑换。稍后请款单将会发送至您的电邮。若兑换金额超过每日美金4,800元、每月美金24,000元、以及以比特币支付的情况，由于敝司手续上的关系，需要较长时间发行请款单。',
    limitApprovalNotice: '您所兑换的金额为需要进行认证确认，敝司于认证完成后与您联系。',
    buyer: '您的帐号已被认证。在兑换业务期间通常三个工作天内会收到来自敝司的电邮。收到电邮后，您将可以正式进行艾达币兑换手续。',
    rejectionNotice: '您的帐户发生问题',
    adminAdded: '已新增管理员',
    reorderThankYou: '感谢您的兑换<br /> <br />您即将会收到确认电邮，烦请查收。',
    customerServiceOfficerAdded: '已新增客服人员',
    salesOver: getProductNameByLanguage('zh') + '的预售已完满结束，感谢各位的支持和爱戴。',
  }
});
