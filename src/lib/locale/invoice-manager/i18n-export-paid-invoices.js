i18n.map('en', {
  exportPaidInvoices: {
    title: 'Currently you have {$1} paid orders with the amount of {$2} to be exported',
    noPaidOrders: 'There are no paid orders at the moment so you cannot create a new payment export right now',
    requiredFieldsMessage: 'BTC/USD exchange rate is required',
    buttons: {
      save: 'Bundle Payments for Export',
      finalize: 'Finalize Payments Bundle',
    },
    table: {
      exportIndex: 'Export #',
      exportId: 'Export ID',
      holdingWallet: 'Holding Wallet Address',
      count: 'Sales',
      finalizedAt: 'Finalized Timestamp',
      totalAmount: 'Total Amount',
      downloadAction: 'Download',
    },
    errors: {
      unauthorized: 'Unauthorized',
      missingHoldingWallet: 'Payment Export must have a holding wallet address prior to bundling',
      bundleIsEmpty: "Payment Bundle must have at least one invoice ticket",
    }
  }
});

i18n.map('ja', {
  exportPaidInvoices: {
    title: '現在、{$2}分の{$1}件の注文がエクスポート待ちです',
    noPaidOrders: '入金確認済の注文はありません。エクスポートは、入金確認済の注文がある時のみ行えます。',
    requiredFieldsMessage: 'BTC/JPY、またはBTC/USDのレートが必要です',
    buttons: {
      save: '入金バッチのエクスポート',
      finalize: '入金バッチを確定する'
    },
    table: {
      exportIndex: 'エクスポート#',
      exportId: 'エクスポートID',
      holdingWallet: 'ウォレットのアドレス',
      count: '注文数',
      finalizedAt: '最終タイムスタンプ',
      totalAmount: '合計金額',
      downloadAction: '再ダウンロード'
    },
    errors: {
      unauthorized: '権限がありません。',
      missingHoldingWallet: 'バンドル作成前にエクスポートを行うウォレットアドレスを入力してください',
      bundleIsEmpty: "バンドルは少なくとも１つ以上の請求書が必要です。",
    }
  }
});

i18n.map('ko', {
  exportPaidInvoices: {
    title: '현재, {$1} 분의 {$2} 개의 주문 발송을 기다리는 중입니다.',
    noPaidOrders: '입금이 확인된 주문은 없습니다. 발송은 입금확인 후 주문이 있을 시에만 이뤄집니다.',
    requiredFieldsMessage: 'BTC/JPY, 또는BTC/USD 환율이 필요합니다.',
    buttons: {
      save: '입금 배치의 발송',
      finalize: '입금 배치를 확정하기'
    },
    table: {
      exportIndex: '발송 #',
      exportId: '발송 ID',
      holdingWallet: '월렛 어드레스',
      count: '주문 수량',
      finalizedAt: '최종 타임스탬프',
      totalAmount: '합계 금액',
      downloadAction: '재다운로드',
    },
    errors: {
      unauthorized: '권한이 없음',
      missingHoldingWallet: '번들(Bundle)작성 전에 내보낼 월렛 어드레스를 입력해 주십시오.',
      bundleIsEmpty: "번들(Bundle)은 적어도 하나　이상의 청구서가 필요합니다.",
    }
  }
});

i18n.map('zh', {
  exportPaidInvoices: {
    title: '在有 {$1} 份订单，金额为{$2}待汇出。',
    noPaidOrders: '没有已入帐的订单，需有已入帐的订单才可汇出。',
    requiredFieldsMessage: 'BTC/JPY、或BTC/USD的汇率为必需值。',
    buttons: {
      save: '入帐档案汇出',
      finalize: '确认入帐档案',
    },
    table: {
      exportIndex: '汇出#',
      exportId: '汇出 ID',
      holdingWallet: '钱包地址',
      count: '订单数',
      finalizedAt: '最后时间轴',
      totalAmount: '总金额',
      downloadAction: '下载',
    },
    errors: {
      unauthorized: '未得到授权',
      missingHoldingWallet: '档案汇出前请先设定钱包地址',
      bundleIsEmpty: "支付档案必须最少有一张请款单",
    }
  }
});
