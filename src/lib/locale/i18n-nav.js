import { getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  mobileNav: {
    title: getCompanyInfoByLanguage('en').companyName + ' Dashboard',
    logout: 'Logout'
  }
});

i18n.map('ja', {
  mobileNav: {
    title: getCompanyInfoByLanguage('ja').companyName + '・' + getProductNameByLanguage('ja') + '交換取次システム ダッシュボード',
    logout: 'ログアウト'
  }
});

i18n.map('ko', {
  mobileNav: {
    title: getCompanyInfoByLanguage('ko').companyName + ', ' + getProductNameByLanguage('ko') + ' 교환 중개 시스템 대시보드(dashboard)',
    logout: '로그아웃',
  }
});

i18n.map('zh', {
  mobileNav: {
    title: getCompanyInfoByLanguage('zh').companyName + '·' + getProductNameByLanguage('zh') + '兑换系统管理平台',
    logout: '登出',
  }
});
