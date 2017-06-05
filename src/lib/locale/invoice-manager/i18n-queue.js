// i18n_purchase_product.js
import { getProductNameByLanguage } from '../../../imports/lib/settings';

i18n.map('en', {
  invoiceManager: {
    tabFilter: {
      salePending: "Sale Pending",
      unpaidInvoices: "Unpaid Invoices",
      confirmBankAmount: "Confirm Bank Amount",
      sentToBankChecker: "Sent to Bank Checker",
      prepareBundle: "Prepare Bundle",
      currentBundle: "Current Bundle",
      bundle: "Bundles",
      'export': "Export",
      expired: "Expired",
      invalidFundsReceived: 'Invalid Funds Received',
      btcOrders: "BTC Orders",
      receiptSent: "Receipt Sent",
      forceReserve: 'Force Reserve ' + getProductNameByLanguage('en')
    },
    searchBarCategories: {
      invoiceNumber: "Invoice Number",
      buyerId: "Buyer Id",
      invoiceTransactionId: "Invoice Transaction Id",
      payoutTransactionId: "Payout Transaction Id",
      btcAddress: "Invoice Wallet",
      bank: "Bank",
    }
  }
});

i18n.map('ja', {
  invoiceManager: {
    tabFilter: {
      salePending: "セールペンディング",
      unpaidInvoices: "未支払いの請求書",
      confirmBankAmount: "振込金額を確認する",
      sentToBankChecker: "バンクチェッカーに送る",
      prepareBundle: "バンドルを作成",
      currentBundle: "現在のバンドル",
      bundle: "バンドル一覧",
      'export': "エクスポート",
      expired: "期限切れ",
      invalidFundsReceived: '無効な入金',
      btcOrders: "BTC注文",
      receiptSent: "送信済み領収書",
      forceReserve: getProductNameByLanguage('ja') + 'をリザーブする',
    },
    searchBarCategories: {
      invoiceNumber: "請求書ID",
      buyerId: "交換希望者ID",
      invoiceTransactionId: "請求書取引ID",
      payoutTransactionId: "支払い取引ID",
      btcAddress: "インボイスウォレット",
      bank: "銀行",
    }
  }
});

i18n.map('ko', {
  invoiceManager: {
    tabFilter: {
      salePending: "판매 보류",
      unpaidInvoices: "미결제 청구서",
      confirmBankAmount: "송금 금액을 확인",
      sentToBankChecker: "Bank Checker에게 보내기",
      prepareBundle: "번들 작성",
      currentBundle: "현재 번들",
      bundle: "번들 목록",
      'export': "발송",
      expired: "기한 만료",
      invalidFundsReceived: '무효인 입금',
      btcOrders: "BTC 주문",
      receiptSent: "송신한 영수증",
      forceReserve: getProductNameByLanguage('ko') + '를 예약하기'
    },
    searchBarCategories: {
      invoiceNumber: "청구서 ID",
      buyerId: "교환 희망자 ID",
      invoiceTransactionId: "청구서 거래 ID",
      payoutTransactionId: "결제 거래 ID",
      invoiceWallet: "인보이스 월렛",
      bank: "은행",
    }
  }
});

i18n.map('zh', {
  invoiceManager: {
    tabFilter: {
      salePending: "保留中的订单",
      unpaidInvoices: "未付款的请款单",
      confirmBankAmount: "确认汇款金额",
      sentToBankChecker: "发给汇款确认者",
      prepareBundle: "准备批次",
      currentBundle: "现时批次",
      bundle: "批次",
      'export': "汇出",
      expired: "逾期",
      invalidFundsReceived: '无效汇款',
      btcOrders: "比特币订单",
      receiptSent: "已发出的收据",
      forceReserve: '强制保留' + getProductNameByLanguage('zh')
    },
    searchBarCategories: {
      invoiceNumber: "请款单ID",
      buyerId: "兑换者ID",
      invoiceTransactionId: "请款单交易ID",
      payoutTransactionId: "支出交易ID",
      invoiceWallet: "请款单钱包",
      bank: "银行",
    }
  }
});
