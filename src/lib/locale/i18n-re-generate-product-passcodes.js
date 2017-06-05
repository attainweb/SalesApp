import { getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  reGenerateProductPasscodes: {
    buttonMessage: 'Regenerate ' + getProductNameByLanguage('en') + ' codes',
    success: {
      request: 'A confirmation email was sent to your registered email address.',
      confirmAll: 'Your ' + getProductNameByLanguage('en') + ' passcodes was regenerated successfully',
      confirmOne: 'Your ' + getProductNameByLanguage('en') + ' passcode was regenerated successfully',
    },
    errors: {
      unauthorized: 'Unauthorized',
      refCodeNotValid: 'Ref code not valid',
      alreadyRetrieved: 'This invoice has been already retrieved through the ' + getCompanyInfoByLanguage('en').companyName + ' Vending Machine so ' + getProductNameByLanguage('en') + ' Passcode cannot be regenerated. '
    }
  }
});

i18n.map('ja', {
  reGenerateProductPasscodes: {
    buttonMessage: '全ての' + getProductNameByLanguage('ja') + '還元用コードを再生成する',
    success: {
      request: 'ご登録のメールアドレスに確認メールを送信しました',
      confirmAll: 'あなたの' + getProductNameByLanguage('ja') + '還元用コードが再生成されました',
      confirmOne: 'あなたの' + getProductNameByLanguage('ja') + '還元用コードが再生成されました',
    },
    errors: {
      unauthorized: '権限がありません',
      refCodeNotValid: '無効な参照コードです',
      alreadyRetrieved: ' この請求書は既にベンディングマシンで還元されているため' + getProductNameByLanguage('ja') + '還元用コードを再生成できません',
    }
  }
});

i18n.map('ko', {
  reGenerateProductPasscodes: {
    buttonMessage: '' + getProductNameByLanguage('ko') + ' 코드를 재생성',
    success: {
      request: '등록하신 메일 어드레스로 확인 메일을 보냈습니다.',
      confirmAll: '귀하의 ' + getProductNameByLanguage('ko') + ' 코드가 재작성되었습니다.',
      confirmOne: '귀하의 ' + getProductNameByLanguage('ko') + ' 코드가 재작성되었습니다.',
    },
    errors: {
      unauthorized: '권한이 없습니다.',
      refCodeNotValid: '무효한 참조 코드입니다.',
      alreadyRetrieved: '이 청구서는 이미 벤딩 머신에서 환원되었으므로 ' + getProductNameByLanguage('ko') + ' 코드를 다시 만들 수 없습니다.'
    }
  }
});

i18n.map('zh', {
  reGenerateProductPasscodes: {
    buttonMessage: '再发行' + getProductNameByLanguage('zh') + '换领码',
    success: {
      request: '确认邮件已发送到您的邮箱',
      confirmAll: '已成功再发行所有' + getProductNameByLanguage('zh') + '换领码',
      confirmOne: '已成功再发行' + getProductNameByLanguage('zh') + '换领码',
    },
    errors: {
      unauthorized: '未得到授权',
      refCodeNotValid: '介绍用连结无效',
      alreadyRetrieved: '发票已在' + getCompanyInfoByLanguage('zh').companyName + '还元系统换领完毕，所以' + getProductNameByLanguage('zh') + '换领码未能再发行'
    }
  }
});
