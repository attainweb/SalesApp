import { getCompanyInfoByLanguage, getProductNameByLanguage } from '/imports/lib/settings';

i18n.map('en', {
  enroll: {
    step: {
      1: 'STEP 1',
      2: 'STEP 2',
      3: 'STEP 3',
      4: 'STEP 4',
    },
    next: 'Next',
    back: 'Back',
    confirm: 'Confirm',

    stepResidenceSelection: 'Enrollment form - Residence country',
    stepContactInformation: 'Enrollment form - User information',
    stepAssignments: 'Enrollment form - Policy agreement',
    stepDocuments: 'Enrollment form - Upload ID documents',

    residenceSelection: {
      residenceCountry: '居住国/거주 국가/居住地/Your Country of Residence',
      language: '言語/사용 언어/使用語言/Your Language',
      agreedToDocumentsInEnglish: 'I understand that all legal documents are available in English only',
    },
    accountType: 'Account Type',
    accountTypePersonal: 'Individual',
    accountTypeCompany: 'Corporation',
    name: 'First Name',
    surname: 'Last Name',
    companyName: 'Corporation Name',
    registrationDate: 'Registration Date',
    email: 'Email Address',
    emailCheck: 'Please re-enter your email address',
    emailMismatch: 'Your entered email address does not match',
    emailVerificationCode: 'Email Verification Code',
    sendEmailVerificationCode: 'Receive code',
    reSendEmailVerificationCode: 'Click to receive again',
    emailVerificationCodeSent: 'An email was sent to {$1} with the code. If you don\'t receive it in 60 seconds please use another account as we won\'t be able to contact you. Don\'t forget to check spam folder',
    confirmEmailVerificationCode: 'Confirm code',
    resetEmail: 'Reset email',
    domainBlacklisted: 'Your entered domain is not available',
    notInWhiltelist: 'If you do not receive an email from us shortly, please check your spam folder. Warning: The email domain you are using may not be accessible by our system',
    phone: 'Phone Number',
    birthdate: 'Birthdate',
    zip: 'Zip Code',
    zipApiFail: 'Is this zip code correct?',
    state: 'State',
    city: 'City',
    address: 'Address',
    paymentMethod: 'Payment Method',
    paymentMethodBank: 'Bank Transfer',
    paymentMethodBtc: 'Bitcoin',
    units: 'Please enter the USD amount you wish to exchange into ' + getProductNameByLanguage('en'),
    codeCheckboxLabel: 'I agree to the User Policy',
    riskPolicyCheckboxLabel: 'I understand the Risks',
    privacyCheckboxLabel: 'I agree to the Privacy Policy',
    governmentId: 'ID Document',

    documentUpload: {
      subtitle: 'Identity verification will be required for your account to be approved.',
      notUploaded: 'No files uploaded yet!',
      uploadWarning: {
        JP: 'Do not upload your My Number document',
      },
      uploadWarningCheckbox: {
        JP: 'Check to confirm that you are not uploading a My Number document',
      }
    },

    errors: {
      'email-exists': 'The email address already exists',
      'idDocumentNumber-exists': 'Id document number already exists',
      'invalid-ref-code': 'Invite link is invalid',
      'role-not-allowed': 'Not allowed to create User with Roles: {$1}',
      'role-invalid': 'Invalid role value',
      'email-verification-invalid-code': 'Invalid email verification code.',
      'send-email-verification-code-failed': 'Error sending email verification code, please try again.'
    }
  }
});

i18n.map('ja', {
  enroll: {
    step: {
      1: 'ステップ 1',
      2: 'ステップ 2',
      3: 'ステップ 3',
      4: 'ステップ 4'
    },
    next: '次へ',
    back: '戻る',
    confirm: '送信',

    stepResidenceSelection: '登録フォーム・居住国(ステップ1/4)',
    stepContactInformation: '登録フォーム・ユーザーの情報(ステップ2/4)',
    stepAssignments: '登録フォーム・規約への同意(ステップ3/4)',
    stepDocuments: '登録フォーム・必要書類のアップロード(ステップ4/4)',

    residenceSelection: {
      residenceCountry: '居住国/거주 국가/居住地/Your Country of Residence',
      language: '言語/사용 언어/使用語言/Your Language',
      agreedToDocumentsInEnglish: '全ての規約事項が英語で記載されていることを理解します'
    },
    accountType: 'アカウントの種類',
    accountTypePersonal: '個人',
    accountTypeCompany: '法人',
    name: '名',
    surname: '姓',
    companyName: '法人名(株式会社' + getCompanyInfoByLanguage('ja').companyName + 'コーポレーション)',
    registrationDate: '法人設立年月日',
    email: 'メールアドレス (yamada_taro@abc.com)',
    emailCheck: 'メールアドレス(確認用・同じメールアドレスを再入力してください)',
    emailMismatch: '入力していただいたメールアドレスが一致しません。',
    emailVerificationCode: 'Eメール認証コード',
    sendEmailVerificationCode: 'コードを受信する',
    reSendEmailVerificationCode: 'クリックしてコードを再受信する',
    emailVerificationCodeSent: '{$1} にEメール認証コードを記載したEメールをお送りしました。60秒以内に受信されない場合は、別のEメールアドレスを使用してご登録ください(迷惑メールフォルダもご確認ください)。',
    confirmEmailVerificationCode: 'コードを確認する',
    resetEmail: 'Eメールをリセットする',
    domainBlacklisted: '登録できないドメインです',
    notInWhiltelist: '警告　メールが届かない場合は迷惑メールフォルダをご確認ください。',
    phone: '電話番号 (03-1234-5678)',
    birthdate: '生年月日',
    zip: '郵便番号 (123-4567)',
    zipApiFail: 'この郵便番号は正しいですか。',
    state: '都道府県 (大阪府)',
    city: '市区郡 (大阪市) (区は東京23区の場合のみ) ',
    address: 'それ以降の住所 (マンション、アパート等の場合はマンション名、部屋番号までご入力ください)',
    paymentMethod: '支払い方法',
    paymentMethodBank: '銀行振り込み',
    paymentMethodBtc: 'ビットコイン',
    units: '予定している' + getProductNameByLanguage('ja') + '交換金額を米ドル換算で入力して下さい。',
    codeCheckboxLabel: '利用規約に同意する',
    riskPolicyCheckboxLabel: 'リスク説明に同意する',
    privacyCheckboxLabel: "個人情報保護方針に同意する",
    governmentId: '身分証明書',

    documentUpload: {
      subtitle: getCompanyInfoByLanguage('ja').companyName + 'の承認を受ける為には、本人確認が必要です。本人確認に必要な書類の詳細は <a target="_blank" href="' + getCompanyInfoByLanguage('en').urls.identification + '">' + getCompanyInfoByLanguage('en').urls.identification + '</a> を参照してください。（書類が正しくない場合は、承認作業に大幅な遅れが出る場合がございます）',
      notUploaded: 'ファイルがアップロードされていません。',
      uploadWarning: {
        JP: 'マイナンバーカードはアップロードしないで下さい',
      },
      uploadWarningCheckbox: {
        JP: '私はマイナンバーカードをアップロードしていません',
      }
    },

    errors: {
      'email-exists': '既に登録されているメールアドレスです。他のメールアドレスをご使用下さい。',
      'idDocumentNumber-exists': 'この身分証番号は既に存在しています。',
      'invalid-ref-code': 'この紹介用URLは無効です。',
      'role-not-allowed': '{$1}ユーザーを作成できません。',
      'role-invalid': '無効な操作です。',
      'email-verification-invalid-code': '無効なEメール認証コードです',
      'send-email-verification-code-failed': 'Error:もう一度Eメール認証コードを送信してください'
    }
  }
});

i18n.map('ko', {
  enroll: {
    step: {
      1: '스텝 1',
      2: '스텝 2',
      3: '스텝 3',
      4: '스텝 4',
    },
    next: '다음으로',
    back: '돌아가기',
    confirm: '송신',
    upload: '파일 선택',
    remove: '삭제',

    stepResidenceSelection: '등록 폼, 거주 지역 선택（스텝 1/4）',
    stepContactInformation: '등록 폼, 연락처 정보（스텝 2/4）',
    stepAssignments: '등록 폼, 이용 약관 동의（스텝 3/4）',
    stepDocuments: '등록 폼, 필요서류 업로드（스텝 4/4）',

    residenceSelection: {
      residenceCountry: '居住国/거주 국가/居住地/Your Country of Residence',
      language: '言語/사용 언어/使用語言/Your Language',
      agreedToDocumentsInEnglish: '모든 법률 서류가 영어로만 제공되는 것에 동의합니다',
    },
    accountType: '계정 종류',
    accountTypePersonal: '개인',
    accountTypeCompany: '법인',
    name: '이름',
    surname: '성',
    companyName: '법인명(주식회사 ' +  getCompanyInfoByLanguage('ko').companyName + ' 코퍼레이션)',
    registrationDate: '법인 설립 연월일',
    email: '메일 어드레스',
    emailCheck: '메일 어드레스(확인용, 동일한 메일 어드레스를 다시 입력하십시오.)',
    emailMismatch: '입력해 주신 메일 어드레스가 일치하지 않습니다.',
    emailVerificationCode: '메일 어드레스 확인 코드',
    sendEmailVerificationCode: '코드를 수신',
    reSendEmailVerificationCode: '코드를 클릭하여 재송신',
    emailVerificationCodeSent: '메일 인증 코드를 기재 한 메일을 보냈습니다. {$1} 60초 이내에 새 메일 어드레스로 수신이 없는 경우, 다른 메일 어드레스를 등록하십시오. (스팸메일함도 확인해 주십시오.)',
    confirmEmailVerificationCode: '코드를 확인',
    resetEmail: '메일 리셋',
    domainBlacklisted: '등록할 수 없는 도메인입니다.',
    notInWhiltelist: '경고. 메일이 도착하지 않을 경우, 스팸 메일함을 확인해 주십시오.',
    phone: '전화번호(03-1234-5678)',
    birthdate: '생년월일',
    zip: '우편번호(123-45)',
    zipApiFail: '정확한 우편번호를 입력하셨습니까?',
    state: '(이 항목은 자동입력입니다.)',
    city: '거주 지역(서울특별시, 부산광역시, 충청남도, 전라북도 등)',
    address: '그 이외 상세 주소(아파트, 맨션의 경우, 동과 호수를 적어 주십시오.)',
    paymentMethod: '결제 방법',
    paymentMethodBank: '은행 송금',
    paymentMethodBtc: '비트코인',
    units: '예정 하고 있는 ' + getProductNameByLanguage('ko') + ' 교환 금액을 미국 달러로 환산하여 입력해 주십시오.',
    codeCheckboxLabel: '내용에 동의함',
    riskPolicyCheckboxLabel: '내용에 동의함',
    privacyCheckboxLabel: '개인 정보 취급방침에 동의함',
    governmentId: '신분증명서',

    documentUpload: {
      subtitle: getCompanyInfoByLanguage('ko').companyName + '의 승인을 받기 위해서는 본인 확인이 필요합니다. 본인 확인에 필요한 서류의 상세 내용에 관해서는 <a target="_blank" href="' + getCompanyInfoByLanguage('ko').urls.identification + '></a>홈페이지를 참고해 주십시오.',
      notUploaded: '파일이 업로드되지 않았습니다.',
      uploadWarning: {
        JP: '마이 넘버 카드는 업로드하지 마십시오',
      },
      uploadWarningCheckbox: {
        JP: '마이 넘버 카드를 업로드하지 않음에 동의 (일본 거주자만 해당)',
      }
    },

    errors: {
      'email-exists': '같은 메일 어드레스가 이미 존재합니다. 다른 메일 어드레스를 이용해 주십시오.',
      'idDocumentNumber-exists': '신분증명서가 이미 존재합니다.',
      'invalid-ref-code': '초대 코드가 무효입니다.',
      'role-not-allowed': '{$1}이용자를 작성할 수 없습니다.',
      'role-invalid': '무효한 동작입니다.',
      'email-verification-invalid-code': '무효한 메일 승인 코드입니다.',
      'send-email-verification-code-failed': 'Error: 메일 승인 코드를 다시 송신해주십시오.'
    }
  }
});

i18n.map('zh', {
  enroll: {
    step: {
      1: '步骤 1',
      2: '步骤 2',
      3: '步骤 3',
      4: '步骤 4',
    },
    next: '下一步',
    back: '返回',
    confirm: '确认',
    upload: '选择档案',
    remove: '删除',

    stepResidenceSelection: '注册页面·选择居住国家(步骤1/4)',
    stepContactInformation: '注册页面·个人资料(步骤2/4)',
    stepAssignments: '注册页面·同意规条(步骤3/4)',
    stepDocuments: '注册页面·上传所需文件(步骤4/4)',

    residenceSelection: {
      residenceCountry: '居住国/거주 국가/居住地/Your Country of Residence',
      language: '言語/사용 언어/使用語言/Your Language',
      agreedToDocumentsInEnglish: '我明白所有法律文件和条约只有英文版本'
    },
    accountType: '帐号种类',
    accountTypePersonal: '个人',
    accountTypeCompany: '公司',
    name: '名',
    surname: '姓',
    companyName: '公司名称',
    registrationDate: '公司成立日期',
    email: '电邮',
    emailCheck: '电邮(确认用・请再次输入相同电邮)',
    emailMismatch: '再次输入的电邮不一致',
    emailVerificationCode: '电邮认证码',
    sendEmailVerificationCode: '发送电邮验证码',
    reSendEmailVerificationCode: '点击以再次发送验证码',
    emailVerificationCodeSent: '记载电邮认证码的邮件已发送至 {$1}。如60秒内未能收到，请确认垃圾邮箱。均确认没收到时请用另一电邮地址重试。',
    confirmEmailVerificationCode: '确认验证码',
    resetEmail: '重设电邮',
    domainBlacklisted: '无法注册的域名',
    notInWhiltelist: '提醒：若未收到信件烦请至垃圾信件夹确认',
    phone: '电话',
    birthdate: '出生年月日',
    zip: '邮递区号',
    zipApiFail: '邮递区号正确吗？',
    state: '省',
    city: '市',
    address: '地址(请必须填写至公寓名称，房屋号码)',
    paymentMethod: '付款方式',
    paymentMethodBank: '银行汇款',
    paymentMethodBtc: '比特币',
    units: '请输入以美金计算欲兑换的艾达币金额',
    codeCheckboxLabel: '同意内容',
    riskPolicyCheckboxLabel: '同意内容',
    privacyCheckboxLabel: '同意个人资料保护方针',
    governmentId: '身分证明文件',

    documentUpload: {
      subtitle: '必须进行确认本人程序以完成' + getCompanyInfoByLanguage('zh').companyName + '认证工作。确认本人程序所需要的文件详细请参考<a target="_blank" href="' + getCompanyInfoByLanguage('zh').urls.identification + '">' + getCompanyInfoByLanguage('zh').urls.identification + '</a>。(提交的文件若有不符，将有机会导致认证工作延误)',
      notUploaded: '档案未上传!',
      uploadWarning: {
        JP: '请不要上载您的My Number文件(只限日本居住者)',
      },
      uploadWarningCheckbox: {
        JP: '请点击同意没有上载My Number文件(只限日本居住者)',
      }
    },

    errors: {
      'email-exists': '此电邮地址已使用，请用其他电邮地址注册。',
      'idDocumentNumber-exists': '此身份文件号码已存在',
      'invalid-ref-code': '介绍用连结不正确',
      'role-not-allowed': '未能注册{$1}帐户 ',
      'role-invalid': '此操作不正确',
      'email-verification-invalid-code': '电邮认证码无效',
      'send-email-verification-code-failed': '电邮认证码未能送出，烦请重试。'
    }
  }
});
