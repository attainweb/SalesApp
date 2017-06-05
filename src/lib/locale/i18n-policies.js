import { getProductNameByLanguage } from '../../imports/lib/settings';

i18n.map('en', {
  policies: {
    PRIVACY: 'Privacy Policy',
    RISK: 'Possible Risks',
    TOC: 'User Policy'
  }
});

i18n.map('ja', {
  policies: {
    PRIVACY: '個人情報保護方針',
    RISK: getProductNameByLanguage('ja') + 'の交換取引に関するリスク',
    TOC: '利用規約'
  }
});

i18n.map('ko', {
  policies: {
    PRIVACY: '개인 정보 취급방침',
    RISK: getProductNameByLanguage('ko') + ' 교환 거래에 관한 리스크',
    TOC: '이용 약관',
  }
});

i18n.map('zh', {
  policies: {
    PRIVACY: '个人资料保护方针',
    RISK: '风险说明',
    TOC: '利用条款',
  }
});
