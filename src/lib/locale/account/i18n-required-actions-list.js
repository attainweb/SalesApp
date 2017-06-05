import { getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  requiredActionsList: {
    heading: 'Next Steps',
    description: 'You must complete the following steps:',
    walletAddressNotice: 'Please enter your Bitcoin wallet address so that you can start earning commissions.',
  }
});

i18n.map('ja', {
  requiredActionsList: {
    heading: '次のステップ',
    description: getProductNameByLanguage('ja') + 'の交換取次、または交換を行って頂くには' + getCompanyInfoByLanguage('ja').companyName + 'の承認が必要になります。承認を受けるには、以下の手順に従ってください。',
    walletAddressNotice: 'コミッション受け取り用のBitcoinウォレットのアドレスを入力する'
  }
});

i18n.map('ko', {
  requiredActionsList: {
    heading: '다음 스텝',
    description: getProductNameByLanguage('ko') + '의 교환 중개 및 교환을 하기 위해서는' + getCompanyInfoByLanguage('ko').companyName + '의 승인이 필요합니다. 승인을 받으려면 다음 단계를 따르십시오.',
    walletAddressNotice: '커미션 수취에 대한 비트코인 월렛 주소를 입력하기.',
  }
});

i18n.map('zh', {
  requiredActionsList: {
    heading: '下一步',
    description: '认证完成后才能兑换艾达币，请依照以下步骤进行认证申请程序。',
    walletAddressNotice: '请输入收取佣金用之比特币钱包地址。',
  }
});
