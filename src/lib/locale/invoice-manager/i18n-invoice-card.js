import { getProductNameByLanguage } from '../../../imports/lib/settings';

i18n.map('en', {
  invoiceCard: {
    name: 'Name',
    buttons: {
      cancel: 'Cancel',
      fundsReceived: 'Funds Received',
      confirmPayment: 'Confirm Payment',
      markUnpaid: 'Mark Unpaid',
      addToExport: 'Add to Export',
      removeFromExport: 'Remove from Export',
      save: 'Save',
      edit: 'Edit',
      forceReserve: 'Force reserve ' + getProductNameByLanguage('en'),
      regenerateProductCode: 'Regenerate ' + getProductNameByLanguage('en') + ' Code',
      approveInvalidFunds: 'Approve Ticket',
      refundInvalidFunds: 'Mark as Refunded'
    },
    dates: {
      createdAt: 'Created At',
      sent: 'Sales Invite Sent Date',
      received: 'Funds Received Date',
    },
    buyerId: 'Buyer ID',
    state: 'State',
    paymentOption: 'Payment Method',
    invoiceNumber: 'Invoice #',
    btcAddress: 'Invoice Wallet Address',
    amount: 'Ordered Amount',
    yenReceived: 'Yen Received',
    satoshisExpected: 'Satoshis Expected',
    satoshisReceived: 'Satoshis Received',
    productPasscodeGenerations: getProductNameByLanguage('en') + ' Passcode Generations',
    commentBox: {
      comments: 'Comments',
      noComments: 'No comments',
    },
    selector: {
      selectBank: "Select a bank",
    },
  }
});

i18n.map('ja', {
  invoiceCard: {
    name: '氏名',
    buttons: {
      cancel: 'キャンセル',
      fundsReceived: '入金を確認',
      confirmPayment: '入金を再確認',
      markUnpaid: '入金待ちに変更',
      addToExport: 'バッチに加える',
      removeFromExport: 'バッチから外す',
      save: '保存',
      edit: '編集',
      forceReserve: getProductNameByLanguage('ja') + 'をリザーブする',
      regenerateProductCode: getProductNameByLanguage('ja') + '還元用コードを再生成する',
      approveInvalidFunds: 'チケットを承認する',
      refundInvalidFunds: '返金済にする'
    },
    dates: {
      createdAt: '作成日時',
      sent: '交換権送信日時',
      received: '入金日時'
    },
    buyerId: '交換希望者ID',
    state: '承認状況',
    paymentOption: '支払い方法',
    invoiceNumber: '請求書ID',
    btcAddress: '請求書用ウォレットアドレス',
    amount: '金額',
    yenReceived: '入金額（日本円）',
    satoshisExpected: 'サトシでの金額',
    satoshisReceived: '受け取ったサトシ',
    productPasscodeGenerations: getProductNameByLanguage('ja') + '還元用コード生成',
    commentBox: {
      comments: 'コメント',
      noComments: 'ノーコメント',
    },
    selector: {
      selectBank: "銀行を選択",
    },
  }
});

i18n.map('ko', {
  invoiceCard: {
    name: '성함',
    buttons: {
      cancel: '캔슬',
      fundsReceived: '입금확인',
      confirmPayment: '입금재확인',
      markUnpaid: '입금대기 변경',
      addToExport: '출력을 가함',
      removeFromExport: '출력을 빼냄',
      save: '저장',
      edit: '편집',
      forceReserve: getProductNameByLanguage('ko') + '를 예약하기',
      regenerateProductCode: getProductNameByLanguage('ko') + ' 코드 재생성',
      approveInvalidFunds: '티켓 승인하기',
      refundInvalidFunds: '환불 완료하기'
    },
    dates: {
      createdAt: '삭제 일시',
      sent: '교환권 송신 일시',
      received: '입금 일시',
    },
    buyerId: '교환 희망자 ID',
    state: '국가',
    paymentOption: '결제 방법',
    invoiceNumber: '청구서 ID',
    btcAddress: '청구서용 월렛 어드레스',
    amount: '금액',
    yenReceived: '임금액(일본 엔)',
    satoshisExpected: '사토시(satoshi) 금액',
    satoshisReceived: '받은 사토시(satoshi) 금액',
    productPasscodeGenerations: getProductNameByLanguage('ko') + ' 코드 생성',
    commentBox: {
      comments: '코멘트',
      noComments: '코멘트 없음',
    },
    selector: {
      selectBank: "은행을 선택",
    },
  }
});

i18n.map('zh', {
  invoiceCard: {
    name: '姓名',
    buttons: {
      cancel: '取消',
      fundsReceived: '确认入帐',
      confirmPayment: '再确认入帐',
      markUnpaid: '变更待入帐项目',
      addToExport: '新增档案汇出',
      removeFromExport: '删除汇出档案',
      save: '储存',
      edit: '编辑',
      forceReserve: '强制保留' + getProductNameByLanguage('zh'),
      regenerateProductCode: '再汇出' + getProductNameByLanguage('zh') + '换领码',
      approveInvalidFunds: '承认订单',
      refundInvalidFunds: '标誌为退款'
    },
    dates: {
      createdAt: '制作日期',
      sent: '邀请兑换日期',
      received: '入帐日期'
    },
    buyerId: '兑换者ID',
    state: '国',
    paymentOption: '付款方式',
    invoiceNumber: '请款单ID',
    btcAddress: '请款单用钱包地址',
    amount: '订单金额',
    yenReceived: '入帐金额(日元)',
    satoshisExpected: '希望兑换satoshi金额',
    satoshisReceived: '入帐satoshi金额',
    productPasscodeGenerations: '汇出' + getProductNameByLanguage('zh') + '换领码',
    commentBox: {
      comments: '备注',
      noComments: '沒有备注',
    },
    selector: {
      selectBank: "选择银行",
    },
  }
});
