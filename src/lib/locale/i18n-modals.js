import { getSupportEmailByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  modals: {
    accountInfo: {
      updateWalletAddress: 'Update Wallet Address',
      changeEmail: {
        title: 'Change Email Address',
        inputLabel: 'New Email Address',
        warning: 'A confirmation email will be sent to your currently registered as well as new email addresses. To complete the process you must have access to both email accounts',
        errors: {
          unauthorized: 'You are no authorized to perform this action',
          sameEmail: 'That\'s already your email address',
          emailAlreadyExists: 'That email is already registered. Please contact ' + getSupportEmailByLanguage('en') + ' if you have another account.',
          invalidInput: 'That doesn\'t seems to be a valid email address',
          hasPiiHash: 'You currently have invoice tickets containing PII hash, which prevents you to edit your email address',
        },
        successMessage: 'A confirmation email was sent to your new email address.'
      }
    },
    buttons: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmReject: 'Reject',
      update: 'Update',
      regenerate: 'Regenerate',
    },
    confirmPayment: 'Are you sure you want to confirm that these funds were received?',
    invoiceNumber: 'Invoice #{$1}',
    requested: 'USD Requested: {$1}',
    received: 'Yen Received: {$1}',
    bank: 'Bank: {$1}',
    sendBack: 'Are you sure you want to reject this Funds Received Record?',
    approveInvalidFundsModal: 'Are you sure you want to approve this invoice with Invalid Funds?',
    refundInvalidFundsModal: 'Confirm ticket Refund',
    addToExport: 'Add this ticket to the next export?',
    removeFromExport: 'Remove this ticket from the next export?',
    reviveTicket: 'Are you sure you want to restore this ticket?',
    cancelTicket: 'Are you sure you want to cancel this ticket?',
    forceReserve: 'Are you sure you want to force this ticket to reserve ' + getProductNameByLanguage('en') + '?',
    regenerateProductCode: 'This action will invalidate the previous received ' + getProductNameByLanguage('en') + ' code for this ticket invoice. After confirming your email-address, a new ' + getProductNameByLanguage('en') + ' code will be sent to your email-address shortly after. Do you want to continue?',
    deleteDocFile: {
      confirmMessage: 'Are you sure you want to remove the file?',
      confirmButton: 'Yes'
    },
    regenerateProductCodes: 'Are you sure you want to regenerate all your product codes? WARNING: This will invalidate all your current passcodes and generate a new ones.',
  }
});

i18n.map('ja', {
  modals: {
    accountInfo: {
      updateWalletAddress: 'ウォレットアドレスを変更する',
      changeEmail: {
        title: 'メールアドレスを変更する',
        inputLabel: '新しいメールアドレス',
        warning: 'このアクションにより' + getProductNameByLanguage('ja') + '還元用コードが再生成されます。 ご登録済みのメールアドレスおよび新しくご登録されるメールアドレス両方に送信される確認メールをご確認ください。',
        errors: {
          unauthorized: 'このアクションを実行する権限がありません',
          sameEmail: '既にご登録されているメールアドレスです',
          emailAlreadyExists: '既にご登録されているメールアドレスです。既にアカウントをお持ちの場合はカスタマーサポートにお問い合わせください。',
          invalidInput: '有効なメールアドレスではありません',
          hasPiiHash: '請求書にPIIハッシュが含まれているためメールアドレスを編集できません',
        },
        successMessage: '新しいメールアドレスに確認メールを送信しました'
      }
    },
    buttons: {
      cancel: 'キャンセル',
      confirm: 'はい',
      confirmReject: '本当に拒否する',
      update: '変更',
      regenerate: '再生成',
    },
    confirmPayment: '本当にこの入金を確認済みにしても良いですか？',
    invoiceNumber: '請求書#{$1}',
    requested: '請求分米ドル: {$1}',
    received: '入金分日本円: {$1}',
    bank: '銀行: {$1}',
    sendBack: '本当にこの入金を、入金待ちに戻しても良いですか？',
    approveInvalidFundsModal: '無効な入金が確認されています。本当にこの請求書を承認しますか？',
    refundInvalidFundsModal: '返金確認',
    addToExport: 'このチケットをバッチに追加しますか?',
    removeFromExport: 'このチケットをバッチから削除しますか?',
    reviveTicket: 'このチケットを復活しますか？',
    cancelTicket: '本当にこのチケットをキャンセルしますか？',
    forceReserve: '本当にこのチケットを使用して' + getProductNameByLanguage('ja') + 'をリザーブしますか？',
    regenerateProductCode: '本当に' + getProductNameByLanguage('ja') + '還元用コードを再生成しますか？ 警告: このアクションは既存のコードを無効にし新しいコードを生成します。',
    deleteDocFile: {
      confirmMessage: '本当にこのファイルを削除しますか？',
      confirmButton: 'はい'
    },
    regenerateProductCodes: '本当に全ての' + getProductNameByLanguage('ja') + '還元用コードを再生成しますか？ 警告: このアクションは既存のコードを無効にし新しいコードを生成します。',
  }
});

i18n.map('ko', {
  modals: {
    accountInfo: {
      updateWalletAddress: '월렛 어드레스를 변경 하기',
      changeEmail: {
        title: '메일 어드레스 변경',
        inputLabel: '새 메일 어드레스',
        warning: '새 메일 어드레스와 기존 메일 어드레스에 확인 메일이 송신되었으므로 양쪽 다 확인해 주십시오.',
        errors: {
          unauthorized: '이 작업을 수행할 수 있는 권한이 없습니다.',
          sameEmail: '이미 사용 중인 메일 어드레스입니다.',
          emailAlreadyExists: '이미 사용 중인 메일 어드레스입니다. 다른 메일 어드레스를 등록하시려면 커스터머 서비스로 문의해 주십시오.',
          invalidInput: '유효한 메일 어드레스가 아닙니다.',
          hasPiiHash: '현재, PII 해시가 포함된 청구서 티켓이 있으므로 메일 어드레스를 수정할 수 없습니다.',
        },
        successMessage: '새 메일 어드레스로 변경 사항 확인 메일을 보냈습니다.'
      }
    },
    buttons: {
      cancel: '캔슬',
      confirm: '승인',
      confirmReject: '거부하기',
      update: '변경',
      regenerate: '재생성',
    },
    confirmPayment: '정말로 이 입금을 확인완료해도 괜찮습니까?',
    invoiceNumber: '청구서 #{$1}',
    requested: '청구 분 미국 달러: {$1}',
    received: '입금 분 일본 엔: {$1}',
    bank: '은행: {$1}',
    sendBack: '정말로 이 입금을 입금 대기 중으로 바꿔도 괜찮습니까?',
    approveInvalidFundsModal: '무효한 청구서입니다. 정말로 이 청구서를 진행하겠습니까?',
    refundInvalidFundsModal: '티켓 환불 확인',
    addToExport: '이 티켓을 배치(batch)에 첨가합니까?',
    removeFromExport: '이 티켓을 배치(batch)에서 삭제합니까?',
    reviveTicket: '이 티켓을 복구 합니까?',
    cancelTicket: '정말 이 티켓을 취소하시겠습니까?',
    forceReserve: '정말로 이 티켓을 사용하여 에이다를 예약하시겠습니까?',
    regenerateProductCode: '이 작업은 이 티켓 ' + getProductNameByLanguage('ko') + ' 코드를 무효로 합니다. 등록한 메일 어드레스로 송신되는 새 코드를 승인 후, 확인 메일이 송신됩니다.',
    deleteDocFile: {
      confirmMessage: '정말로 이 파일을 삭제하겠습니까?',
      confirmButton: '네'
    },
    regenerateProductCodes: '정말로 모든 ' + getProductNameByLanguage('ko') + ' 코드를 재생성하겠습니까? 경고: 이 작업은 모든 코드를 무효로 하여, 새 코드를 생성합니다.',
  }
});

i18n.map('zh', {
  modals: {
    accountInfo: {
      updateWalletAddress: '变更钱包地址',
      changeEmail: {
        title: '变更电邮地址',
        inputLabel: '新电邮地址',
        warning: '确认邮件会发送至您的新和旧邮箱，两封邮件也需确认。',
        errors: {
          unauthorized: '您没被授权进行此操作',
          sameEmail: '这是您已注册的电邮',
          emailAlreadyExists: '此电邮已被注册，如您有另一帐户请联系客服。',
          invalidInput: '此为无效电邮',
          hasPiiHash: '您现有包含PII散列的请款单，因此被阻止修正邮箱地址。',
        },
        successMessage: '变更确认电邮已发送至您的新邮箱'
      }
    },
    buttons: {
      cancel: '取消',
      confirm: '确认',
      confirmReject: '确认拒绝',
      update: '变更',
      regenerate: '再发行',
    },
    confirmPayment: '确认标志此笔入帐为已完成吗?',
    invoiceNumber: '请款单#{$1}',
    requested: '美金请款金额: {$1}',
    received: '日元请款金额: {$1}',
    bank: '银行汇款: {$1}',
    sendBack: '确认将此笔入帐送回待确认入帐頁面吗?',
    approveInvalidFundsModal: '确认承认此笔支付无效的发票吗？',
    refundInvalidFundsModal: '确认退款',
    addToExport: '确认新增此笔资料至批次档案吗?',
    removeFromExport: '确认从批次档案删除此笔资料吗?',
    reviveTicket: '确认复原此笔资料吗?',
    cancelTicket: '确认删除此笔资料吗?',
    forceReserve: '确认强制保留此订单的' + getProductNameByLanguage('zh') + '?',
    regenerateProductCode: '此程序会将此请款单的旧' + getProductNameByLanguage('zh') + '换领码变为无效。稍后确认邮件会发送至您的邮箱，确认邮件后新的换领码会再发送给您，如需继续请确认。',
    deleteDocFile: {
      confirmMessage: '确认删除此笔资料吗?',
      confirmButton: '确认'
    },
    regenerateProductCodes: '确认需再发行所有' + getProductNameByLanguage('zh') + '换领码吗？警告：此程序会将所有现有换领码变为无效并重新发行新的换领码。',
  }
});
