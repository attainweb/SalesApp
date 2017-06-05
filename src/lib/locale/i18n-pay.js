import { getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  pay: {
    usdRequested: 'Requested Amount (USD)',
    noTicketFound: 'Your ' + getProductNameByLanguage('en') + ' transaction has been completed.',
    warning: 'Warning',
    warningText: 'Please complete the transaction with a single payment. Any additional payments will not be converted into ' + getProductNameByLanguage('en') + '.',
  },
  payBtc: {
    header: 'Pay with Bitcoin',
    btcExpected: 'Bitcoins to Pay',
    btcExpectedPrice: 'Bitcoin Price',
    btcAddress: 'Send Bitcoins to',
    countdown: 'You have <strong>{$1}</strong> seconds left to pay the above price. After that the price will be automatically recalculated.',
  },
  payBank: {
    header: 'Pay by Bank Transfer',
    payToAccount: 'Send Money to',
    accountInfo: `&nbsp;&nbsp;〈BANK 1〉<br>
    【Bank Name】${getCompanyInfoByLanguage('en').bankAccounts[0].name}<br>
    【Account Type】${getCompanyInfoByLanguage('en').bankAccounts[0].accountType}<br>
    【Branch Name】${getCompanyInfoByLanguage('en').bankAccounts[0].branchName}<br>
    【Account Number】${getCompanyInfoByLanguage('en').bankAccounts[0].accountNumber}<br>
    【Transfer Destination】${getCompanyInfoByLanguage('en').bankAccounts[0].transferDestination}<br>
    <br>
    〈BANK 2〉<br>
    【Bank Name】${getCompanyInfoByLanguage('en').bankAccounts[1].name}<br>
    【Account Type】${getCompanyInfoByLanguage('en').bankAccounts[1].accountType}<br>
    【Branch Name】${getCompanyInfoByLanguage('en').bankAccounts[1].branchName}<br>
    【Account Number】${getCompanyInfoByLanguage('en').bankAccounts[1].accountNumber}<br>
    【Transfer Destination】${getCompanyInfoByLanguage('en').bankAccounts[1].transferDestination}<br>`
  }
});

i18n.map('ja', {
  pay: {
    usdRequested: '交換希望額（米ドル）',
    noTicketFound: 'ありがとうございました。' + getProductNameByLanguage('ja') + 'の交換注文が完了いたしました。',
    warning: 'ご注意',
    warningText: '送金は必ず一度で行ってください。2度目以降の着金は' + getProductNameByLanguage('ja') + 'の交換に使用されません'
  },
  payBtc: {
    header: 'Bitcoinからの交換',
    btcExpected: '送金いただくBTC額',
    btcExpectedPrice: '現在適用されているレート（BTC/米ドル）',
    btcAddress: 'BTC送金先',
    countdown: '現在表示されているレートで交換を確定するためには、<strong>{$1}</strong>秒以内に送金していただく必要があります。時間切れになった場合は、レートが自動的に再計算されます。'
  },
  payBank: {
    header: '銀行振込での交換',
    payToAccount: '振込先:',
    accountInfo: `&nbsp;&nbsp;振込先情報1〉<br>
    【金融機関名】${getCompanyInfoByLanguage('ja').bankAccounts[0].name}<br>
    【支店番号】${getCompanyInfoByLanguage('ja').bankAccounts[0].branchName}<br>
    【口座番号】${getCompanyInfoByLanguage('ja').bankAccounts[0].accountNumber}<br>
    【振込先名義】${getCompanyInfoByLanguage('ja').bankAccounts[0].transferDestination}<br>
    <br>
    〈振込先情報2〉<br>
    【金融機関名】${getCompanyInfoByLanguage('ja').bankAccounts[1].name}<br>
    【支店番号】${getCompanyInfoByLanguage('ja').bankAccounts[1].branchName}<br>
    【口座番号】${getCompanyInfoByLanguage('ja').bankAccounts[1].accountNumber}<br>
    【振込先名義】${getCompanyInfoByLanguage('ja').bankAccounts[1].transferDestination}<br>`
  }
});

i18n.map('ko', {
  pay: {
    usdRequested: '교환 희망 금액(미국 달러)',
    noTicketFound: '감사합니다. 입금 대기 중인 ' + getProductNameByLanguage('ko') + ' 교환 주문이 완료되었습니다.',
    warning: '주의하실 점',
    warningText: '송금은 반드시 한 번만 해 주십시오. 두 번째 이후의 송금은 ' + getProductNameByLanguage('ko') + ' 교환에 사용되지 않습니다.',
  },
  payBtc: {
    header: '비트코인으로 교환',
    btcExpected: '송금해 주실 BTC 금액',
    btcExpectedPrice: '현재 적용된 환율（BTC/미국 달러）',
    btcAddress: 'BTC 송금처',
    countdown: '현재 표시되어 있는 환율로 교환을 확정하기 위해서는<strong>{$1}</strong>초 이내에 송금할 필요가 있습니다. 시간이 지난 경우에는 환율이 자동으로 재계산됩니다.',
  },
  payBank: {
    header: '은행 송금으로 교환',
    payToAccount: '송금처',
    accountInfo: `&nbsp;&nbsp;계좌 이체 은행 정보 1〉<br>
    【금융 기관명】${getCompanyInfoByLanguage('ko').bankAccounts[0].name}<br>
    【계좌종류】${getCompanyInfoByLanguage('ko').bankAccounts[0].accountType}<br>
    【지점번호】${getCompanyInfoByLanguage('ko').bankAccounts[0].branchName}<br>
    【계좌번호】${getCompanyInfoByLanguage('ko').bankAccounts[0].accountNumber}<br>
    【예금주】${getCompanyInfoByLanguage('ko').bankAccounts[0].transferDestination}<br>
    <br>
    〈계좌 이체 은행 정보 2〉<br>
    【금융 기관명】${getCompanyInfoByLanguage('ko').bankAccounts[1].name}<br>
    【계좌종류】${getCompanyInfoByLanguage('ko').bankAccounts[1].accountType}<br>
    【지점번호】${getCompanyInfoByLanguage('ko').bankAccounts[1].branchName}<br>
    【계좌번호】${getCompanyInfoByLanguage('ko').bankAccounts[1].accountNumber}<br>
    【예금주】${getCompanyInfoByLanguage('ko').bankAccounts[1].transferDestination}<br>`
  }
});

i18n.map('zh', {
  pay: {
    usdRequested: '希望兑换金额(美金)',
    noTicketFound: '非常感谢您的兑换,您的艾达币兑换订单尚待汇款后便可完成。',
    warning: '请注意',
    warningText: '请务必进行一次性汇款，第二次及之后的汇款将不能用作兑换艾达币。'
  },
  payBtc: {
    header: '以比特币兑换',
    btcExpected: 'BTC汇款金额',
    btcExpectedPrice: '即时汇率(BTC/美金)',
    btcAddress: 'BTC汇款地址',
    countdown: '确认以现在汇率兑换，必须于<strong>{$1}</strong>秒之内完成汇款。逾时汇率将自动重新计算。',
  },
  payBank: {
    header: '银行转帐',
    payToAccount: '汇款至',
    accountInfo: `&nbsp;&nbsp;汇款户口1〉<br>
    【银行名称】${getCompanyInfoByLanguage('zh').bankAccounts[0].name}<br>
    【分店号码】${getCompanyInfoByLanguage('zh').bankAccounts[0].branchName}<br>
    【户口号码】${getCompanyInfoByLanguage('zh').bankAccounts[0].accountNumber}<br>
    【户口名称】${getCompanyInfoByLanguage('zh').bankAccounts[0].transferDestination}<br>
    <br>
    〈汇款户口2〉<br>
    【银行名称】${getCompanyInfoByLanguage('zh').bankAccounts[1].name}<br>
    【分店号码】${getCompanyInfoByLanguage('zh').bankAccounts[1].branchName}<br>
    【户口号码】${getCompanyInfoByLanguage('zh').bankAccounts[1].accountNumber}<br>
    【户口名称】${getCompanyInfoByLanguage('zh').bankAccounts[1].transferDestination}<br>`
  }
});
